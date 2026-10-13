package com.foodhub.config;

import com.foodhub.entity.*;
import com.foodhub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() >= 8 && restaurantRepository.count() >= 25 && userRepository.count() >= 3) {
            return; // Data already populated
        }

        System.out.println("==================================================");
        System.out.println("FOODHUB: SEEDING 25+ OUTLETS & PRE-CONFIGURED USERS...");
        System.out.println("==================================================");

        // Clear existing data to ensure clean seed
        foodItemRepository.deleteAll();
        restaurantRepository.deleteAll();
        categoryRepository.deleteAll();

        // 1. Seed Categories
        Category biryani = categoryRepository.save(Category.builder().name("Biryani").description("Authentic aromatic dum biryanis").build());
        Category pizza = categoryRepository.save(Category.builder().name("Pizza & Fast Food").description("Cheesy pizzas, burgers & fries").build());
        Category snacks = categoryRepository.save(Category.builder().name("Sweets & Snacks").description("Crispy snacks, chaats & sweets").build());
        Category southIndian = categoryRepository.save(Category.builder().name("South Indian").description("Crispy dosas, fluffy idlis & vada").build());
        Category northIndian = categoryRepository.save(Category.builder().name("North Indian").description("Curries, paneer & tandoori naans").build());
        Category chinese = categoryRepository.save(Category.builder().name("Chinese & Noodles").description("Hakka noodles, Manchurian & momos").build());
        Category desserts = categoryRepository.save(Category.builder().name("Desserts & Bakery").description("Cakes, donuts, waffles & sweets").build());
        Category beverages = categoryRepository.save(Category.builder().name("Beverages & Ice Creams").description("Juices, shakes, teas & ice creams").build());

        // 2. Pre-Configured Users (Customer, Owner, Admin)
        User owner = userRepository.findByUsername("owner1").orElseGet(() -> {
            User newOwner = User.builder()
                    .username("owner1")
                    .email("owner@foodhub.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("9876543210")
                    .address("FC Road, Pune")
                    .role(Role.OWNER)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
            return userRepository.save(newOwner);
        });

        User customer = userRepository.findByUsername("customer1").orElseGet(() -> {
            User newCustomer = User.builder()
                    .username("customer1")
                    .email("customer@foodhub.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("9876543211")
                    .address("Flat 402, Royal Residency, FC Road, Pune")
                    .role(Role.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
            User savedCust = userRepository.save(newCustomer);
            cartRepository.save(Cart.builder().customer(savedCust).build());
            return savedCust;
        });

        userRepository.findByUsername("admin1").orElseGet(() -> {
            User newAdmin = User.builder()
                    .username("admin1")
                    .email("admin@foodhub.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("9876543212")
                    .address("FC Road, Pune")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
            return userRepository.save(newAdmin);
        });

        // 3. Define 25 Outlets Data
        String[][] outletsData = {
            {"Bawarchi Hyderabadi Biryani", "Famous Hyderabadi Dum Biryani & Kebabs", "Camp, Pune", "9823011101", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500"},
            {"Haldiram's Sweets & Snacks", "Premium Indian Snacks, Sweets & Street Food", "Deccan, Pune", "9823011102", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500"},
            {"Domino's Gourmet Pizza", "Hot & Fresh Crust Pizzas & Pasta", "Koregaon Park, Pune", "9823011103", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"},
            {"Saravana Bhavan South Indian", "Authentic Pure Veg South Indian Tiffin", "JM Road, Pune", "9823011104", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500"},
            {"Chai Point & Bakery Treats", "Artisanal Teas, Coffee & Fresh Bakes", "Viman Nagar, Pune", "9823011105", "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500"},
            {"Mainland Wok & Dumplings", "Sizzling Noodles, Rice Bowls & Dim Sums", "Kothrud, Pune", "9823011106", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"},
            {"Burger King & Fries", "Flame Grilled Burgers & Crispy Fries", "Aundh, Pune", "9823011107", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"},
            {"Baskin Robbins Ice Creams", "World's Favorite 31 Flavors Ice Creams", "Baner, Pune", "9823011108", "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500"},
            {"Oven Story Cheese Pizza", "Standout Cheese Overflowing Pizzas", "Kalyani Nagar, Pune", "9823011109", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500"},
            {"Paradise Biryani House", "Royal Mughlai Biryani & Tandoori Starters", "Hadapsar, Pune", "9823011110", "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500"},
            {"Kailash Parbat Chaat & Sweets", "Famous Mumbai Chaats & North Thali", "FC Road, Pune", "9823011111", "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500"},
            {"Behrouz Royal Biryani", "Secret Royal Recipe Persian Biryani", "Magarpatta, Pune", "9823011112", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500"},
            {"Subway Fresh Sandwiches", "Healthy Custom Sub Sandwiches & Salads", "Kharadi, Pune", "9823011113", "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500"},
            {"KFC Fried Chicken & Wings", "Crispy Secret Recipe Fried Chicken", "Pimple Saudagar, Pune", "9823011114", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500"},
            {"Natural Ice Creams & Shakes", "100% Real Fruit Artisan Ice Creams", "Law College Road, Pune", "9823011115", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500"},
            {"Wow! Momo & Steam Dumplings", "Steamed, Fried & Pan Tossed Momos", "Phoenix Mall, Pune", "9823011116", "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500"},
            {"Tibbs Frankie & Wrap Corner", "Original Mumbai Spiced Frankie Rolls", "SB Road, Pune", "9823011117", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500"},
            {"Mad Over Donuts (MOD)", "Glazed Gourmet Donuts & Coffee Bakes", "Seasons Mall, Pune", "9823011118", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500"},
            {"Cream Stone Ice Cream Studio", "Concept Hand-Churned Ice Cream Creations", "Camp, Pune", "9823011119", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500"},
            {"Bikanervala Sweets & Thali", "Traditional North Indian Sweets & Snacks", "Chinchwad, Pune", "9823011120", "https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=500"},
            {"Faasos Signature Rolls", "Delicious Paratha Wraps & Bowls", "Wakad, Pune", "9823011121", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500"},
            {"Sweet Truth Cakes & Desserts", "Decadent Layer Cakes & Pastries", "Bavdhan, Pune", "9823011122", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500"},
            {"Wendy's Smash Burgers", "Juicy Square Beef & Paneer Burgers", "Pimple Nilakh, Pune", "9823011123", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500"},
            {"Giani's Kulfi & Falooda", "Rich Rabri Kulfi & Ice Cream Sundaes", "Swargate, Pune", "9823011124", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500"},
            {"The Belgian Waffle Co.", "Warm Crispy Waff-wiches & Shakes", "Kothrud, Pune", "9823011125", "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500"}
        };

        // Standard Food Template Lists to create 10+ items per outlet
        String[][] itemTemplates = {
            {"[Veg] Special Paneer Tikka Biryani", "Charcoal grilled paneer cubes layered with fragrant saffron basmati rice.", "280.0", "Biryani"},
            {"[Non-Veg] Hyderabadi Chicken Dum Biryani", "Marinated succulent chicken slow cooked in dum basmati rice.", "340.0", "Biryani"},
            {"[Non-Veg] Mutton Seekh Kebab (4 Pcs)", "Spiced minced lamb skewers grilled over charcoal tandoor.", "390.0", "North Indian"},
            {"[Veg] Butter Garlic Naan (2 Pcs)", "Freshly baked tandoori naan brushed with rich butter and garlic.", "80.0", "North Indian"},
            {"[Veg] Dahi Samosa Chaat", "Crispy samosas topped with sweetened yogurt and tamarind chutney.", "130.0", "Sweets & Snacks"},
            {"[Veg] Special Cheese Burst Pizza", "Loaded double mozzarella cheese melted over tangy tomato sauce.", "399.0", "Pizza & Fast Food"},
            {"[Veg] Ghee Roast Masala Dosa", "Crispy golden dosa roasted in pure desi ghee with potato masala.", "160.0", "South Indian"},
            {"[Veg] Steamed Button Idli (4 Pcs)", "Soft fluffy rice cakes served with lentil sambar & coconut chutney.", "90.0", "South Indian"},
            {"[Veg] Ginger Elaichi Kulhad Chai", "Fresh milk tea brewed with crushed cardamom and ginger.", "120.0", "Beverages & Ice Creams"},
            {"[Veg] Choco Lava Molten Cake", "Warm chocolate cake with molten oozing chocolate center.", "110.0", "Desserts & Bakery"}
        };

        // 4. Create 25 Outlets & 10 Items Each (250+ Items total)
        for (int i = 0; i < outletsData.length; i++) {
            String[] o = outletsData[i];
            Restaurant r = restaurantRepository.save(Restaurant.builder()
                    .name(o[0])
                    .description(o[1])
                    .address(o[2])
                    .phone(o[3])
                    .logoUrl(o[4])
                    .owner(owner)
                    .isApproved(true)
                    .isActive(true)
                    .build());

            // Add 10 items for this specific outlet
            for (int j = 0; j < itemTemplates.length; j++) {
                String[] item = itemTemplates[j];
                String itemName = item[0] + " - " + r.getName().split(" ")[0];
                double price = Double.parseDouble(item[2]) + (i * 5); // Variety pricing
                Category cat = biryani;
                if (item[3].equals("Pizza & Fast Food")) cat = pizza;
                else if (item[3].equals("Sweets & Snacks")) cat = snacks;
                else if (item[3].equals("South Indian")) cat = southIndian;
                else if (item[3].equals("North Indian")) cat = northIndian;
                else if (item[3].equals("Chinese & Noodles")) cat = chinese;
                else if (item[3].equals("Desserts & Bakery")) cat = desserts;
                else if (item[3].equals("Beverages & Ice Creams")) cat = beverages;

                foodItemRepository.save(FoodItem.builder()
                        .name(itemName)
                        .description(item[1])
                        .price(price)
                        .imageUrl(r.getLogoUrl())
                        .isAvailable(true)
                        .category(cat)
                        .restaurant(r)
                        .build());
            }
        }

        // 4. Pre-seed initial Wishlist & Cart items for customer1
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        if (!allRestaurants.isEmpty()) {
            try {
                // Seed 2 favorites
                wishlistRepository.save(Wishlist.builder().customer(customer).restaurant(allRestaurants.get(0)).build());
                if (allRestaurants.size() > 2) {
                    wishlistRepository.save(Wishlist.builder().customer(customer).restaurant(allRestaurants.get(2)).build());
                }

                // Seed 2 cart items from outlet 1
                Cart custCart = cartRepository.findByCustomer(customer)
                        .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));
                List<FoodItem> r1Items = foodItemRepository.findByRestaurant(allRestaurants.get(0));
                if (r1Items.size() >= 2) {
                    cartItemRepository.save(CartItem.builder().cart(custCart).foodItem(r1Items.get(0)).quantity(2).build());
                    cartItemRepository.save(CartItem.builder().cart(custCart).foodItem(r1Items.get(1)).quantity(1).build());
                }
            } catch (Exception e) {
                // Ignore duplicate seed errors
            }
        }

        System.out.println("==================================================");
        System.out.println("FOODHUB: SEEDED 25 OUTLETS, 250+ DISHES, CART & WISHLIST SUCCESSFULLY!");
        System.out.println("==================================================");
    }
}
