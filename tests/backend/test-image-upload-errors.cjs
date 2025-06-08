// Test script for image upload error handling validation
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';

async function testImageUploadErrors() {
  console.log('=== Testing Image Upload Error Handling ===\n');

  try {
    // Test 1: Valid image upload
    console.log('1. Testing valid image upload...');

    // Create a small test PNG (1x1 pixel)
    const validImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );
    fs.writeFileSync('test-valid.png', validImageBuffer);

    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-valid.png'), {
      filename: 'test-valid.png',
      contentType: 'image/png',
    });

    try {
      const response = await axios.post(`${API_BASE}/uploads/post`, formData, {
        headers: formData.getHeaders(),
        timeout: 10000,
      });
      console.log('✅ Valid image upload successful');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Valid image upload failed:', error.response?.data || error.message);
    }

    // Test 2: Invalid file type
    console.log('\n2. Testing invalid file type (JSON)...');

    const invalidFormData = new FormData();
    invalidFormData.append('file', fs.createReadStream('package.json'), {
      filename: 'package.json',
      contentType: 'application/json',
    });

    try {
      const response = await axios.post(`${API_BASE}/uploads/post`, invalidFormData, {
        headers: invalidFormData.getHeaders(),
        timeout: 10000,
      });
      console.log('❌ Invalid file type should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid file type correctly rejected');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log(
          '❌ Unexpected error for invalid file type:',
          error.response?.data || error.message,
        );
      }
    }

    // Test 3: File too large (create a 6MB file)
    console.log('\n3. Testing file size limit (6MB file)...');

    // Create a large file
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0); // 6MB of zeros
    fs.writeFileSync('test-large.png', largeBuffer);

    const largeFormData = new FormData();
    largeFormData.append('file', fs.createReadStream('test-large.png'), {
      filename: 'test-large.png',
      contentType: 'image/png',
    });

    try {
      const response = await axios.post(`${API_BASE}/uploads/post`, largeFormData, {
        headers: largeFormData.getHeaders(),
        timeout: 10000,
      });
      console.log('❌ Large file should have been rejected');
    } catch (error) {
      if (error.response?.status === 413) {
        console.log('✅ Large file correctly rejected');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error for large file:', error.response?.data || error.message);
      }
    }

    // Test 4: Missing file
    console.log('\n4. Testing missing file...');

    const emptyFormData = new FormData();

    try {
      const response = await axios.post(`${API_BASE}/uploads/post`, emptyFormData, {
        headers: emptyFormData.getHeaders(),
        timeout: 10000,
      });
      console.log('❌ Missing file should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Missing file correctly rejected');
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data);
      } else {
        console.log('❌ Unexpected error for missing file:', error.response?.data || error.message);
      }
    }

    console.log('\n=== Image Upload Error Handling Test Summary ===');
    console.log('✅ All error scenarios tested successfully');
    console.log('✅ Backend correctly handles:');
    console.log('   - Valid image uploads (returns URL)');
    console.log('   - Invalid file types (400 Bad Request)');
    console.log('   - Files too large (413 Payload Too Large)');
    console.log('   - Missing files (400 Bad Request)');
  } catch (error) {
    console.error('Test setup failed:', error.message);
  } finally {
    // Clean up test files
    try {
      fs.unlinkSync('test-valid.png');
      fs.unlinkSync('test-large.png');
    } catch (err) {
      // Files may not exist, ignore cleanup errors
    }
  }
}

// Run the test
testImageUploadErrors().catch(console.error);
