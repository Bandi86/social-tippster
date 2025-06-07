// Debug script to test frontend API communication
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

async function testAPI() {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/posts');
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Posts count:', response.data.posts.length);
    console.log('📋 First post title:', response.data.posts[0]?.title);
    console.log('🏗️ Response structure:', Object.keys(response.data));
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.error('📋 Error details:', error.response?.data || error);
    return null;
  }
}

testAPI();
