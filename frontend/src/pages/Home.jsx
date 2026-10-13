import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Row, Col, Card, Tag, Button, Spin, Empty, message } from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled, StarFilled, ClockCircleOutlined, EnvironmentOutlined, FireOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, SNACKS, BIRYANI, PIZZA, CHINESE, SWEETS, TOP_RATED, OFFERS

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resData, catData, wishData] = await Promise.all([
        api.get('/public/restaurants'),
        api.get('/public/categories'),
        api.get('/customer/wishlist').catch(() => ({ data: [] })),
      ]);

      setRestaurants(resData.data || []);
      setCategories(catData.data || []);
      const wishSet = new Set((wishData.data || []).map(r => r.id));
      setWishlistIds(wishSet);
    } catch (error) {
      message.error('Failed to load restaurants list');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (e, restaurantId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'CUSTOMER') {
      message.warning('Please log in as a Customer to save favorites!');
      navigate('/login');
      return;
    }

    const isWishlisted = wishlistIds.has(restaurantId);
    try {
      if (isWishlisted) {
        await api.delete(`/customer/wishlist/remove/${restaurantId}`);
        wishlistIds.delete(restaurantId);
        message.success('Removed from favorites');
      } else {
        await api.post(`/customer/wishlist/add/${restaurantId}`);
        wishlistIds.add(restaurantId);
        message.success('Added to favorites!');
      }
      setWishlistIds(new Set(wishlistIds));
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  // Filter restaurants based on Search Query & Filter Pills
  const filteredRestaurants = restaurants.filter(r => {
    const name = r.name.toLowerCase();
    const desc = r.description.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || desc.includes(query) || r.address.toLowerCase().includes(query);

    let matchesFilter = true;
    if (activeFilter === 'SNACKS') {
      matchesFilter = desc.includes('snack') || desc.includes('sweet') || desc.includes('bakery') || name.includes('haldiram') || name.includes('chai') || name.includes('sweets');
    } else if (activeFilter === 'BIRYANI') {
      matchesFilter = desc.includes('biryani') || name.includes('biryani') || name.includes('bawarchi');
    } else if (activeFilter === 'PIZZA') {
      matchesFilter = desc.includes('pizza') || name.includes('pizza') || name.includes('domino') || name.includes('oven');
    } else if (activeFilter === 'CHINESE') {
      matchesFilter = desc.includes('noodle') || desc.includes('chinese') || desc.includes('momo') || name.includes('wok');
    } else if (activeFilter === 'SWEETS') {
      matchesFilter = desc.includes('ice cream') || desc.includes('dessert') || desc.includes('donut') || desc.includes('waffle') || desc.includes('kulfi');
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ backgroundColor: '#F4F3F8', minHeight: '100vh', paddingBottom: '60px' }}>
      <Navbar />

      {/* Swiggy + Zomato Purple Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2B1E4A 0%, #1E1535 100%)',
        padding: '36px 0',
        color: '#FFFFFF',
        marginBottom: '28px',
        borderBottom: '4px solid #FC8019'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <Tag color="#FC8019" style={{ fontWeight: 900, padding: '4px 14px', borderRadius: '12px', fontSize: '13px', border: 'none' }}>
                <FireOutlined /> SWIGGY & ZOMATO TOP OUTLETS
              </Tag>
              <h1 style={{ color: '#FFFFFF', fontSize: '34px', margin: '12px 0 6px 0', fontWeight: 900 }}>
                Order from 25+ Top Restaurants & Snack Shops
              </h1>
              <p style={{ color: '#D8B4FE', margin: 0, fontSize: '16px', fontWeight: 500 }}>
                Explore 250+ delicious dishes delivered piping hot to your doorstep!
              </p>
            </div>

            {/* Search Input */}
            <div style={{ width: '100%', maxWidth: '440px' }}>
              <Input
                placeholder="Search Biryani, Pizzas, Sweets, Snacks..."
                prefix={<SearchOutlined style={{ color: '#A855F7', fontSize: '18px' }} />}
                size="large"
                allowClear
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderRadius: '16px',
                  padding: '10px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Category Pills Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '28px',
          scrollbarWidth: 'none'
        }}>
          <button
            className={`category-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            🍽️ All 25 Outlets
          </button>

          <button
            className={`category-pill ${activeFilter === 'SNACKS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SNACKS')}
          >
            🍡 Sweets & Snack Shops
          </button>

          <button
            className={`category-pill ${activeFilter === 'BIRYANI' ? 'active' : ''}`}
            onClick={() => setActiveFilter('BIRYANI')}
          >
            🍲 Hyderabadi Biryani
          </button>

          <button
            className={`category-pill ${activeFilter === 'PIZZA' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PIZZA')}
          >
            🍕 Gourmet Pizzas
          </button>

          <button
            className={`category-pill ${activeFilter === 'CHINESE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('CHINESE')}
          >
            🍜 Chinese & Momos
          </button>

          <button
            className={`category-pill ${activeFilter === 'SWEETS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SWEETS')}
          >
            🍦 Ice Creams & Waffles
          </button>
        </div>

        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1E1535' }}>
            Available Outlets ({filteredRestaurants.length})
          </h2>
          <span style={{ color: '#686B78', fontWeight: 600, fontSize: '14px' }}>
            250+ Dishes Live
          </span>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '12px', color: '#686B78' }}>Loading 25+ restaurants and snack shops...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '50px', borderRadius: '18px' }}>
            <Empty description="No outlets found matching your category filter." />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredRestaurants.map((restaurant, idx) => {
              const isWishlisted = wishlistIds.has(restaurant.id);
              const isSnackShop = restaurant.description.toLowerCase().includes('snack') || restaurant.description.toLowerCase().includes('sweet') || restaurant.description.toLowerCase().includes('bakery') || restaurant.name.toLowerCase().includes('haldiram') || restaurant.name.toLowerCase().includes('chai');

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={restaurant.id}>
                  <div
                    className="swiggy-card"
                    style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    {/* Image Banner */}
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                        alt={restaurant.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Outlet Type Tag */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <Tag color={isSnackShop ? "#722ED1" : "#108EE9"} style={{ fontWeight: 800, borderRadius: '8px', border: 'none', padding: '3px 10px' }}>
                          {isSnackShop ? 'SNACK SHOP' : 'RESTAURANT'}
                        </Tag>
                      </div>

                      {/* Favorites Toggle */}
                      <button
                        onClick={(e) => toggleWishlist(e, restaurant.id)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                        }}
                      >
                        {isWishlisted ? (
                          <HeartFilled style={{ color: '#E43B4F', fontSize: '18px' }} />
                        ) : (
                          <HeartOutlined style={{ color: '#686B78', fontSize: '18px' }} />
                        )}
                      </button>

                      {/* Active Offer Banner */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(30,21,53,0.9) 0%, rgba(30,21,53,0) 100%)',
                        padding: '24px 12px 8px 12px',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '15px'
                      }}>
                        {isSnackShop ? 'FLAT ₹50 OFF ON SNACKS' : '50% OFF UP TO ₹120'}
                      </div>
                    </div>

                    {/* Outlet Details */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#1E1535', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {restaurant.name}
                      </h3>

                      {/* Swiggy Star Rating & Delivery Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span className="swiggy-rating-badge">
                          <StarFilled style={{ fontSize: '11px' }} /> 4.5
                        </span>
                        <span style={{ fontSize: '13px', color: '#686B78', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ClockCircleOutlined /> 15-20 mins
                        </span>
                        <span style={{ fontSize: '13px', color: '#686B78', fontWeight: 600 }}>
                          • ₹200 for two
                        </span>
                      </div>

                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#686B78',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {restaurant.description}
                      </p>

                      <div style={{ marginTop: 'auto', paddingTop: '12px', fontSize: '12px', color: '#93959F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <EnvironmentOutlined /> {restaurant.address}
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Home;
