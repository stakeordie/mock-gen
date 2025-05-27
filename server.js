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

// [FLAG: 2025-05-27T18:15:00-04:00] In-memory storage for job status
const jobsStore = new Map();

// Helper function to generate a UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
 * Main endpoint handler for /collections/:id/generations
 * 
 * [FLAG: 2025-05-27T18:10:00-04:00] Updated to match the EmProps API endpoint structure
 * Handles different collection IDs and returns appropriate responses based on payload and configuration
 */
app.post('/collections/:id/generations', (req, res) => {
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
  
  // [FLAG: 2025-05-27T18:15:00-04:00] Extract variables from the payload
  let params;
  if (payload.variables) {
    // If payload has a variables object, use that
    params = payload.variables;
    console.log(`Variables from payload:`, params);
  } else {
    // For backward compatibility, use the payload directly
    params = payload;
    console.log(`Parameters from payload:`, params);
  }
  
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
  
  // [FLAG: 2025-05-27T18:15:00-04:00] Create a job ID and store the response config
  const jobId = generateUUID();
  
  // [FLAG: 2025-05-27T18:15:00-04:00] Store the job with initial status
  const timestamp = new Date().toISOString();
  jobsStore.set(jobId, {
    id: jobId,
    name: `Collection Generation: ${collection.id}`,
    description: `Generation job for collection ${id}`,
    status: 'pending',
    progress: 0,
    error_message: null,
    created_at: timestamp,
    updated_at: timestamp,
    started_at: null,
    completed_at: null,
    job_type: 'collection_generation',
    priority: 1,
    data: {
      outputs: [],
      variables: params,
      collectionId: id
    },
    // Additional fields for internal use
    responseConfig
  });
  
  // [FLAG: 2025-05-27T18:15:00-04:00] Schedule job progress updates and completion
  // First update at 1 second - 30% progress
  setTimeout(() => {
    const job = jobsStore.get(jobId);
    if (job) {
      const timestamp = new Date().toISOString();
      job.status = 'processing';
      job.progress = 30;
      job.updated_at = timestamp;
      if (!job.started_at) {
        job.started_at = timestamp;
      }
      jobsStore.set(jobId, job);
    }
  }, 1000);
  
  // Second update at 2 seconds - 70% progress
  setTimeout(() => {
    const job = jobsStore.get(jobId);
    if (job) {
      job.status = 'processing';
      job.progress = 70;
      job.updated_at = new Date().toISOString();
      jobsStore.set(jobId, job);
    }
  }, 2000);
  
  // Final update at 3 seconds - completed (100% progress)
  setTimeout(() => {
    const job = jobsStore.get(jobId);
    if (job) {
      const timestamp = new Date().toISOString();
      job.status = 'completed';
      job.progress = 100;
      job.updated_at = timestamp;
      job.completed_at = timestamp;
      jobsStore.set(jobId, job);
    }
  }, 3000); // 3 second delay
  
  // Return the job ID immediately
  res.status(202).json({
    jobId,
    status: 'pending',
    message: 'Generation job started',
    timestamp: new Date().toISOString()
  });
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

/**
 * Job status endpoint handler for /jobs/:jobId/events
 * 
 * [FLAG: 2025-05-27T18:20:00-04:00] Added endpoint to check job status
 * [FLAG: 2025-05-27T18:15:00-04:00] Updated to match EmProps API format
 */
app.get('/jobs/:jobId/events', (req, res) => {
  const { jobId } = req.params;
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] Received request for job status: ${jobId}`);
  
  // Check if the job exists
  if (!jobsStore.has(jobId)) {
    res.status(404).json({
      error: 'Job not found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Get the job status
  const job = jobsStore.get(jobId);
  
  // Return the job status in the format expected by the client
  res.status(200).json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    error_message: job.error_message,
    updated_at: job.updated_at
  });
});

/**
 * Job details endpoint handler for /jobs/:jobId
 * 
 * [FLAG: 2025-05-27T18:20:00-04:00] Added endpoint to get job details
 * Returns the full details of a job
 */
app.get('/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] Received request for job details: ${jobId}`);
  
  // Check if the job exists
  if (!jobsStore.has(jobId)) {
    res.status(404).json({
      error: 'Job not found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Get the job
  const job = jobsStore.get(jobId);
  
  // Return the job details in the format expected by the client
  res.status(200).json({
    data: {
      id: job.id,
      name: job.name,
      description: job.description,
      status: job.status,
      progress: job.progress,
      error_message: job.error_message,
      created_at: job.created_at,
      updated_at: job.updated_at,
      started_at: job.started_at,
      completed_at: job.completed_at,
      job_type: job.job_type,
      priority: job.priority,
      data: job.data
    },
    error: null
  });
});

/**
 * Job result endpoint handler for /jobs/:jobId/result
 * 
 * [FLAG: 2025-05-27T18:20:00-04:00] Added endpoint to get job result
 * [FLAG: 2025-05-27T18:15:00-04:00] Updated to match EmProps API format
 * Returns the result of a completed job
 */
app.get('/jobs/:jobId/result', (req, res) => {
  const { jobId } = req.params;
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] Received request for job result: ${jobId}`);
  
  // Check if the job exists
  if (!jobsStore.has(jobId)) {
    res.status(404).json({
      error: 'Job not found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Get the job
  const job = jobsStore.get(jobId);
  
  // Check if the job is completed
  if (job.status !== 'completed') {
    res.status(400).json({
      error: 'Job not completed yet',
      status: job.status,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // [FLAG: 2025-05-27T18:38:00-04:00] For image responses, convert to base64 and return in JSON format
  if (job.responseConfig.type === 'image') {
    // Get the file path
    const filePath = path.join(__dirname, `public/images/${job.responseConfig.file}`);
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      try {
        // Log that we're reading the image file
        console.log(`[${new Date().toISOString()}] Reading image file: ${job.responseConfig.file}`);
        
        // Read the file as binary data
        const imageBuffer = fs.readFileSync(filePath);
        
        // Convert to base64
        const base64Image = imageBuffer.toString('base64');
        console.log(`[${new Date().toISOString()}] Converted image to base64, length: ${base64Image.length}`);
        
        // Get the content type
        const contentType = job.responseConfig.contentType || 'image/png';
        
        // Return the job result with base64-encoded image
        const timestamp = new Date().toISOString();
        res.status(200).json({
          data: {
            id: job.id,
            name: job.name,
            description: job.description,
            status: job.status,
            progress: job.progress,
            error_message: job.error_message,
            created_at: job.created_at,
            updated_at: timestamp,
            started_at: job.started_at,
            completed_at: job.completed_at,
            job_type: job.job_type,
            priority: job.priority,
            data: {
              outputs: [
                {
                  type: 'image',
                  content: base64Image,
                  mime_type: contentType,
                  width: 512,  // Default values
                  height: 512
                }
              ],
              variables: job.data.variables,
              collectionId: job.data.collectionId
            }
          },
          error: null
        });
      } catch (error) {
        // Error reading or processing the file
        console.error(`[${new Date().toISOString()}] Error processing image file: ${error.message}`);
        res.status(500).json({
          data: null,
          error: `Error processing image file: ${error.message}`
        });
      }
    } else {
      // File not found, send an error
      console.error(`[${new Date().toISOString()}] Image file not found: ${job.responseConfig.file}`);
      res.status(500).json({
        data: null,
        error: `Image file not found: ${job.responseConfig.file}`
      });
    }
    return;
  }
  
  // For other response types, use the configured handler
  handleConfiguredResponse(req, res, { id: job.collectionId }, job.params, job.responseConfig);
});

// Start the server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log('Available endpoints:');
  
  // List available collections from configuration
  config.collections.forEach(collection => {
    console.log(`- POST /collections/${collection.id}/generations`);
  });
  console.log('- GET /jobs/:jobId/events');
  console.log('- GET /jobs/:jobId');
  console.log('- GET /jobs/:jobId/result');
});
