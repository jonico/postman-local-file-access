# postman-local-file-access
Simple node app to expose local directory CRUD for use with Postman

# Local FileSystem REST API

A secure REST API that exposes local filesystem operations with authentication.

## Features

- 🔒 Secure authentication with token
- 📁 CRUD operations for files and directories
- 🔍 Directory listing
- 🚫 Path traversal protection
- 🌐 Web UI for easy file management
- 🐳 Docker support
- 📚 [Postman collection](Postman%20Collections/postman-local-file-access.json) included for testing

## Testing with Postman

Import the [Postman collection](Postman%20Collections/postman-local-file-access.json) to test all endpoints. The collection includes:
- Authentication setup
- File operations (read, create, update, delete)
- Directory operations (list, create, delete)
- Example requests with proper headers and body formats

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
```json
{
    "error": "Error message description",
    "code": "ERROR_CODE"  // Optional error code
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional):
   ```
   AUTH_TOKEN=your-predefined-token
   PORT=3000
   ```

## Running the Application

### Standard Mode

```bash
npm start
```

### Docker Mode

#### Build Docker Image

```bash
docker build -t local-filesystem-api .
```

#### Run Docker Container

```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data local-filesystem-api
```

## Authentication

If no `AUTH_TOKEN` is set in the environment variables, you need to set it via the API:

```bash
curl -X POST http://localhost:3000/api/auth -H "Content-Type: application/json" -d '{"token": "your-token"}'
```

## API Endpoints

- `POST /api/auth/setup` - Initial token setup (only available if no token is set)
- `GET /api/files/:path` - Read file contents
- `POST /api/files/:path` - Create/Upload/Override file
- `PUT /api/files/:path` - Update file contents if it exists
- `DELETE /api/files/:path` - Delete file if it exists
- `GET /api/directories` - List directory contents
- `POST /api/directories/:path` - Create directory
- `DELETE /api/directories/:path` - Delete (empty )directory

## Web UI

Access the web interface at `http://localhost:3000`

## Security

- Path traversal protection prevents accessing files outside the root directory
- All API endpoints require authentication
- Initial token setup can only be done once
- Docker container runs with limited privileges

## Postman Collection

Import the included `FileSystem-API.postman_collection.json` to test all endpoints.






