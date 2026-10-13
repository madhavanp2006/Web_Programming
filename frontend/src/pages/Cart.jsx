import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Input, Radio, Tag, Modal, Spin, Empty, message, Divider } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, EnvironmentFilled, TagFilled, CompassFilled, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address Selection Modes: 'SAVED', 'MANUAL', 'MAP'
  const [addressMode, setAddressMode] = useState('SAVED');
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('Home - Flat 402, Royal Residency, FC Road, Pune');
  const [manualAddress, setManualAddress] = useState('');
  const [mapLocationText, setMapLocationText] = useState('Click on map to drop pin location...');
  const [mapPinPos, setMapPinPos] = useState({ x: 200, y: 110 });

  // Coupons System
  const [couponDrawerOpen, setCouponDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const availableCoupons = [
    { code: 'SWIGGYIT', title: '50% OFF UP TO ₹120', desc: 'Valid on orders above ₹199', type: 'PERCENT', value: 0.50, maxDiscount: 120, minOrder: 199 },
    { code: 'ZOMATO50', title: 'FLAT 50% OFF', desc: 'Special welcome discount for foodies', type: 'PERCENT', value: 0.50, maxDiscount: 100, minOrder: 149 },
    { code: 'SNACKTIME', title: 'FLAT ₹50 OFF ON SNACKS', desc: 'Valid on all snack shops & sweets', type: 'FLAT', value: 50, minOrder: 150 },
    { code: 'FREEDEL', title: 'FREE DELIVERY', desc: 'Zero delivery fees on orders above ₹299', type: 'DELIVERY', value: 35, minOrder: 299 },
  ];

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/cart');
      setCart(response.data);
    } catch (err) {
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (foodItemId, newQty) => {
    try {
      if (newQty <= 0) {
        await api.delete(`/customer/cart/remove/${foodItemId}`);
        message.info('Item removed from cart');
      } else {
        await api.put('/customer/cart/update', {
          foodItemId,
          quantity: newQty,
        });
      }
      fetchCart();
    } catch (err) {
      message.error('Failed to update quantity');
    }
  };

  const handleApplyCoupon = (coupon) => {
    const itemTotal = calculateItemTotal();
    if (itemTotal < coupon.minOrder) {
      message.error(`Minimum order for ${coupon.code} is ₹${coupon.minOrder}`);
      return;
    }

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = Math.min(itemTotal * coupon.value, coupon.maxDiscount);
    } else if (coupon.type === 'FLAT' || coupon.type === 'DELIVERY') {
      discount = coupon.value;
    }

    setAppliedCoupon({ code: coupon.code, discount });
    setCouponDrawerOpen(false);
    message.success(`🎉 Coupon ${coupon.code} applied! Saved ₹${discount.toFixed(2)}`);
  };

  const handleManualCouponCode = () => {
    const found = availableCoupons.find(c => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (found) {
      handleApplyCoupon(found);
      setCouponInput('');
    } else {
      message.error('Invalid promo code. Try SWIGGYIT or ZOMATO50');
    }
  };

  const calculateItemTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + ((item.foodItemPrice || item.price || 0) * item.quantity), 0);
  };

  const calculateFinalTotal = () => {
    const itemTotal = calculateItemTotal();
    const deliveryFee = 35.0;
    const taxes = itemTotal * 0.05;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    return Math.max(0, itemTotal + deliveryFee + taxes - discount);
  };

  const handlePlaceOrder = async () => {
    let finalDeliveryAddress = '';
    if (addressMode === 'SAVED') {
      finalDeliveryAddress = selectedSavedAddress;
    } else if (addressMode === 'MANUAL') {
      if (!manualAddress.trim()) {
        message.error('Please enter a valid manual delivery address');
        return;
      }
      finalDeliveryAddress = manualAddress;
    } else if (addressMode === 'MAP') {
      finalDeliveryAddress = mapLocationText;
    }

    setPlacingOrder(true);
    try {
      const cartItemsList = cart?.items || [];
      const restId = cartItemsList.length > 0 ? cartItemsList[0].restaurantId : null;

      const payload = {
        restaurantId: restId,
        deliveryAddress: finalDeliveryAddress,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      const response = await api.post('/customer/orders', payload);
      message.success('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleMapCanvasClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMapPinPos({ x, y });

    const locations = [
      "Building 4, Sector 12, FC Road, Pune - 411004",
      "Plot 88, Lane 5, Koregaon Park, Pune - 411001",
      "Flat 302, Green Acres, Viman Nagar, Pune - 411014",
      "Bungalow 12, JM Road, Shivajinagar, Pune - 411005"
    ];
    const loc = locations[Math.floor((x + y) % locations.length)];
    setMapLocationText(`Map Pin Dropped: ${loc}`);
    message.info('Location pinned on map!');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F4F3F8', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '12px', color: '#686B78' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div style={{ backgroundColor: '#F4F3F8', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '32px auto 0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1E1535', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCartOutlined style={{ color: '#6B21A8' }} /> Cart & Delivery Address
        </h1>

        {items.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px', borderRadius: '18px' }}>
            <Empty
              description={<span style={{ color: '#686B78', fontSize: '16px' }}>Your cart is empty! Choose delicious items from 25+ outlets.</span>}
            >
              <Button type="primary" size="large" style={{ backgroundColor: '#6B21A8', borderColor: '#6B21A8', marginTop: '16px', borderRadius: '12px', fontWeight: 800 }} onClick={() => navigate('/home')}>
                EXPLORE RESTAURANTS & SNACK SHOPS
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Left Column: Items & Address Selector */}
            <Col xs={24} md={15}>
              
              {/* Cart Items */}
              <Card className="swiggy-card" style={{ marginBottom: '24px' }} bodyStyle={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1535', margin: '0 0 16px 0' }}>
                  Your Items ({items.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((item) => {
                    const isVeg = item.foodItemName.toLowerCase().includes('[veg]') || item.foodItemName.toLowerCase().includes('paneer') || item.foodItemName.toLowerCase().includes('dosa') || item.foodItemName.toLowerCase().includes('chai') || item.foodItemName.toLowerCase().includes('samosa');

                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={isVeg ? 'veg-icon' : 'non-veg-icon'} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E1535' }}>
                              {item.foodItemName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#686B78' }}>
                              ₹{(item.foodItemPrice || item.price || 0).toFixed(2)} per item
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '2px solid #6B21A8',
                            borderRadius: '8px',
                            padding: '2px 6px',
                            backgroundColor: '#FAF5FF'
                          }}>
                            <Button type="text" size="small" icon={<MinusOutlined style={{ color: '#6B21A8' }} />} onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)} />
                            <span style={{ fontWeight: 800, color: '#6B21A8', fontSize: '14px' }}>{item.quantity}</span>
                            <Button type="text" size="small" icon={<PlusOutlined style={{ color: '#6B21A8' }} />} onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)} />
                          </div>

                          <span style={{ fontWeight: 800, fontSize: '15px', color: '#1E1535', minWidth: '70px', textAlign: 'right' }}>
                            ₹{((item.foodItemPrice || item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Delivery Address Picker */}
              <Card className="swiggy-card" bodyStyle={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1535', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentFilled style={{ color: '#FC8019' }} /> Delivery Address
                </h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    className={`category-pill ${addressMode === 'SAVED' ? 'active' : ''}`}
                    onClick={() => setAddressMode('SAVED')}
                  >
                    🏠 Saved Address
                  </button>
                  <button
                    className={`category-pill ${addressMode === 'MANUAL' ? 'active' : ''}`}
                    onClick={() => setAddressMode('MANUAL')}
                  >
                    ✍️ Enter Manually
                  </button>
                  <button
                    className={`category-pill ${addressMode === 'MAP' ? 'active' : ''}`}
                    onClick={() => setAddressMode('MAP')}
                  >
                    🗺️ Select From Map
                  </button>
                </div>

                {addressMode === 'SAVED' && (
                  <Radio.Group
                    value={selectedSavedAddress}
                    onChange={(e) => setSelectedSavedAddress(e.target.value)}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <Radio value="Home - Flat 402, Royal Residency, FC Road, Pune - 411004" style={{ width: '100%' }}>
                      <div style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FAFAFA' }}>
                        <Tag color="purple" style={{ fontWeight: 800 }}>HOME</Tag>
                        <span style={{ fontWeight: 600, color: '#1E1535' }}>Flat 402, Royal Residency, FC Road, Pune</span>
                      </div>
                    </Radio>

                    <Radio value="Work - IT Park, Phase 1, Hinjewadi, Pune - 411057" style={{ width: '100%' }}>
                      <div style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FAFAFA' }}>
                        <Tag color="blue" style={{ fontWeight: 800 }}>WORK</Tag>
                        <span style={{ fontWeight: 600, color: '#1E1535' }}>IT Park, Phase 1, Hinjewadi, Pune</span>
                      </div>
                    </Radio>
                  </Radio.Group>
                )}

                {addressMode === 'MANUAL' && (
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter full street address, flat no, landmark, city, and pincode..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    style={{ borderRadius: '12px', padding: '12px' }}
                  />
                )}

                {addressMode === 'MAP' && (
                  <div>
                    <div
                      style={{
                        height: '220px',
                        backgroundColor: '#E2E8F0',
                        borderRadius: '14px',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: 'radial-gradient(#6B21A8 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                        cursor: 'crosshair'
                      }}
                      onClick={handleMapCanvasClick}
                    >
                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#1E1535', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <CompassFilled style={{ color: '#FC8019' }} /> Click on map to pin location
                      </div>

                      <div style={{
                        position: 'absolute',
                        left: `${mapPinPos.x}px`,
                        top: `${mapPinPos.y}px`,
                        transform: 'translate(-50%, -100%)',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none'
                      }}>
                        <EnvironmentFilled style={{ color: '#E23744', fontSize: '36px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#FAF5FF', borderRadius: '10px', color: '#1E1535', fontWeight: 700, fontSize: '13px' }}>
                      📍 {mapLocationText}
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Right Column: Coupons & Bill Details */}
            <Col xs={24} md={9}>
              {/* Coupons Drawer */}
              <Card className="swiggy-card" style={{ marginBottom: '24px' }} bodyStyle={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '15px', color: '#1E1535' }}>
                    <TagFilled style={{ color: '#6B21A8' }} /> Coupons & Offers
                  </div>
                  <Button
                    type="link"
                    style={{ color: '#6B21A8', fontWeight: 900, padding: 0 }}
                    onClick={() => setCouponDrawerOpen(true)}
                  >
                    APPLY
                  </Button>
                </div>

                {appliedCoupon && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BFE7C7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <Tag color="green" style={{ fontWeight: 800 }}>{appliedCoupon.code}</Tag>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F8A65' }}>₹{appliedCoupon.discount.toFixed(2)} Saved!</span>
                    </div>
                    <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#E43B4F' }} />} onClick={() => setAppliedCoupon(null)} />
                  </div>
                )}
              </Card>

              {/* Bill Details */}
              <Card className="swiggy-card" bodyStyle={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1E1535', margin: '0 0 16px 0' }}>
                  Bill Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#686B78' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Item Total</span>
                    <span style={{ fontWeight: 700, color: '#1E1535' }}>₹{calculateItemTotal().toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee</span>
                    <span style={{ fontWeight: 700, color: '#1E1535' }}>₹35.00</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Govt Taxes & Charges (5%)</span>
                    <span style={{ fontWeight: 700, color: '#1E1535' }}>₹{(calculateItemTotal() * 0.05).toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F8A65', fontWeight: 800 }}>
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#1E1535' }}>
                    <span>TOTAL PAYABLE</span>
                    <span>₹{calculateFinalTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1E1535', marginBottom: '8px' }}>
                    Payment Method:
                  </div>
                  <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Radio value="COD">Cash on Delivery (COD)</Radio>
                    <Radio value="CARD">Credit / Debit Card</Radio>
                  </Radio.Group>
                </div>

                <Button
                  block
                  type="primary"
                  size="large"
                  loading={placingOrder}
                  onClick={handlePlaceOrder}
                  style={{
                    background: 'linear-gradient(135deg, #6B21A8 0%, #FC8019 100%)',
                    borderColor: 'transparent',
                    borderRadius: '14px',
                    height: '52px',
                    fontWeight: 900,
                    fontSize: '16px',
                    marginTop: '24px',
                    boxShadow: '0 6px 20px rgba(107,33,168,0.35)'
                  }}
                >
                  PLACE ORDER • ₹{calculateFinalTotal().toFixed(2)}
                </Button>
              </Card>
            </Col>
          </Row>
        )}

        {/* Coupons Modal Drawer */}
        <Modal
          title="Available Coupons & Offers"
          open={couponDrawerOpen}
          onCancel={() => setCouponDrawerOpen(false)}
          footer={null}
        >
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <Input
              placeholder="Enter promo code (e.g. SWIGGYIT)"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <Button type="primary" style={{ backgroundColor: '#6B21A8', borderColor: '#6B21A8', fontWeight: 800 }} onClick={handleManualCouponCode}>
              APPLY
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableCoupons.map((c) => (
              <div key={c.code} style={{ border: '1px dashed #6B21A8', borderRadius: '12px', padding: '16px', backgroundColor: '#FAF5FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="purple" style={{ fontWeight: 800, fontSize: '13px' }}>{c.code}</Tag>
                  <Button type="link" style={{ color: '#6B21A8', fontWeight: 800 }} onClick={() => handleApplyCoupon(c)}>
                    APPLY
                  </Button>
                </div>
                <div style={{ fontWeight: 800, color: '#1E1535', marginTop: '6px' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: '#686B78', marginTop: '2px' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default Cart;
