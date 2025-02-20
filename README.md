# postman-local-file-access
Node app to expose the content a local filesystem folder CRUD style including a reusable package library for use in Postman pre- and post-request scripts

## Features

- 📦 [Reusable Postman library](local-filesystem-api-lib.js) for pre- and post-request scripts that need to manipulate local files
- 🔒 Secure authentication with token
- 📁 CRUD operations for files and directories
- 🌐 Web UI for easy file management / testing

- 🚫 Path traversal protection
- 🐳 Docker support
- 📚 [Postman collection](Postman%20Collections/postman-local-file-access.json) included for testing

## Web UI

Access the web interface at `http://localhost:3000`

## Reusable Postman Library

A reusable Postman library is included in [`local-filesystem-api-lib.js`](local-filesystem-api-lib.js). This library provides a clean interface to interact with the API:

```javascript
const fsLib = pm.require('@your-postman-domain/local-filesystem-api-lib');

// Setup authentication
await fsLib.setupAuth('your-token');

// Create and read files
await fsLib.createFile('example.txt', 'Hello World');
const content = await fsLib.readFile('example.txt');

// Upload binary files (base64)
await fsLib.uploadFile('image.png', 'data:application/octet-stream;base64,...');

// Work with directories
await fsLib.createDirectory('my-folder');
const dirContents = await fsLib.listDirectory('my-folder');
await fsLib.deleteDirectory('my-folder');
```

Check the ["Post Request Scripts" folder in the Postman collection](Postman%20Collections/postman-local-file-access.json) for more examples on how to use in post-request scripts, including:
- File upload and verification
- Directory operations
- Base64 file handling
- Error handling
- Working with subdirectories

## Testing with Postman

Import the [Postman collection](Postman%20Collections/postman-local-file-access.json) to test all endpoints. The collection includes:
- Authentication setup
- File operations (read, create, update, delete)
- Directory operations (list, create, delete)
- Example requests with proper headers and body formats
- Examples of how to use the reusable library in post-request scripts


## API Documentation

### Authentication

All API endpoints (except token setup) require a Bearer token in the Authorization header:
```
Authorization: Bearer your-token
```

### Endpoints

#### Authentication
- `POST /api/auth/setup` - Set up authentication token
  ```http
  POST /api/auth/setup
  Content-Type: application/json

  {
      "token": "your-secret-token"
  }
  ```

#### Files
- `GET /api/files/{path}` - Read file contents
  - Returns file content with appropriate Content-Type header
  - Supports both binary and text files
  - Returns 400 if path points to a directory
  - Returns 404 if file not found

- `POST /api/files/{path}` - Create/Upload file
  - Upload using multipart/form-data with "file" field
  - Returns 400 if path points to a directory
  - Returns 404 if parent directory not found

- `PUT /api/files/{path}` - Update file contents
  ```http
  Content-Type: application/json

  {
      "content": "Updated file content"
  }
  ```
  - Returns 400 if path points to a directory
  - Returns 404 if file not found

- `DELETE /api/files/{path}` - Delete file
  - Returns 400 if path points to a directory
  - Returns 404 if file not found

#### Directories
- `GET /api/directories/{path}` - List directory contents
  - Lists all files and subdirectories
  - Use without path parameter to list root directory
  - Returns array of items with metadata:
  ```json
  [
      {
          "name": "example.txt",
          "path": "folder/example.txt",
          "isDirectory": false,
          "size": 1234,
          "modified": "2024-01-20T12:00:00.000Z"
      }
  ]
  ```

- `POST /api/directories/{path}` - Create directory
  - Returns 400 if directory exists
  - Returns 404 if parent directory not found

- `DELETE /api/directories/{path}` - Delete directory
  - Returns 400 if directory not empty
  - Returns 404 if directory not found

### Error Responses

All error responses follow this format:
```