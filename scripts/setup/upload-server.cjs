const http = require('http');
const fs = require('fs');
const path = require('path');
const { formidable } = require('formidable');

// Simple in-memory storage for uploaded files
const uploadedFiles = new Map();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': true
};

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'POST' && url.pathname === '/api/upload') {
    handleFileUpload(req, res);
  } else if (req.method === 'GET' && url.pathname.startsWith('/api/check/')) {
    const uploadId = url.pathname.split('/').pop();
    handleCheckUpload(uploadId, res);
  } else if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

function handleFileUpload(req, res) {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    allowEmptyFiles: false,
    minFileSize: 1
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upload failed', details: err.message }));
      return;
    }

    const uploadId = fields.uploadId;
    const file = files.file;

    if (!uploadId || !file) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing uploadId or file' }));
      return;
    }

    // Store file info (in production, you'd save to disk or cloud storage)
    uploadedFiles.set(uploadId.toString(), {
      filename: file.originalFilename || file.newFilename,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date().toISOString(),
      // In production, store file path instead of content
      content: fs.readFileSync(file.filepath)
    });

    console.log(`File uploaded for ID ${uploadId}: ${file.originalFilename} (${file.size} bytes)`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      uploadId: uploadId.toString(),
      filename: file.originalFilename,
      size: file.size
    }));
  });
}

function handleCheckUpload(uploadId, res) {
  const fileInfo = uploadedFiles.get(uploadId);
  
  if (fileInfo) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      found: true,
      filename: fileInfo.filename,
      size: fileInfo.size,
      type: fileInfo.type,
      uploadedAt: fileInfo.uploadedAt
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ found: false }));
  }
}

// Clean up old uploads periodically (every 30 minutes)
setInterval(() => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  for (const [uploadId, fileInfo] of uploadedFiles.entries()) {
    if (new Date(fileInfo.uploadedAt) < thirtyMinutesAgo) {
      uploadedFiles.delete(uploadId);
      console.log(`Cleaned up expired upload: ${uploadId}`);
    }
  }
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/upload - Upload files');
  console.log('  GET /api/check/:uploadId - Check upload status');
  console.log('  GET /api/health - Health check');
});