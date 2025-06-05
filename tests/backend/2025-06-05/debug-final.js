const axios = require("axios");

async function debugTypeOrmIssue() {
  console.log("Ì¥ç DEBUGGING TYPEORM ISSUE");
  console.log("=========================");

  try {
    const loginRes = await axios.post("http://localhost:3001/api/auth/login", {
      email: "testuser123@test.com",
      password: "password123",
    });
    const token = loginRes.data.access_token;
    console.log("‚úÖ Login successful");

    const minimalData = {
      title: "Minimal Test",
      content: "Minimal content",
      type: "general"
    };

    console.log("\\nÌ≥ù Testing with minimal data:");
    console.log(JSON.stringify(minimalData, null, 2));

    try {
      const response = await axios.post("http://localhost:3001/api/posts", minimalData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000
      });
      
      console.log("‚úÖ SUCCESS! Post created:");
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log("‚ùå POST CREATION FAILED");
      
      if (error.response) {
        console.log("Status Code:", error.response.status);
        console.log("Response Data:", JSON.stringify(error.response.data, null, 2));
      }
      
      console.log("\\nÌ¥ç Check the backend console for detailed TypeORM error logs");
    }

  } catch (error) {
    console.error("‚ùå Script error:", error.message);
  }
}

debugTypeOrmIssue();
