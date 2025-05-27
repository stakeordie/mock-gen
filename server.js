// server.js
// Generated: 2025-05-27T09:07:42-04:00

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev')); // Logging
app.use('/static', express.static(path.join(__dirname, 'public')));

// Helper function to log requests
const logRequest = (req, payload, responseType) => {
  console.log(`[${new Date().toISOString()}] Request to: ${req.originalUrl}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  console.log(`Response Type: ${responseType}`);
};

// Routes
app.get('/', (req, res) => {
  res.send('Mock Generator API is running. Use /v2/generations/:id endpoint with POST requests.');
});

/**
 * Main endpoint handler for /v2/generations/:id
 * Handles different IDs and returns appropriate responses based on payload
 */
app.post('/v2/generations/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] Received request for ID: ${id}`);
  
  // Handle different IDs
  switch (id) {
    case 'xxx-xxx-xxx':
      handleXxxEndpoint(req, res, payload);
      break;
    case 'yyy-yyy-yyy':
      handleYyyEndpoint(req, res, payload);
      break;
    default:
      // Unknown ID
      logRequest(req, payload, 'Unknown ID');
      res.status(404).json({
        error: 'Unknown generation ID',
        timestamp: new Date().toISOString()
      });
  }
});

/**
 * Handler for xxx-xxx-xxx endpoint
 * Has 2 response types:
 * 1. Default - Echo back the payload
 * 2. Special - Return image1.svg for a specific payload (to be defined)
 */
function handleXxxEndpoint(req, res, payload) {
  // For now, we'll use a simple check to determine which response to send
  // This will be updated when specific payloads are defined
  
  // Check if payload has a specific marker (placeholder logic)
  if (payload && payload.special === true) {
    // Special response - return image1
    logRequest(req, payload, 'xxx-special');
    res.sendFile(path.join(__dirname, 'public/images/image1.svg'));
  } else {
    // Default response - echo back the payload
    logRequest(req, payload, 'xxx-default');
    res.status(200).json({
      id: 'xxx-xxx-xxx',
      echo: payload,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handler for yyy-yyy-yyy endpoint
 * Has 7 response types:
 * 1. Default - Echo back the payload
 * 2-7. Special - Return different images based on payload
 */
function handleYyyEndpoint(req, res, payload) {
  // For now, we'll use a simple check to determine which response to send
  // This will be updated when specific payloads are defined
  
  // Check if payload has a type field (placeholder logic)
  if (payload && payload.type) {
    const type = payload.type;
    let imageNumber;
    
    switch (type) {
      case 'type1':
        imageNumber = 3;
        break;
      case 'type2':
        imageNumber = 4;
        break;
      case 'type3':
        imageNumber = 5;
        break;
      case 'type4':
        imageNumber = 6;
        break;
      case 'type5':
        imageNumber = 7;
        break;
      case 'type6':
        imageNumber = 8;
        break;
      default:
        imageNumber = 9; // Default special case
    }
    
    // Return the appropriate image
    logRequest(req, payload, `yyy-type${type}`);
    res.sendFile(path.join(__dirname, `public/images/image${imageNumber}.svg`));
  } else {
    // Default response - echo back the payload with image2
    logRequest(req, payload, 'yyy-default');
    res.sendFile(path.join(__dirname, 'public/images/image2.svg'));
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /v2/generations/xxx-xxx-xxx');
  console.log('- POST /v2/generations/yyy-yyy-yyy');
});
