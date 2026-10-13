import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Divider, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      form.setFieldsValue({
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
      });
    } catch (e) {
      message.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setUpdateLoading(true);
    try {
      await api.put('/profile', {
        email: values.email,
        phone: values.phone,
        address: values.address,
      });
      message.success('Profile updated successfully');
      // Update local storage email if updated
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.email = values.email;
      localStorage.setItem('user', JSON.stringify(user));
      fetchProfile();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Confirm password does not match new password');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/profile/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 0' }}><Spin size="large" /></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} md={14}>
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF0E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#FF6B00',
                  fontWeight: 'bold'
                }}>
                  {profile.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <Title level={4} style={{ margin: 0 }}>{profile.username}</Title>
                  <Text type="secondary">Role: {profile.role}</Text>
                </div>
              </div>

              <Divider />

              <Form layout="vertical" form={form} onFinish={handleUpdateProfile} requiredMark={false}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input prefix={<MailOutlined style={{ color: '#9CA3AF' }} />} size="large" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input prefix={<PhoneOutlined style={{ color: '#9CA3AF' }} />} size="large" />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Delivery Address"
                  rules={[{ required: true, message: 'Please enter your address' }]}
                >
                  <Input.TextArea prefix={<HomeOutlined />} rows={3} style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" size="large" loading={updateLoading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Change Password Card */}
          <Col xs={24} md={10}>
            <Card title="Change Password" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword} requiredMark={false}>
                <Form.Item
                  name="oldPassword"
                  label="Current Password"
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} size="large" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter your new password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  rules={[{ required: true, message: 'Please confirm your new password' }]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} size="large" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" size="large" block loading={passwordLoading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
                    Update Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Profile;
