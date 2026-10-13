import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Tag, Spin, Empty, message } from 'antd';
import { HeartFilled, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/wishlist');
      setRestaurants(response.data);
    } catch (e) {
      message.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e, id) => {
    e.stopPropagation(); // Stop navigation trigger
    try {
      await api.delete(`/customer/wishlist/remove/${id}`);
      message.success('Removed from favorites');
      fetchWishlist();
    } catch (error) {
      message.error('Could not remove from favorites');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F2F8' }}>
      <Navbar />

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2B1E4A 0%, #3F2B68 100%)',
        padding: '36px 0',
        color: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HeartFilled style={{ color: '#E23744' }} /> Your Favorites
          </h2>
          <p style={{ color: '#D8B4FE', margin: '6px 0 0 0', fontSize: '15px' }}>
            All your saved restaurants and snack shops in one place
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : restaurants.length === 0 ? (
          <Empty
            description={<span style={{ color: '#6B7280', fontSize: '16px' }}>You haven't added any favorite outlets yet.</span>}
            style={{ margin: '60px 0', backgroundColor: '#FFFFFF', padding: '48px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
          >
            <Button type="primary" onClick={() => navigate('/home')} style={{ backgroundColor: '#FC8019', borderColor: '#FC8019', height: '42px', borderRadius: '12px', fontWeight: 700, padding: '0 24px' }}>
              Explore 25+ Outlets
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {restaurants.map(item => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <Card
                  hoverable
                  style={{ borderRadius: '20px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden', backgroundColor: '#FFFFFF' }}
                  cover={
                    <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                      <img
                        alt={item.name}
                        src={item.logoUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        type="text"
                        icon={<HeartFilled style={{ color: '#E23744', fontSize: '18px' }} />}
                        onClick={(e) => handleRemoveFavorite(e, item.id)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/restaurant/${item.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#2B1E4A', margin: 0 }}>
                      {item.name}
                    </h4>
                    <Tag color="green" style={{ borderRadius: '6px', fontWeight: 700 }}>4.4 ★</Tag>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '13px', margin: '8px 0 16px 0', minHeight: '38px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.description}
                  </p>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                    <span><EnvironmentOutlined style={{ color: '#A855F7' }} /> {item.address}</span>
                    <span><PhoneOutlined style={{ color: '#FC8019' }} /> {item.phone}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
