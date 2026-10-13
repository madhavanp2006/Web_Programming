package com.foodhub.service;

import com.foodhub.dto.*;
import com.foodhub.entity.*;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public OrderResponse placeOrder(String username, OrderRequest request) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new BadRequestException("No cart found for user"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        Long rId = request.getRestaurantId();
        if (rId == null) {
            rId = cartItems.get(0).getFoodItem().getRestaurant().getId();
        }

        Restaurant restaurant = restaurantRepository.findById(rId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Validate all cart items belong to this restaurant
        for (CartItem item : cartItems) {
            if (!item.getFoodItem().getRestaurant().getId().equals(restaurant.getId())) {
                throw new BadRequestException("Items in cart do not belong to the selected restaurant");
            }
        }

        double subtotal = cartItems.stream()
                .mapToDouble(item -> item.getFoodItem().getPrice() * item.getQuantity())
                .sum();

        // Calculate discount based on coupons
        double discount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().toUpperCase().trim();
            if (code.equals("SWIGGYIT")) {
                discount = Math.min(subtotal * 0.50, 120.0);
            } else if (code.equals("ZOMATO50")) {
                discount = Math.min(subtotal * 0.50, 100.0);
            } else if (code.equals("SNACKTIME")) {
                discount = 50.0;
            } else if (code.equals("FREEDEL")) {
                discount = 35.0;
            } else if (code.equals("WELCOME10")) {
                discount = subtotal * 0.10;
            } else if (code.equals("FOODHUB50")) {
                discount = Math.min(subtotal * 0.50, 150.0);
            }
        }

        double totalAmount = Math.max(0.0, subtotal - discount);

        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method. Use COD or CARD");
        }

        // Create Order
        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Map CartItems to OrderItems
        List<OrderItemDto> itemDtos = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .foodItem(cartItem.getFoodItem())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getFoodItem().getPrice()) // Snapshot price
                    .build();

            orderItemRepository.save(orderItem);

            itemDtos.add(OrderItemDto.builder()
                    .id(orderItem.getId())
                    .foodItemId(orderItem.getFoodItem().getId())
                    .foodItemName(orderItem.getFoodItem().getName())
                    .foodItemImageUrl(orderItem.getFoodItem().getImageUrl())
                    .quantity(orderItem.getQuantity())
                    .price(orderItem.getPrice())
                    .build());
        }

        // Create Payment transaction
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        String transactionId = null;

        if (paymentMethod == PaymentMethod.CARD) {
            // MOCK CARD PAYMENT: Immediately successful
            paymentStatus = PaymentStatus.PAID;
            transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .paymentAmount(totalAmount)
                .transactionId(transactionId)
                .build();

        paymentRepository.save(payment);

        // Update order status if payment succeeded
        if (paymentStatus == PaymentStatus.PAID) {
            savedOrder.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(savedOrder);
        }

        // Clear the cart
        cartService.clearCart(cart);

        return mapToResponse(savedOrder, itemDtos);
    }

    public List<OrderResponse> getCustomerOrders(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return orderRepository.findByCustomer(customer).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getRestaurantOrders(Long restaurantId, String username) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own this restaurant");
        }

        return orderRepository.findByRestaurant(restaurant).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderDetails(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Authorize access: must be customer who placed it, owner of the restaurant, or an admin
        boolean isCustomer = order.getCustomer().getId().equals(user.getId());
        boolean isOwner = order.getRestaurant().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isCustomer && !isOwner && !isAdmin) {
            throw new BadRequestException("Access denied to view this order");
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatusByOwner(Long orderId, String statusStr, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getRestaurant().getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own the restaurant for this order");
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }

        order.setStatus(newStatus);

        // If marked delivered and payment was COD, set payment paid
        if (newStatus == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            // Update associated payment record
            paymentRepository.findByOrder(order).ifPresent(p -> {
                p.setPaymentStatus(PaymentStatus.PAID);
                p.setTransactionId("COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                paymentRepository.save(p);
            });
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUsername().equals(username)) {
            throw new BadRequestException("You did not place this order");
        }

        // Can only cancel if status is PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be cancelled once it is accepted or preparing");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    public Map<String, Object> getOrderInvoice(Long orderId, String username) {
        OrderResponse order = getOrderDetails(orderId, username);

        Map<String, Object> invoice = new HashMap<>();
        invoice.put("invoiceNo", "INV-FH-" + order.getId());
        invoice.put("orderId", order.getId());
        invoice.put("restaurantName", order.getRestaurantName());
        invoice.put("customerName", order.getCustomerUsername());
        invoice.put("deliveryAddress", order.getDeliveryAddress());
        invoice.put("paymentMethod", order.getPaymentMethod());
        invoice.put("paymentStatus", order.getPaymentStatus());
        invoice.put("totalAmount", order.getTotalAmount());
        invoice.put("orderDate", order.getCreatedAt());
        invoice.put("items", order.getItems());

        return invoice;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<OrderItemDto> itemDtos = items.stream().map(i -> OrderItemDto.builder()
                .id(i.getId())
                .foodItemId(i.getFoodItem().getId())
                .foodItemName(i.getFoodItem().getName())
                .foodItemImageUrl(i.getFoodItem().getImageUrl())
                .quantity(i.getQuantity())
                .price(i.getPrice())
                .build()).collect(Collectors.toList());

        return mapToResponse(order, itemDtos);
    }

    private OrderResponse mapToResponse(Order order, List<OrderItemDto> items) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerUsername(order.getCustomer().getUsername())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .deliveryAddress(order.getDeliveryAddress())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
