#!/bin/bash

# Test script for upload endpoints
echo "Testing upload endpoints..."

# Create test directories
mkdir -p ./uploads/profile
mkdir -p ./uploads/posts

# Test with a simple text file (will be rejected due to mimetype filter)
echo "Testing with invalid file type..."
curl -X POST \
  http://localhost:3001/api/uploads/profile \
  -H "Content-Type: multipart/form-data" \
  -F "file=@package.json" \
  | echo "Response: $(cat)"

echo -e "\n\nUpload endpoints are configured!"
echo "To test with actual images:"
echo "curl -X POST http://localhost:3001/api/uploads/profile -F 'file=@your-image.jpg'"
echo "curl -X POST http://localhost:3001/api/uploads/post -F 'file=@your-image.png'"

echo -e "\n\nEndpoints available:"
echo "- POST /api/uploads/profile (for profile avatars)"
echo "- POST /api/uploads/post (for post images)"
echo "- File size limit: 5MB"
echo "- Allowed formats: JPEG, JPG, PNG"
echo "- Files stored in ./uploads/profile/ and ./uploads/posts/"
