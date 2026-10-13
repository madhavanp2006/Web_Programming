import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Row, Col, Space } from 'antd';
import { ShopOutlined, UserOutlined, SafetyOutlined, ArrowRightOutlined } from '@ant-design/icons';

const LandingPage = () => {
  const navigate = useNavigate();

  // If token is already present, auto-redirect to respective dashboard
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        if (user.role === 'CUSTOMER') navigate('/home');
        else if (user.role === 'OWNER') navigate('/owner/dashboard');
        else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      } catch (e) {}
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: '#FF6B00',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            FH
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#FF6B00' }}>
            Food<span style={{ color: '#1F2937' }}>Hub</span>
          </span>
        </div>
        <Space size="middle">
          <Link to="/login">
            <Button type="text" style={{ fontWeight: 600 }}>Sign In</Button>
          </Link>
          <Link to="/register">
            <Button type="primary" style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', fontWeight: 600 }}>Get Started</Button>
          </Link>
        </Space>
      </header>

      {/* Hero Section */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #FFF0E6 0%, #FFFFFF 100%)'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#1F2937',
            marginBottom: '16px',
            lineHeight: 1.15
          }}>
            Satisfy Your Cravings with <span style={{ color: '#FF6B00' }}>FoodHub</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6B7280',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            fontWeight: 400
          }}>
            Discover top-rated restaurants near you, customize your cart, and experience secure, blazing-fast checkouts.
          </p>

          {/* Portal Cards */}
          <Row gutter={[24, 24]} justify="center" style={{ marginTop: '20px' }}>
            <Col xs={24} sm={8} md={8}>
              <Card
                className="food-card"
                hoverable
                style={{ height: '100%', border: 'none', borderRadius: '16px', textAlign: 'left', padding: '12px' }}
                cover={
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', paddingLeft: '24px', fontSize: '40px', color: '#FF6B00' }}>
                    <UserOutlined />
                  </div>
                }
              >
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>I am a Customer</h3>
                <p style={{ color: '#6B7280', margin: '8px 0 20px 0', minHeight: '44px' }}>
                  Browse menus, order delicious meals, and track delivery status dynamically.
                </p>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  style={{ backgroundColor: '#FF6B00', borderColor: '#FF6B00', borderRadius: '8px' }}
                  onClick={() => navigate('/login?role=customer')}
                >
                  Order Food
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8} md={8}>
              <Card
                className="food-card"
                hoverable
                style={{ height: '100%', border: 'none', borderRadius: '16px', textAlign: 'left', padding: '12px' }}
                cover={
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', paddingLeft: '24px', fontSize: '40px', color: '#4B5563' }}>
                    <ShopOutlined />
                  </div>
                }
              >
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>I am an Owner</h3>
                <p style={{ color: '#6B7280', margin: '8px 0 20px 0', minHeight: '44px' }}>
                  Register your restaurant, manage your food menu, and monitor sales metrics.
                </p>
                <Button
                  type="default"
                  icon={<ArrowRightOutlined />}
                  style={{ borderRadius: '8px' }}
                  onClick={() => navigate('/login?role=owner')}
                >
                  Partner Portal
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8} md={8}>
              <Card
                className="food-card"
                hoverable
                style={{ height: '100%', border: 'none', borderRadius: '16px', textAlign: 'left', padding: '12px' }}
                cover={
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', paddingLeft: '24px', fontSize: '40px', color: '#3B82F6' }}>
                    <SafetyOutlined />
                  </div>
                }
              >
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>I am an Admin</h3>
                <p style={{ color: '#6B7280', margin: '8px 0 20px 0', minHeight: '44px' }}>
                  Oversee system activities, approve partner outlets, and view reports.
                </p>
                <Button
                  type="text"
                  icon={<ArrowRightOutlined />}
                  style={{ color: '#3B82F6', fontWeight: 600, paddingLeft: 0 }}
                  onClick={() => navigate('/login?role=admin')}
                >
                  Admin Terminal
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px',
        color: '#9CA3AF',
        backgroundColor: '#fff',
        borderTop: '1px solid #E5E7EB'
      }}>
        FoodHub Online Food Ordering System &copy; {new Date().getFullYear()}. Built with React & Spring Boot.
      </footer>
    </div>
  );
};

export default LandingPage;
