// [FLAG: 2025-05-27T17:45:00-04:00] Mock Generator Configuration
// This file defines how the mock generator responds to different collection IDs and parameters

/**
 * Configuration for the mock generator API
 * 
 * This defines how the API responds to different collection IDs and parameters.
 * Each collection has its own endpoint ID and parameter mappings.
 */

/**
 * Collection configurations
 * 
 * [FLAG: 2025-05-27T17:50:00-04:00] Simplified configuration structure
 * 
 * Each collection has:
 * - id: The collection ID that will be used in requests and as the endpoint ID
 * - responseRules: Rules for determining which response to send based on parameters
 * - defaultResponse: Default response if no rules match
 */
const collections = [
  {
    id: 'd3b8e698-8d89-4b7e-b02f-d6269e9a1027',
    responseRules: [
      // Maps parameter combinations to specific image responses
      {
        conditions: {
          art_type: 'Renaissance Oil Painting',
          time_of_day: 'morning'
        },
        response: {
          type: 'image',
          file: 'image3.svg',
          contentType: 'image/svg+xml'
        }
      },
      {
        conditions: {
          art_type: 'Renaissance Oil Painting',
          time_of_day: 'night'
        },
        response: {
          type: 'image',
          file: 'image4.svg',
          contentType: 'image/svg+xml'
        }
      },
      {
        conditions: {
          art_type: 'Graffiti',
          time_of_day: 'morning'
        },
        response: {
          type: 'image',
          file: 'image5.svg',
          contentType: 'image/svg+xml'
        }
      },
      {
        conditions: {
          art_type: 'Graffiti',
          time_of_day: 'night'
        },
        response: {
          type: 'image',
          file: 'image6.svg',
          contentType: 'image/svg+xml'
        }
      },
      {
        conditions: {
          time_of_day: 'dawn'
        },
        response: {
          type: 'image',
          file: 'image7.svg',
          contentType: 'image/svg+xml'
        }
      },
      {
        conditions: {
          time_of_day: 'magic hour'
        },
        response: {
          type: 'image',
          file: 'image8.svg',
          contentType: 'image/svg+xml'
        }
      }
    ],
    // Default response if no specific mapping matches
    defaultResponse: {
      type: 'image',
      file: 'image2.svg',
      contentType: 'image/svg+xml'
    }
  },
  {
    id: 'emprops-pixel-portraits',
    responseRules: [],
    // Default response if no specific mapping matches
    defaultResponse: {
      type: 'json',
      data: {
        message: 'Generated pixel portrait',
        timestamp: new Date().toISOString()
      }
    }
  }
];

/**
 * Get a collection by ID
 * 
 * @param {string} id - Collection ID
 * @returns {Object|null} Collection configuration or null if not found
 */
function getCollectionById(id) {
  return collections.find(collection => collection.id === id) || null;
}

/**
 * [FLAG: 2025-05-27T17:55:00-04:00] Removed getCollectionByEndpointId and mapRequestParameters
 * functions since we're using collection IDs directly and not mapping parameters anymore
 */

/**
 * Determine the appropriate response based on parameters
 * 
 * @param {Object} collection - Collection configuration
 * @param {Object} params - Request parameters (already mapped)
 * @returns {Object} Response configuration
 */
function determineResponse(collection, params) {
  if (!collection || !params) {
    return null;
  }
  
  // If there are no response rules, use the default response
  if (!collection.responseRules || collection.responseRules.length === 0) {
    return collection.defaultResponse || null;
  }
  
  // Find the first rule whose conditions match the parameters
  const matchingRule = collection.responseRules.find(rule => {
    // Check if all conditions match
    return Object.entries(rule.conditions).every(([key, value]) => {
      return params[key] === value;
    });
  });
  
  // Return the matching response or the default response
  return matchingRule?.response || collection.defaultResponse || null;
}

module.exports = {
  collections,
  getCollectionById,
  determineResponse
};
