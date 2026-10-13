import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const email = searchParams.get('email') || '';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post(`/auth/verify-email?email=${encodeURIComponent(values.email)}&otp=${values.otp}`);
      message.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Verification failed. Please check the OTP.');
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
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B00' }}>
            Food<span style={{ color: '#1F2937' }}>Hub</span>
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', marginTop: '12px' }}>Verify Your Email</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '6px' }}>
            Enter the 6-digit OTP code to activate your customer account.
          </p>
        </div>

        <Alert
          message="Email Verification"
          description="Check the Spring Boot backend logs for the 6-digit verification code sent to this email."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ email: email }}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#9CA3AF' }} />} placeholder="john@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="otp"
            label="Verification Code"
            rules={[{ required: true, message: 'Please enter the OTP code' }]}
          >
            <Input prefix={<KeyOutlined style={{ color: '#9CA3AF' }} />} placeholder="6-Digit Code" size="large" maxLength={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>
              Verify Account
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

export default VerifyEmail;
