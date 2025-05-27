# Mock Generator API

A simple mock endpoint server that returns different images based on the payload.

## Generated: 2025-05-27T09:07:42-04:00

## Overview

This server provides mock endpoints that return different SVG images based on the request payload. It's designed to simulate API responses for testing purposes.

## Endpoints

### Base URL
`/v2/generations`

### Available IDs
1. `xxx-xxx-xxx` - Has 2 response types:
   - Default: Echoes back the payload
   - Special: Returns image1.svg when payload has `{ "special": true }`

2. `yyy-yyy-yyy` - Has 7 response types:
   - Default: Returns image2.svg
   - Special: Returns different images based on payload `type` field:
     - `type1`: Returns image3.svg
     - `type2`: Returns image4.svg
     - `type3`: Returns image5.svg
     - `type4`: Returns image6.svg
     - `type5`: Returns image7.svg
     - `type6`: Returns image8.svg
     - Any other type: Returns image9.svg

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with auto-reload during development
npm run dev
```

## Usage Examples

### Default response for xxx-xxx-xxx
```bash
curl -X POST http://localhost:3000/v2/generations/xxx-xxx-xxx \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Special response for xxx-xxx-xxx
```bash
curl -X POST http://localhost:3000/v2/generations/xxx-xxx-xxx \
  -H "Content-Type: application/json" \
  -d '{"special": true}'
```

### Default response for yyy-yyy-yyy
```bash
curl -X POST http://localhost:3000/v2/generations/yyy-yyy-yyy \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Special response for yyy-yyy-yyy
```bash
curl -X POST http://localhost:3000/v2/generations/yyy-yyy-yyy \
  -H "Content-Type: application/json" \
  -d '{"type": "type3"}'
```

## Images

The server includes 9 different SVG images:
- image1.svg: Red with number 1
- image2.svg: Blue with number 2
- image3.svg: Green with number 3
- image4.svg: Purple with number 4
- image5.svg: Pink with number 5
- image6.svg: Gold with number 6
- image7.svg: Indigo with number 7
- image8.svg: Teal with number 8
- image9.svg: Maroon with number 9

## Configuration

The server runs on port 3000 by default. You can change this by setting the PORT environment variable.
