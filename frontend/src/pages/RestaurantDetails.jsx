import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Tag, Switch, Modal, Spin, Empty, message, Divider } from 'antd';
import { StarFilled, ClockCircleOutlined, EnvironmentOutlined, PlusOutlined, MinusOutlined, TagFilled, UserOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [cartItemsMap, setCartItemsMap] = useState({}); // foodItemId -> quantity
  const [currentCartRestaurantId, setCurrentCartRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

  useEffect(() => {
    fetchOutletDetails();
    fetchCartInfo();
  }, [id]);

  const fetchOutletDetails = async () => {
    setLoading(true);
    try {
      const [resRes, itemsRes] = await Promise.all([
        api.get(`/public/restaurants/${id}`),
        api.get(`/public/food-items/restaurant/${id}`),
      ]);

      setRestaurant(resRes.data);
      setFoodItems(itemsRes.data || []);
    } catch (err) {
      message.error('Failed to load outlet menu details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/customer/cart');
      const items = response.data.items || [];
      const map = {};
      items.forEach(item => {
        map[item.foodItemId] = item.quantity;
      });
      setCartItemsMap(map);
      if (items.length > 0) {
        setCurrentCartRestaurantId(items[0].restaurantId || null);
      } else {
        setCurrentCartRestaurantId(null);
      }
    } catch (err) {
      // Ignore token expiry
    }
  };

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Authentication Check
    if (!token || user.role !== 'CUSTOMER') {
      Modal.confirm({
        title: 'Login Required',
        content: 'Please login to your Customer account to add items to your cart and place orders.',
        okText: 'LOGIN NOW',
        cancelText: 'CANCEL',
        okButtonProps: { style: { backgroundColor: '#6B21A8', borderColor: '#6B21A8' } },
        onOk: () => navigate('/login'),
      });
      return;
    }

    // Check for multi-restaurant conflict
    if (currentCartRestaurantId && currentCartRestaurantId !== parseInt(id)) {
      setPendingItemToAdd(item);
      setConflictModalOpen(true);
      return;
    }

    try {
      await api.post('/customer/cart/add', {
        foodItemId: item.id,
        quantity: 1,
      });
      message.success(`Added ${item.name} to your cart!`);
      // Update local state immediately for instant feedback
      setCartItemsMap(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
      fetchCartInfo();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      if (msg.toLowerCase().includes('another restaurant')) {
        setPendingItemToAdd(item);
        setConflictModalOpen(true);
      } else {
        message.error(msg);
      }
    }
  };

  const handleUpdateQuantity = async (foodItemId, newQty) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (newQty <= 0) {
        await api.delete(`/customer/cart/remove/${foodItemId}`);
        message.info('Item removed from cart');
        setCartItemsMap(prev => {
          const updated = { ...prev };
          delete updated[foodItemId];
          return updated;
        });
      } else {
        await api.put('/customer/cart/update', {
          foodItemId,
          quantity: newQty,
        });
        setCartItemsMap(prev => ({ ...prev, [foodItemId]: newQty }));
      }
      fetchCartInfo();
    } catch (err) {
      message.error('Failed to update item quantity');
    }
  };

  const clearCartAndAddPending = async () => {
    try {
      await api.delete('/customer/cart/clear');
      setConflictModalOpen(false);
      if (pendingItemToAdd) {
        await api.post('/customer/cart/add', {
          foodItemId: pendingItemToAdd.id,
          quantity: 1,
        });
        message.success(`Cleared old cart and added ${pendingItemToAdd.name}!`);
        setPendingItemToAdd(null);
        fetchCartInfo();
      }
    } catch (err) {
      message.error('Failed to clear cart');
    }
  };

  // Filter food items based on Veg Only switch
  const filteredFoodItems = foodItems.filter(item => {
    const isVeg = item.name.toLowerCase().includes('[veg]') || item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('dosa') || item.name.toLowerCase().includes('idli') || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('cake') || item.name.toLowerCase().includes('samosa');
    if (vegOnly && !isVeg) return false;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#F4F3F8', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar />

      {loading || !restaurant ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '12px', color: '#686B78' }}>Loading menu items...</p>
        </div>
      ) : (
        <div style={{ maxWidth: '960px', margin: '32px auto 0 auto', padding: '0 24px' }}>
          
          {/* Outlet Header Card */}
          <div className="swiggy-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} sm={6}>
                <img
                  src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                  alt={restaurant.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '14px' }}
                />
              </Col>
              <Col xs={24} sm={18}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 6px 0', color: '#1E1535' }}>
                      {restaurant.name}
                    </h1>
                    <p style={{ color: '#686B78', fontSize: '14px', margin: '0 0 10px 0' }}>
                      {restaurant.description}
                    </p>
                    <div style={{ color: '#93959F', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <EnvironmentOutlined /> {restaurant.address}
                    </div>
                  </div>

                  {/* Swiggy Rating Badge */}
                  <div style={{
                    border: '1px solid rgba(107,33,168,0.15)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    textAlign: 'center',
                    backgroundColor: '#FAF5FF'
                  }}>
                    <div className="swiggy-rating-badge" style={{ fontSize: '15px' }}>
                      <StarFilled /> 4.5
                    </div>
                    <div style={{ fontSize: '11px', color: '#686B78', fontWeight: 600, marginTop: '4px' }}>
                      200+ Ratings
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Delivery Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1535', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClockCircleOutlined style={{ color: '#FC8019' }} /> 15-20 MINS
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1535' }}>
                    • ₹200 for two
                  </span>
                  <Tag color="purple" style={{ fontWeight: 800, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', border: 'none' }}>
                    <TagFilled /> 50% OFF UP TO ₹120 | USE SWIGGYIT
                  </Tag>
                </div>
              </Col>
            </Row>
          </div>

          {/* Veg Only Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            backgroundColor: '#FFFFFF',
            padding: '14px 20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(43,30,74,0.05)'
          }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1E1535', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="veg-icon" /> Pure Veg Dishes Only
            </span>
            <Switch
              checked={vegOnly}
              onChange={(checked) => setVegOnly(checked)}
              style={{ backgroundColor: vegOnly ? '#0F8A65' : undefined }}
            />
          </div>

          {/* Dishes Menu Header */}
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1E1535', marginBottom: '16px' }}>
            Menu Dishes ({filteredFoodItems.length})
          </h2>

          {filteredFoodItems.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '16px' }}>
              <Empty description="No dishes available for this filter." />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredFoodItems.map((item) => {
                const isVeg = item.name.toLowerCase().includes('[veg]') || item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('dosa') || item.name.toLowerCase().includes('idli') || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('cake') || item.name.toLowerCase().includes('samosa');
                const qtyInCart = cartItemsMap[item.id] || 0;

                return (
                  <Card
                    key={item.id}
                    className="swiggy-card"
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      {/* Item Details */}
                      <Col xs={16} sm={17} md={18}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span className={isVeg ? 'veg-icon' : 'non-veg-icon'} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: isVeg ? '#0F8A65' : '#E43B4F' }}>
                            {isVeg ? 'VEG' : 'NON-VEG'}
                          </span>
                        </div>
                        
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#1E1535' }}>
                          {item.name}
                        </h3>

                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E1535', marginBottom: '8px' }}>
                          ₹{item.price.toFixed(2)}
                        </div>

                        <p style={{ fontSize: '13px', color: '#686B78', margin: 0, lineHeight: '1.5' }}>
                          {item.description}
                        </p>
                      </Col>

                      {/* Image & Floating ADD Counter */}
                      <Col xs={8} sm={7} md={6} style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '130px' }}>
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '110px',
                              objectFit: 'cover',
                              borderRadius: '12px'
                            }}
                          />

                          {/* Floating + ADD Button */}
                          <div style={{
                            position: 'absolute',
                            bottom: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100px'
                          }}>
                            {qtyInCart > 0 ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#FFFFFF',
                                border: '2px solid #6B21A8',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                boxShadow: '0 4px 12px rgba(107,33,168,0.2)'
                              }}>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<MinusOutlined style={{ color: '#6B21A8' }} />}
                                  onClick={() => handleUpdateQuantity(item.id, qtyInCart - 1)}
                                />
                                <span style={{ fontWeight: 800, color: '#6B21A8', fontSize: '14px' }}>{qtyInCart}</span>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<PlusOutlined style={{ color: '#6B21A8' }} />}
                                  onClick={() => handleUpdateQuantity(item.id, qtyInCart + 1)}
                                />
                              </div>
                            ) : (
                              <Button
                                block
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  borderColor: '#6B21A8',
                                  color: '#0F8A65',
                                  fontWeight: 900,
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  fontSize: '14px'
                                }}
                                onClick={() => handleAddToCart(item)}
                              >
                                ADD +
                              </Button>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Cart Conflict Modal */}
          <Modal
            title="Replace items in cart?"
            open={conflictModalOpen}
            onCancel={() => setConflictModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setConflictModalOpen(false)}>
                NO
              </Button>,
              <Button key="replace" type="primary" style={{ backgroundColor: '#6B21A8', borderColor: '#6B21A8' }} onClick={clearCartAndAddPending}>
                YES, REPLACE
              </Button>,
            ]}
          >
            <p>Your cart contains items from another restaurant. Would you like to clear your existing cart and add items from <strong>{restaurant.name}</strong>?</p>
          </Modal>

        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
