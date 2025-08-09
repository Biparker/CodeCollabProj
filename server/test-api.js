const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const loginData = {
      email: 'user1@example.com',
      password: 'password123'
    };

    console.log('📤 Sending login request:', loginData);
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('📦 Response:', {
      token: response.data.token ? 'exists' : 'missing',
      user: response.data.user ? 'exists' : 'missing',
      message: response.data.message
    });
    
    if (response.data.token) {
      console.log('🔐 Testing getCurrentUser with token...');
      
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ getCurrentUser successful!');
      console.log('👤 User data:', userResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
}

testLogin();
