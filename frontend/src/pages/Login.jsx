import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Radio, Card, message, Tabs, Alert } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, KeyOutlined } from '@ant-design/icons';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState(false); // toggle phone input vs OTP input

  // Extract initial role from search query
  const initialRole = (searchParams.get('role') || 'customer').toUpperCase();

  const onFinishStandard = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username: values.username,
        password: values.password,
      });

      const { token, id, username, email, role, status } = response.data;
      
      // Save details to LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username, email, role, status }));
      
      message.success(`Welcome back, ${username}!`);
      
      // Redirect based on role
      if (role === 'CUSTOMER') navigate('/home');
      else if (role === 'OWNER') navigate('/owner/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');

    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      message.error(errMsg);
      if (errMsg.includes('verify your email')) {
        navigate('/verify-email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      const { emailOrPhone } = values;
      await api.post(`/auth/otp/send?emailOrPhone=${emailOrPhone}`);
      message.success('OTP sent successfully! Check your console output.');
      setOtpPhone(emailOrPhone);
      setOtpSent(true);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setLoading(true);
    try {
      const response = await api.post(`/auth/otp/verify?emailOrPhone=${otpPhone}&otp=${values.otp}`);
      const { token, id, username, email, role, status } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username, email, role, status }));
      
      message.success('Logged in successfully!');
      if (role === 'CUSTOMER') navigate('/home');
      else if (role === 'OWNER') navigate('/owner/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');

    } catch (error) {
      message.error(error.response?.data?.message || 'Invalid OTP code.');
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
      padding: '24px'
    }}>
      <Card style={{
        maxWidth: '440px',
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        border: 'none'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B00' }}>
              Food<span style={{ color: '#1F2937' }}>Hub</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', marginTop: '12px' }}>Welcome back</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Sign in to continue ordering your favorite dishes</p>
        </div>

        <Tabs defaultActiveKey="password" centered>
          <Tabs.TabPane tab="Password Login" key="password">
            <Form
              layout="vertical"
              onFinish={onFinishStandard}
              requiredMark={false}
              initialValues={{ role: initialRole }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#9CA3AF' }} />} placeholder="Username" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} placeholder="Password" size="large" />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Link to="/forgot-password" style={{ color: '#FF6B00', fontSize: '13px', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="OTP Login" key="otp">
            {!otpSent ? (
              <Form layout="vertical" onFinish={handleSendOtp} requiredMark={false}>
                <Alert
                  message="Bonus Feature"
                  description="We support logging in via OTP. Enter your registered email or phone."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <Form.Item
                  name="emailOrPhone"
                  rules={[{ required: true, message: 'Please enter your email or phone number' }]}
                >
                  <Input prefix={<MobileOutlined style={{ color: '#9CA3AF' }} />} placeholder="Registered Email or Phone" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
                    Send Verification Code
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Form layout="vertical" onFinish={handleVerifyOtp} requiredMark={false}>
                <Alert
                  message="Code Sent"
                  description={`Please look at the backend console log for the OTP code sent to: ${otpPhone}`}
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <Form.Item
                  name="otp"
                  rules={[{ required: true, message: 'Please enter the 6-digit OTP code' }]}
                >
                  <Input prefix={<KeyOutlined style={{ color: '#9CA3AF' }} />} placeholder="6-Digit OTP Code" size="large" maxLength={6} />
                </Form.Item>
                <Form.Item style={{ marginBottom: '8px' }}>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
                    Verify & Sign In
                  </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                  <Button type="link" onClick={() => setOtpSent(false)} style={{ color: '#6B7280', fontSize: '13px' }}>
                    Change phone/email
                  </Button>
                </div>
              </Form>
            )}
          </Tabs.TabPane>
        </Tabs>

        <div style={{ textAlign: 'center', marginTop: '16px', color: '#6B7280', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#FF6B00', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
