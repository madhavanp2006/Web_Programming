import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Dropdown, Space, Avatar } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HistoryOutlined, UserOutlined, LogoutOutlined, ShopOutlined, EnvironmentFilled } from '@ant-design/icons';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'CUSTOMER') {
      fetchCartCount();
    }
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/customer/cart');
      const items = response.data.items || [];
      const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
      setCartCount(totalItems);
    } catch (e) {
      // Ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">My Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Logout</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #2B1E4A 0%, #1E1535 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      padding: '0 32px',
      height: '75px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo & Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FC8019 0%, #E23744 100%)',
            color: '#FFFFFF',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 900,
            boxShadow: '0 4px 14px rgba(252,128,25,0.4)'
          }}>
            FH
          </div>
          <span style={{
            fontSize: '25px',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Food<span style={{ color: '#FC8019' }}>Hub</span>
          </span>
        </Link>

        {/* Location Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#3F2B68',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#FFFFFF'
        }}>
          <EnvironmentFilled style={{ color: '#FC8019', fontSize: '15px' }} />
          <span>Deliver to: <span style={{ color: '#D8B4FE', fontWeight: 500 }}>FC Road, Deccan, Pune</span></span>
        </div>
      </div>

      {/* Navigation Actions */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link to="/home" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <ShopOutlined style={{ fontSize: '17px', color: '#A855F7' }} /> Outlets
        </Link>

        <Link to="/wishlist" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <HeartOutlined style={{ fontSize: '17px', color: '#E23744' }} /> Favorites
        </Link>

        <Link to="/orders" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <HistoryOutlined style={{ fontSize: '17px', color: '#38BDF8' }} /> Orders
        </Link>

        <Link to="/cart" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
          <Badge count={cartCount} offset={[10, -2]} color="#FC8019">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF' }}>
              <ShoppingCartOutlined style={{ fontSize: '21px', color: '#FACC15' }} /> Cart
            </span>
          </Badge>
        </Link>

        {user && user.username ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer', backgroundColor: '#3F2B68', padding: '6px 14px', borderRadius: '20px' }}>
              <Avatar style={{ background: 'linear-gradient(135deg, #FC8019, #E23744)' }} icon={<UserOutlined />} />
              <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>{user.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #FC8019 0%, #E23744 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '20px',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(252,128,25,0.4)'
            }}>
              Sign In
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
