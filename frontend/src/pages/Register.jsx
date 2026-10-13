import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Radio, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        address: values.address,
      });

      // Auto-login upon registration
      const loginRes = await api.post('/auth/login', {
        username: values.username,
        password: values.password,
      });

      const { token, id, username, email, role, status } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username, email, role, status }));

      message.success(`Welcome to FoodHub, ${username}!`);
      if (role === 'CUSTOMER') navigate('/home');
      else if (role === 'OWNER') navigate('/owner/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');

    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Try again.';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0E6 0%, #F9FAFB 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 0'
    }}>
      <Card style={{
        maxWidth: '460px',
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        border: 'none',
        margin: '20px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B00' }}>
              Food<span style={{ color: '#1F2937' }}>Hub</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', marginTop: '12px' }}>Create Account</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Join us and order from the best restaurants around</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          {/* Role Selection */}
          <Form.Item
            name="role"
            label="Register As"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="CUSTOMER"
          >
            <Radio.Group style={{ width: '100%', display: 'flex', gap: '12px' }}>
              <Radio.Button value="CUSTOMER" style={{ flexGrow: 1, textAlign: 'center', borderRadius: '8px' }}>
                <UserOutlined /> Customer
              </Radio.Button>
              <Radio.Button value="OWNER" style={{ flexGrow: 1, textAlign: 'center', borderRadius: '8px' }}>
                <HomeOutlined /> Partner Owner
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#9CA3AF' }} />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#9CA3AF' }} />} placeholder="Email Address" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#9CA3AF' }} />} placeholder="Phone Number" size="large" />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Please enter your delivery/business address' }]}
          >
            <Input prefix={<HomeOutlined style={{ color: '#9CA3AF' }} />} placeholder="Address" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '12px', color: '#6B7280', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#FF6B00', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
