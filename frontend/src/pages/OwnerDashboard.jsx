import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Tabs, Form, Input, Select, Switch, Space, Modal, Spin, message } from 'antd';
import { ShoppingOutlined, LineChartOutlined, DollarOutlined, BarChartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import api from '../services/api';

const { TabPane } = Tabs;

// Mock Sales Chart data for premium visual feel
const mockMonthlySales = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

const mockDailyOrders = [
  { name: 'Mon', orders: 12 },
  { name: 'Tue', orders: 19 },
  { name: 'Wed', orders: 10 },
  { name: 'Thu', orders: 17 },
  { name: 'Fri', orders: 25 },
  { name: 'Sat', orders: 32 },
  { name: 'Sun', orders: 28 },
];

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const [form] = Form.useForm();
  const [menuForm] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const resCat = await api.get('/public/categories');
      setCategories(resCat.data);

      // 2. Fetch Restaurants
      const resRest = await api.get('/owner/restaurants');
      setRestaurants(resRest.data);

      if (resRest.data.length > 0) {
        const active = resRest.data[0];
        setActiveRestaurant(active);
        await fetchRestaurantDependentData(active.id);
      }
    } catch (e) {
      message.error('Failed to load initial dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantDependentData = async (restaurantId) => {
    try {
      // Fetch stats
      const resStats = await api.get('/owner/restaurants/dashboard');
      setStats(resStats.data);

      // Fetch Menu Items
      const resMenu = await api.get(`/owner/food-items/restaurant/${restaurantId}`);
      setMenuItems(resMenu.data);

      // Fetch Orders
      const resOrders = await api.get(`/owner/orders/restaurant/${restaurantId}`);
      setOrders(resOrders.data.sort((a, b) => b.id - a.id));

    } catch (e) {
      message.error('Failed to fetch restaurant menu or orders');
    }
  };

  // Switch between restaurants if owner owns multiple
  const handleSelectRestaurant = async (rest) => {
    setActiveRestaurant(rest);
    setLoading(true);
    await fetchRestaurantDependentData(rest.id);
    setLoading(false);
  };

  // Add / Edit Restaurant Profile
  const handleRestaurantSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (activeRestaurant) {
        // Edit Mode
        const res = await api.put(`/owner/restaurants/${activeRestaurant.id}`, values);
        message.success('Restaurant profile updated successfully!');
        setRestModalOpen(false);
        fetchInitialData();
      } else {
        // Create Mode
        const res = await api.post('/owner/restaurants', values);
        message.success('Restaurant registered! Waiting for administrator approval.');
        setRestModalOpen(false);
        fetchInitialData();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Process order status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/owner/orders/${orderId}/status?status=${newStatus}`);
      message.success(`Order marked as: ${newStatus}`);
      if (activeRestaurant) {
        fetchRestaurantDependentData(activeRestaurant.id);
      }
    } catch (error) {
      message.error('Status update failed');
    }
  };

  // Add / Edit Menu Items
  const handleMenuItemSubmit = async (values) => {
    setActionLoading(true);
    try {
      const payload = {
        ...values,
        restaurantId: activeRestaurant.id,
        isAvailable: values.isAvailable ?? true
      };

      if (editingMenuItem) {
        await api.put(`/owner/food-items/${editingMenuItem.id}`, payload);
        message.success('Menu item updated!');
      } else {
        await api.post('/owner/food-items', payload);
        message.success('New menu item added!');
      }
      setMenuModalOpen(false);
      fetchRestaurantDependentData(activeRestaurant.id);
    } catch (error) {
      message.error('Failed to save menu item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await api.delete(`/owner/food-items/${id}`);
      message.success('Menu item deleted');
      fetchRestaurantDependentData(activeRestaurant.id);
    } catch (e) {
      message.error('Failed to delete item');
    }
  };

  const openMenuModal = (item = null) => {
    setEditingMenuItem(item);
    if (item) {
      menuForm.setFieldsValue({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
      });
    } else {
      menuForm.resetFields();
    }
    setMenuModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Top Navbar */}
      <header style={{
        padding: '16px 32px',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: '#FF6B00', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>FH</div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#FF6B00' }}>FoodHub <span style={{ color: '#1F2937' }}>Partner</span></span>
        </div>

        <Space size="middle">
          {restaurants.length > 0 && (
            <Select
              value={activeRestaurant?.id}
              style={{ width: 220 }}
              onChange={(val) => handleSelectRestaurant(restaurants.find(r => r.id === val))}
            >
              {restaurants.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name} {!r.isApproved && '(Pending Admin Approval)'}
                </Select.Option>
              ))}
            </Select>
          )}

          <Button type="primary" style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }} onClick={() => {
            setEditingMenuItem(null);
            form.resetFields();
            if (activeRestaurant) {
              form.setFieldsValue({
                name: activeRestaurant.name,
                description: activeRestaurant.description,
                address: activeRestaurant.address,
                phone: activeRestaurant.phone,
                logoUrl: activeRestaurant.logoUrl
              });
            }
            setRestModalOpen(true);
          }}>
            {activeRestaurant ? 'Edit Restaurant Info' : 'Register Restaurant'}
          </Button>

          <Button onClick={handleLogout} danger>Logout</Button>
        </Space>
      </header>

      {!activeRestaurant ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <Card style={{ maxWidth: '500px', textAlign: 'center', borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            <ShopOutlined style={{ fontSize: '48px', color: '#FF6B00', marginBottom: '16px' }} />
            <h2>Welcome to FoodHub Partners!</h2>
            <p style={{ color: '#6B7280', margin: '12px 0 24px 0' }}>
              You don't have a restaurant registered under your account yet. Let's register your restaurant to list food items and accept online orders.
            </p>
            <Button type="primary" size="large" style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }} onClick={() => {
              form.resetFields();
              setRestModalOpen(true);
            }}>
              Register Restaurant
            </Button>
          </Card>
        </div>
      ) : (
        <div style={{ padding: '24px 32px', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* Approved Check Notice */}
          {!activeRestaurant.isApproved && (
            <Card style={{ borderLeft: '6px solid #F59E0B', marginBottom: '24px', borderRadius: '8px' }}>
              <strong>Under Approval:</strong> Your restaurant profile is pending review by the system administrator. It will not appear in customer searches until approved.
            </Card>
          )}

          {/* Statistics KPI Row */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <Statistic title="Total Orders" value={stats?.totalOrders || 0} prefix={<ShoppingOutlined style={{ color: '#FF6B00' }} />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <Statistic title="Pending Orders" value={stats?.pendingOrders || 0} valueStyle={{ color: '#EF4444' }} prefix={<ClockCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <Statistic title="Delivered Orders" value={stats?.deliveredOrders || 0} valueStyle={{ color: '#10B981' }} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <Statistic title="Total Revenue" value={stats?.revenue || 0} precision={2} prefix={<DollarOutlined style={{ color: '#10B981' }} />} />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="analytics" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            {/* Analytics Tab */}
            <TabPane tab="Dashboard Analytics" key="analytics">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="Monthly Sales Trend ($)" bordered={false}>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockMonthlySales}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="sales" stroke="#FF6B00" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Daily Orders Count" bordered={false}>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockDailyOrders}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Orders Management Tab */}
            <TabPane tab="Manage Orders" key="orders">
              <Table
                dataSource={orders}
                rowKey="id"
                columns={[
                  { title: 'Order ID', dataKey: 'id', render: (_, r) => <strong>#{r.id}</strong> },
                  { title: 'Customer', dataIndex: 'customerUsername' },
                  { title: 'Amount', dataIndex: 'totalAmount', render: (val) => `$${val.toFixed(2)}` },
                  { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'PENDING' ? 'warning' : 'blue'}>{status}</Tag> },
                  { title: 'Items', dataIndex: 'items', render: (_, r) => r.items.map(i => `${i.foodItemName} (${i.quantity})`).join(', ') },
                  { title: 'Actions', render: (_, r) => (
                    <Space>
                      {r.status === 'PENDING' && (
                        <>
                          <Button type="primary" onClick={() => handleOrderStatusUpdate(r.id, 'ACCEPTED')} size="small" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>Accept</Button>
                          <Button danger onClick={() => handleOrderStatusUpdate(r.id, 'REJECTED')} size="small">Reject</Button>
                        </>
                      )}
                      {r.status === 'ACCEPTED' && (
                        <Button type="primary" onClick={() => handleOrderStatusUpdate(r.id, 'PREPARING')} size="small">Start Preparing</Button>
                      )}
                      {r.status === 'PREPARING' && (
                        <Button type="primary" onClick={() => handleOrderStatusUpdate(r.id, 'OUT_FOR_DELIVERY')} size="small">Out for Delivery</Button>
                      )}
                      {r.status === 'OUT_FOR_DELIVERY' && (
                        <Button type="primary" onClick={() => handleOrderStatusUpdate(r.id, 'DELIVERED')} size="small" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>Mark Delivered</Button>
                      )}
                    </Space>
                  )}
                ]}
              />
            </TabPane>

            {/* Menu Items Management Tab */}
            <TabPane tab="Manage Menu" key="menu">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openMenuModal()} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }}>
                  Add Food Item
                </Button>
              </div>

              <Table
                dataSource={menuItems}
                rowKey="id"
                columns={[
                  { title: 'Image', dataIndex: 'imageUrl', render: (val) => <img src={val} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} /> },
                  { title: 'Name', dataIndex: 'name', render: (val) => <strong>{val}</strong> },
                  { title: 'Category', dataIndex: 'categoryName' },
                  { title: 'Price', dataIndex: 'price', render: (val) => `$${val.toFixed(2)}` },
                  { title: 'Available', dataIndex: 'available', render: (val) => <Tag color={val ? 'success' : 'error'}>{val ? 'Yes' : 'No'}</Tag> },
                  { title: 'Actions', render: (_, r) => (
                    <Space>
                      <Button icon={<EditOutlined />} onClick={() => openMenuModal(r)} size="small" />
                      <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteMenuItem(r.id)} size="small" />
                    </Space>
                  )}
                ]}
              />
            </TabPane>
          </Tabs>
        </div>
      )}

      {/* Restaurant Add/Edit Modal */}
      <Modal
        title={activeRestaurant ? 'Edit Restaurant Settings' : 'Register Restaurant'}
        open={restModalOpen}
        onCancel={() => setRestModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleRestaurantSubmit}>
          <Form.Item name="name" label="Restaurant Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter address' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Contact Phone" rules={[{ required: true, message: 'Please enter phone' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={actionLoading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }}>
              Save Details
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Menu Item Add/Edit Modal */}
      <Modal
        title={editingMenuItem ? 'Edit Menu Item' : 'Add Food Item'}
        open={menuModalOpen}
        onCancel={() => setMenuModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={menuForm} onFinish={handleMenuItemSubmit}>
          <Form.Item name="name" label="Dish Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Price ($)" rules={[{ required: true, message: 'Please enter price' }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Select category' }]}>
            <Select>
              {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="imageUrl" label="Food Image URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="isAvailable" label="In Stock / Available" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={actionLoading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }}>
              Save Item
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Supporting elements
const ClockCircleOutlined = (props) => <span style={{ color: '#F59E0B' }} {...props}>⏰</span>;
const CheckCircleOutlined = (props) => <span style={{ color: '#10B981' }} {...props}>✅</span>;

export default OwnerDashboard;
