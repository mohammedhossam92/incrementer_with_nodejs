// Simple utility to encode URL components and handle special characters
const readline = require('readline');
const http = require('http');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to encode URL components
function encodeComponent() {
  rl.question('Enter the text to encode: ', (text) => {
    const encoded = encodeURIComponent(text);
    console.log('\nEncoded text:');
    console.log(encoded);
    
    // Special handling for text with forward slashes
    if (text.includes('/')) {
      console.log('\nWarning: Your text contains forward slashes (/)');
      console.log('This can cause issues with URL routing if not properly handled');
      console.log('Make sure your API endpoints properly decode the encoded value');
      
      // Show alternative encodings
      console.log('\nAlternative encodings you might try:');
      console.log('Base64:', Buffer.from(text).toString('base64'));
      console.log('Custom replacement:', text.replace(/\//g, '--SLASH--'));
    }
    
    mainMenu();
  });
}

// Function to test API endpoint
function testEndpoint() {
  rl.question('Enter the API URL to test: ', (url) => {
    console.log(`Testing endpoint: ${url}`);
    
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      // Log status code
      console.log(`Status Code: ${res.statusCode}`);
      console.log('Headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse body:');
        console.log(data.substring(0, 500) + (data.length > 500 ? '...' : ''));
        
        try {
          JSON.parse(data);
          console.log('\nResponse is valid JSON');
        } catch (e) {
          console.log('\nResponse is NOT valid JSON');
          console.log('Error:', e.message);
        }
        
        mainMenu();
      });
    }).on('error', (err) => {
      console.log('Error:', err.message);
      mainMenu();
    });
  });
}

// Function to test POST request with custom data
function testPostRequest() {
  rl.question('Enter the API URL for POST: ', (url) => {
    rl.question('Enter the category name to send: ', (category) => {
      console.log(`Testing POST to: ${url} with category: ${category}`);
      
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;
      
      // Prepare the data
      const postData = JSON.stringify({ category: category });
      
      // Prepare the request options
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      // Make the request
      const req = client.request(url, options, (res) => {
        let data = '';
        
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('\nResponse body:');
          console.log(data.substring(0, 500) + (data.length > 500 ? '...' : ''));
          
          try {
            JSON.parse(data);
            console.log('\nResponse is valid JSON');
          } catch (e) {
            console.log('\nResponse is NOT valid JSON');
            console.log('Error:', e.message);
          }
          
          mainMenu();
        });
      }).on('error', (err) => {
        console.log('Error:', err.message);
        mainMenu();
      });
      
      // Write data to request body
      req.write(postData);
      req.end();
    });
  });
}

// Main menu function
function mainMenu() {
  console.log('\n--- URL Utility Menu ---');
  console.log('1. Encode URL component');
  console.log('2. Test API endpoint (GET)');
  console.log('3. Test API endpoint (POST)');
  console.log('4. Exit');
  
  rl.question('Select an option (1-4): ', (option) => {
    switch(option) {
      case '1':
        encodeComponent();
        break;
      case '2':
        testEndpoint();
        break;
      case '3':
        testPostRequest();
        break;
      case '4':
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        mainMenu();
    }
  });
}

// Start the program
console.log('URL Utility Tool');
mainMenu();