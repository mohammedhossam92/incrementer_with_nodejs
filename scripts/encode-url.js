// Simple utility to encode URL components
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

// Main menu function
function mainMenu() {
  console.log('\n--- URL Utility Menu ---');
  console.log('1. Encode URL component');
  console.log('2. Test API endpoint');
  console.log('3. Exit');
  
  rl.question('Select an option (1-3): ', (option) => {
    switch(option) {
      case '1':
        encodeComponent();
        break;
      case '2':
        testEndpoint();
        break;
      case '3':
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