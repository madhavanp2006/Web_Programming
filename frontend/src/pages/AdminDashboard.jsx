import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Tabs, Form, Input, Space, Modal, Spin, message } from 'antd';
import { UserOutlined, ShopOutlined, ShoppingOutlined, DollarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const { TabPane } = Tabs;

const COLORS = ['#FF6B00', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// Mock analytics data for charts
const mockRevenueTrend = [
  { name: 'Jan', revenue: 14000 },
  { name: 'Feb', revenue: 19000 },
  { name: 'Mar', revenue: 22000 },
  { name: 'Apr', revenue: 26000 },
  { name: 'May', revenue: 31000 },
  { name: 'Jun', revenue: 42000 },
];

const mockCategoryShare = [
  { name: 'Starters', value: 400 },
  { name: 'Main Course', value: 800 },
  { name: 'Desserts', value: 300 },
  { name: 'Drinks', value: 200 },
];

const mockDailyVol = [
  { name: '07/10', orders: 120 },
  { name: '07/11', orders: 145 },
  { name: '07/12', orders: 110 },
  { name: '07/13', orders: 190 },
  { name: '07/14', orders: 220 },
  { name: '07/15', orders: 205 },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Category modal states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // stats
      const resStats = await api.get('/admin/restaurants/dashboard');
      setStats(resStats.data);

      // users
      const resUsers = await api.get('/admin/users');
      setUsers(resUsers.data);

      // restaurants
      const resRest = await api.get('/admin/restaurants');
      setRestaurants(resRest.data);

      // categories
      const resCats = await api.get('/public/categories');
      setCategories(resCats.data);

      // orders
      const resOrders = await api.get('/admin/orders');
      setAllOrders(resOrders.data.sort((a,b) => b.id - a.id));

    } catch (e) {
      message.error('Failed to load administrative details');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserBlock = async (userId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/admin/users/${userId}/unblock` : `/admin/users/${userId}/block`;
      await api.post(endpoint);
      message.success(isBlocked ? 'User unblocked' : 'User blocked successfully');
      fetchDashboardData();
    } catch (e) {
      message.error('Failed to update user security status');
    }
  };

  // Restaurant Actions
  const handleApproveRestaurant = async (id) => {
    try {
      await api.post(`/admin/restaurants/${id}/approve`);
      message.success('Restaurant approved for customer display');
      fetchDashboardData();
    } catch (e) {
      message.error('Approval execution failed');
    }
  };

  const handleToggleRestaurantBlock = async (id, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/admin/restaurants/${id}/unblock` : `/admin/restaurants/${id}/block`;
      await api.post(endpoint);
      message.success(isBlocked ? 'Restaurant active status restored' : 'Restaurant deactivated');
      fetchDashboardData();
    } catch (e) {
      message.error('Restaurant active toggle failed');
    }
  };

  // Category Actions
  const handleCategorySubmit = async (values) => {
    setActionLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, values);
        message.success('Category updated successfully');
      } else {
        await api.post('/admin/categories', values);
        message.success('Category created successfully');
      }
      setCatModalOpen(false);
      fetchDashboardData();
    } catch (e) {
      message.error('Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      message.success('Category deleted');
      fetchDashboardData();
    } catch (e) {
      message.error('Failed to delete category');
    }
  };

  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) {
      form.setFieldsValue({
        name: cat.name,
        description: cat.description,
      });
    } else {
      form.resetFields();
    }
    setCatModalOpen(true);
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
      {/* Top Banner Header */}
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
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#FF6B00' }}>FoodHub <span style={{ color: '#1F2937' }}>Admin Console</span></span>
        </div>
        <Button onClick={handleLogout} danger>Logout</Button>
      </header>

      <div style={{ padding: '24px 32px', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* KPI metrics row */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Total Users" value={stats?.totalUsers || 0} prefix={<UserOutlined style={{ color: '#FF6B00' }} />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Restaurants" value={stats?.totalRestaurants || 0} prefix={<ShopOutlined style={{ color: '#3B82F6' }} />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Total Orders" value={stats?.totalOrders || 0} prefix={<ShoppingOutlined style={{ color: '#10B981' }} />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Total Sales" value={stats?.revenue || 0} precision={2} prefix={<DollarOutlined style={{ color: '#10B981' }} />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Pending" value={stats?.pendingOrders || 0} valueStyle={{ color: '#EF4444' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card bordered={false} style={{ borderRadius: '12px' }}>
              <Statistic title="Delivered" value={stats?.deliveredOrders || 0} valueStyle={{ color: '#10B981' }} />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="analytics" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          {/* Analytics Graphs Tab */}
          <TabPane tab="Analytics Overview" key="analytics">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Monthly Revenue Analytics ($)" bordered={false}>
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRevenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Orders by Category Share" bordered={false}>
                  <div style={{ height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockCategoryShare}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mockCategoryShare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              <Col xs={24}>
                <Card title="Daily System Order Volume" bordered={false}>
                  <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockDailyVol}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Manage Users Tab */}
          <TabPane tab="Manage Users" key="users">
            <Table
              dataSource={users}
              rowKey="id"
              columns={[
                { title: 'User ID', dataIndex: 'id' },
                { title: 'Username', dataIndex: 'username', render: (val) => <strong>{val}</strong> },
                { title: 'Email', dataIndex: 'email' },
                { title: 'Phone', dataIndex: 'phone' },
                { title: 'Role', dataIndex: 'role', render: (role) => <Tag color={role === 'ADMIN' ? 'red' : role === 'OWNER' ? 'purple' : 'blue'}>{role}</Tag> },
                { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>{status}</Tag> },
                { title: 'Action', render: (_, r) => (
                  r.role !== 'ADMIN' && (
                    <Button
                      type={r.status === 'ACTIVE' ? 'primary' : 'default'}
                      danger={r.status === 'ACTIVE'}
                      onClick={() => handleToggleUserBlock(r.id, r.status === 'BLOCKED')}
                      icon={r.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
                      size="small"
                    >
                      {r.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                    </Button>
                  )
                )}
              ]}
            />
          </TabPane>

          {/* Manage Restaurants Tab */}
          <TabPane tab="Manage Restaurants" key="restaurants">
            <Table
              dataSource={restaurants}
              rowKey="id"
              columns={[
                { title: 'Restaurant ID', dataIndex: 'id' },
                { title: 'Restaurant Name', dataIndex: 'name', render: (val) => <strong>{val}</strong> },
                { title: 'Owner', dataIndex: 'ownerUsername' },
                { title: 'Address', dataIndex: 'address' },
                { title: 'Verification', dataIndex: 'isApproved', render: (approved, r) => (
                  approved ? <Tag color="success">Approved</Tag> : (
                    <Button type="primary" size="small" onClick={() => handleApproveRestaurant(r.id)} style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>
                      Approve Outlet
                    </Button>
                  )
                ) },
                { title: 'Active Status', dataIndex: 'isActive', render: (active) => <Tag color={active ? 'success' : 'error'}>{active ? 'Active' : 'Blocked'}</Tag> },
                { title: 'Toggle Block', render: (_, r) => (
                  <Button
                    type={r.isActive ? 'primary' : 'default'}
                    danger={r.isActive}
                    onClick={() => handleToggleRestaurantBlock(r.id, !r.isActive)}
                    size="small"
                  >
                    {r.isActive ? 'Block' : 'Activate'}
                  </Button>
                ) }
              ]}
            />
          </TabPane>

          {/* Categories Manager Tab */}
          <TabPane tab="Food Categories" key="categories">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCategoryModal()} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }}>
                Add Category
              </Button>
            </div>
            <Table
              dataSource={categories}
              rowKey="id"
              columns={[
                { title: 'Category ID', dataIndex: 'id' },
                { title: 'Category Name', dataIndex: 'name', render: (val) => <strong>{val}</strong> },
                { title: 'Description', dataIndex: 'description' },
                { title: 'Actions', render: (_, r) => (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => openCategoryModal(r)} size="small" />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteCategory(r.id)} size="small" />
                  </Space>
                ) }
              ]}
            />
          </TabPane>

          {/* All Orders Audit Tab */}
          <TabPane tab="All System Orders" key="orders">
            <Table
              dataSource={allOrders}
              rowKey="id"
              columns={[
                { title: 'Order ID', dataIndex: 'id', render: (id) => <strong>#{id}</strong> },
                { title: 'Customer', dataIndex: 'customerUsername' },
                { title: 'Restaurant', dataIndex: 'restaurantName' },
                { title: 'Amount', dataIndex: 'totalAmount', render: (val) => `$${val.toFixed(2)}` },
                { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'DELIVERED' ? 'success' : 'warning'}>{status}</Tag> },
                { title: 'Order Date', dataIndex: 'createdAt', render: (val) => new Date(val).toLocaleString() },
              ]}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* Category Creation / Edit Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={catModalOpen}
        onCancel={() => setCatModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCategorySubmit}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Please enter category name' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={actionLoading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00' }}>
              Save Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
