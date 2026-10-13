import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: values.email });
      message.success('Password reset OTP generated. Look at the backend console!');
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to initiate password reset.');
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
        maxWidth: '420px',
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        border: 'none'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Forgot Password?</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
            Enter your email and we'll log a recovery OTP code on the console for your session.
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#9CA3AF' }} />} placeholder="Email Address" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
              Send OTP Code
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/login" style={{ color: '#6B7280', fontSize: '14px' }}>
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
