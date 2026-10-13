import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Table, Modal, Tag, Spin, Empty, message } from 'antd';
import { HistoryOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/orders');
      // Sort orders by date descending
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (e) {
      message.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.post(`/customer/orders/${orderId}/cancel`);
      message.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      message.error(error.response?.data?.message || 'Could not cancel order');
    }
  };

  const trackOrder = (order) => {
    setTrackingOrder(order);
    setTrackingModalOpen(true);
  };

  const downloadInvoice = async (order) => {
    try {
      const res = await api.get(`/customer/orders/${order.id}/invoice`);
      const data = res.data;

      // Generate text invoice content
      let content = `==================================================\n`;
      content += `               FOODHUB OFFICIAL INVOICE          \n`;
      content += `==================================================\n`;
      content += `Invoice No      : ${data.invoiceNo}\n`;
      content += `Order ID        : ${data.orderId}\n`;
      content += `Order Date      : ${new Date(data.orderDate).toLocaleString()}\n`;
      content += `Payment Method  : ${data.paymentMethod}\n`;
      content += `Payment Status  : ${data.paymentStatus}\n`;
      content += `--------------------------------------------------\n`;
      content += `Restaurant Info : ${data.restaurantName}\n`;
      content += `Customer Username: ${data.customerName}\n`;
      content += `Delivery Address: ${data.deliveryAddress}\n`;
      content += `==================================================\n`;
      content += `ITEMS ORDERED:\n`;
      content += `--------------------------------------------------\n`;
      
      data.items.forEach(item => {
        const lineTotal = item.price * item.quantity;
        content += `${item.foodItemName.padEnd(25)} x ${item.quantity.toString().padEnd(2)} @ $${item.price.toFixed(2).padEnd(6)} = $${lineTotal.toFixed(2)}\n`;
      });
      
      content += `==================================================\n`;
      content += `TOTAL AMOUNT PAID: $${data.totalAmount.toFixed(2)}\n`;
      content += `==================================================\n`;
      content += `Thank you for ordering with FoodHub!\n`;
      content += `==================================================\n`;

      // Trigger standard browser file download
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FoodHub_Invoice_${order.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Invoice downloaded successfully!');
    } catch (e) {
      message.error('Failed to generate invoice');
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'PREPARING': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'blue';
      case 'PREPARING': return 'purple';
      case 'OUT_FOR_DELIVERY': return 'orange';
      case 'DELIVERED': return 'success';
      case 'REJECTED':
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', marginBottom: '24px' }}>
          <HistoryOutlined /> Order History & Tracking
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : orders.length === 0 ? (
          <Empty description="No orders placed yet. Start ordering now!" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => (
              <Card
                key={order.id}
                style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{order.restaurantName}</span>
                    <Tag color={getStatusTagColor(order.status)}>{order.status}</Tag>
                  </div>
                }
                actions={[
                  <Button type="link" onClick={() => trackOrder(order)}>Track Live</Button>,
                  <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadInvoice(order)}>Invoice</Button>,
                  order.status === 'PENDING' ? (
                    <Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => handleCancelOrder(order.id)}>
                      Cancel Order
                    </Button>
                  ) : null
                ].filter(Boolean)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '13px' }}>ORDERED ON</div>
                    <div style={{ fontWeight: 600, color: '#4B5563' }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '13px' }}>TOTAL PAID</div>
                    <div style={{ fontWeight: 800, color: '#FF6B00', fontSize: '16px' }}>${order.totalAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '13px' }}>PAYMENT</div>
                    <div style={{ fontWeight: 600 }}>{order.paymentMethod} ({order.paymentStatus})</div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '13px' }}>DELIVER TO</div>
                    <div style={{ fontWeight: 500, color: '#4B5563' }}>{order.deliveryAddress}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '12px', marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>Items ordered:</div>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', padding: '4px 0' }}>
                      <span>{item.foodItemName} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Live Tracking Modal */}
      <Modal
        title="Live Order Tracking Timeline"
        open={trackingModalOpen}
        onCancel={() => setTrackingModalOpen(false)}
        footer={null}
        width={550}
      >
        {trackingOrder && (
          <div style={{ padding: '20px 0' }}>
            <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>
              Tracking Order #{trackingOrder.id} from {trackingOrder.restaurantName}
            </h4>

            {trackingOrder.status === 'CANCELLED' || trackingOrder.status === 'REJECTED' ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>
                    This order has been {trackingOrder.status.toLowerCase()}.
                  </span>
                }
              />
            ) : (
              <Steps
                direction="vertical"
                current={getStatusStep(trackingOrder.status)}
                status="process"
                style={{ maxWidth: '400px', margin: '0 auto' }}
              >
                <Steps.Step
                  title="Order Placed"
                  description="We have received your order details."
                  icon={<ClockCircleOutlined />}
                />
                <Steps.Step
                  title="Confirmed"
                  description="The restaurant has confirmed your order."
                />
                <Steps.Step
                  title="Preparing"
                  description="Chef is preparing your delicious meal."
                />
                <Steps.Step
                  title="Out for Delivery"
                  description="Delivery partner is on the way to your door."
                />
                <Steps.Step
                  title="Delivered"
                  description="Order completed. Enjoy your food!"
                />
              </Steps>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
