// server.js
// Generated: 2025-05-27T09:07:42-04:00
// [FLAG: 2025-05-27T17:50:00-04:00] Updated to use configuration file

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // [FLAG: 2025-05-27T18:05:00-04:00] Added CORS support

// Import configuration
const config = require('./config');

// Initialize express app
const app = express();
// [FLAG: 2025-05-27T18:10:00-04:00] Changed port to 3001 to avoid conflicts with Next.js
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev')); // Logging

// [FLAG: 2025-05-27T18:05:00-04:00] Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Allow only GET and POST methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));

// Serve static files directly from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to log requests
const logRequest = (req, payload, responseType) => {
  console.log(`[${new Date().toISOString()}] Request to: ${req.originalUrl}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  console.log(`Response Type: ${responseType}`);
};

/**
 * Main endpoint handler for /v2/generations/:id
 * 
 * [FLAG: 2025-05-27T17:55:00-04:00] Updated to use simplified configuration
 * Handles different collection IDs and returns appropriate responses based on payload and configuration
 */
app.post('/v2/generations/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] Received request for collection ID: ${id}`);
  console.log(`Payload:`, payload);
  
  // Get the collection configuration for this ID
  const collection = config.getCollectionById(id);
  
  if (!collection) {
    // Unknown collection ID
    logRequest(req, payload, 'Unknown collection ID');
    res.status(404).json({
      error: 'Unknown collection ID',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Use payload directly since we're not mapping parameters anymore
  const params = payload;
  console.log(`Parameters:`, params);
  
  // Determine the appropriate response
  const responseConfig = config.determineResponse(collection, params);
  console.log(`Response config:`, responseConfig);
  
  if (!responseConfig) {
    // No response configuration found
    logRequest(req, payload, 'No response configuration');
    res.status(500).json({
      error: 'No response configuration found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Send the response based on the configuration
  handleConfiguredResponse(req, res, collection, params, responseConfig);
});

/**
 * Handler for configured responses
 * 
 * [FLAG: 2025-05-27T17:50:00-04:00] New handler that uses the configuration file
 * to determine the appropriate response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} collection - Collection configuration
 * @param {Object} params - Request parameters (already mapped)
 * @param {Object} responseConfig - Response configuration
 */
function handleConfiguredResponse(req, res, collection, params, responseConfig) {
  // Log the request
  logRequest(req, params, `${collection.id}-${responseConfig.type}`);
  
  // Handle different response types
  switch (responseConfig.type) {
    case 'image':
      // Send an image file
      if (responseConfig.file) {
        const filePath = path.join(__dirname, `public/images/${responseConfig.file}`);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', responseConfig.contentType || 'image/svg+xml');
          res.sendFile(filePath);
        } else {
          // File not found, send an error
          res.status(500).json({
            error: `Image file not found: ${responseConfig.file}`,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // No file specified, send an error
        res.status(500).json({
          error: 'No image file specified in response configuration',
          timestamp: new Date().toISOString()
        });
      }
      break;
      
    case 'json':
      // Send a JSON response
      res.status(200).json({
        ...responseConfig.data,
        collectionId: collection.id,
        params,
        timestamp: new Date().toISOString()
      });
      break;
      
    default:
      // Unknown response type, send an error
      res.status(500).json({
        error: `Unknown response type: ${responseConfig.type}`,
        timestamp: new Date().toISOString()
      });
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log('Available endpoints:');
  
  // List available collections from configuration
  config.collections.forEach(collection => {
    console.log(`- POST /v2/generations/${collection.id}`);
  });
});
