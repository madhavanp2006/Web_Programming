import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { LockOutlined, KeyOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const initialEmail = searchParams.get('email') || '';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      message.success('Password changed successfully! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reset password. Check details.');
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
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Reset Password</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '6px' }}>
            Verify your identity with the generated OTP to set a new password.
          </p>
        </div>

        <Alert
          message="MOCKED OTP"
          description="Check the Spring Boot console log to retrieve the 6-digit OTP code."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ email: initialEmail }}>
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
            name="otp"
            rules={[{ required: true, message: 'Please enter the OTP code' }]}
          >
            <Input prefix={<KeyOutlined style={{ color: '#9CA3AF' }} />} placeholder="6-Digit OTP Code" size="large" maxLength={6} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'New password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#9CA3AF' }} />} placeholder="New Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
              Update Password
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

export default ResetPassword;
