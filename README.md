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
- 📚 Postman collection included

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
docker build -t local-file-api .
```

#### Run Docker Container

```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data filesystem-api
```

## Authentication

If no `AUTH_TOKEN` is set in the environment variables, you need to set it via the API:

```bash
curl -X POST http://localhost:3000/api/auth -H "Content-Type: application/json" -d '{"token": "your-token"}'
```

## API Endpoints

- `POST /api/auth/setup` - Initial token setup (only available if no token is set)
- `GET /api/files` - List directory contents
- `GET /api/files/:path` - Read file contents
- `POST /api/files/:path` - Create/Upload file
- `PUT /api/files/:path` - Update file contents
- `DELETE /api/files/:path` - Delete file
- `GET /api/directories` - List directories
- `POST /api/directories/:path` - Create directory
- `DELETE /api/directories/:path` - Delete directory

## Web UI

Access the web interface at `http://localhost:3000`

## Security

- Path traversal protection prevents accessing files outside the root directory
- All API endpoints require authentication
- Initial token setup can only be done once
- Docker container runs with limited privileges

## Postman Collection

Import the included `FileSystem-API.postman_collection.json` to test all endpoints.






