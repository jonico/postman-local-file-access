/**
 * Filesystem API Library
 * 
 * A collection of reusable functions for interacting with the local filesystem API.
 * This library provides a clean interface for common local filesystem operations
 * like reading, writing, and managing files and directories through REST endpoints.
 * 
 * GitHub: https://github.com/postman-solutions-eng/postman-local-file-access
 * 
 * This library is part of a Node.js application that exposes local filesystem 
 * folder access through a REST API. It's specifically designed for use in Postman 
 * pre- and post-request scripts that need to manipulate local files.
 * 
 * Key Features:
 * - Secure authentication with token
 * - CRUD operations for files and directories
 * - Path traversal protection
 * - Support for binary and text files
 * - Directory listing and management
 * 
 * Prerequisites:
 * - Requires a running instance of the Filesystem API server
 * - Valid authentication token
 * - Postman environment variables:
 *   - baseUrl: The base URL of your Filesystem API server
 *   - token: Your authentication token (optional, can be passed directly to functions)
 * 
 * Usage Example:
 * ```javascript
 * const fsLib = pm.require('@postman-solutions-eng/local-filesystem-api-lib');
 * 
 * // Setup authentication
 * await fsLib.setupAuth('your-token');
 * 
 * // Read a file
 * const content = await fsLib.readFile('path/to/file');
 * ```
 * 
 * For complete documentation and examples, visit:
 * https://github.com/postman-solutions-eng/postman-local-file-access
 * 
 */

/**
 * Get authentication token from parameter or environment
 * @param {string} [token] - Optional token parameter
 * @returns {string} The token to use
 * @throws {Error} If no token is available
 */
function getToken(token) {
    const envToken = pm.variables.get('token');
    if (!token && !envToken) {
        throw new Error('No token provided and no token found in environment');
    }
    return token || envToken;
}

/**
 * Setup authentication token
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from the auth setup endpoint
 */
async function setupAuth(token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/auth/setup`,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: { mode: 'raw', raw: JSON.stringify({ token: authToken }) }
    });
    
    if (response.code !== 200) {
        throw new Error(`Auth setup failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Read file contents
 * @param {string} path - Path to the file
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<string>} File contents
 */
async function readFile(path, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/files/${path}`,
        method: 'GET',
        header: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.code !== 200) {
        throw new Error(`Read file failed: ${response.json().error}`);
    }
    return response.text();
}

/**
 * Create a new file
 * @param {string} path - Path where to create the file
 * @param {string} content - File content
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from create file endpoint
 */
async function createFile(path, content, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/files/${path}`,
        method: 'POST',
        header: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: { content }
        }
    });
    
    if (response.code !== 200) {
        throw new Error(`Create file failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Update file contents
 * @param {string} path - Path to the file
 * @param {string} content - New file content
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from update file endpoint
 */
async function updateFile(path, content, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/files/${path}`,
        method: 'PUT',
        header: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: { content }
        }
    });
    
    if (response.code !== 200) {
        throw new Error(`Update file failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Delete a file
 * @param {string} path - Path to the file to delete
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from delete file endpoint
 */
async function deleteFile(path, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/files/${path}`,
        method: 'DELETE',
        header: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.code !== 200) {
        throw new Error(`Delete file failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * List directory contents
 * @param {string} [path=''] - Path to the directory
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Array>} Array of directory contents with metadata
 */
async function listDirectory(path = '', token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/directories/${path}`,
        method: 'GET',
        header: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.code !== 200) {
        throw new Error(`List directory failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Create a new directory
 * @param {string} path - Path where to create the directory
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from create directory endpoint
 */
async function createDirectory(path, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/directories/${path}`,
        method: 'POST',
        header: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.code !== 200) {
        throw new Error(`Create directory failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Delete a directory
 * @param {string} path - Path to the directory to delete
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from delete directory endpoint
 */
async function deleteDirectory(path, token) {
    const authToken = getToken(token);
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/directories/${path}`,
        method: 'DELETE',
        header: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.code !== 200) {
        throw new Error(`Delete directory failed: ${response.json().error}`);
    }
    return response.json();
}

/**
 * Upload a file
 * @param {string} path - Path where to upload the file
 * @param {string} fileData - The file data (base64 encoded in the format data:application/octet-stream;base64,...) or raw content
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<Object>} Response from upload file endpoint
 */
async function uploadFile(path, fileData, token) {
    const authToken = getToken(token);
    
    const response = await pm.sendRequest({
        url: `${pm.variables.get('baseUrl')}/api/files/${path}`,
        method: 'POST',
        header: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: { fileData }
        }
    });
    
    if (response.code !== 200) {
        throw new Error(`Upload file failed: ${response.json().error}`);
    }
    return response.json();
}

module.exports = {
    setupAuth,
    readFile,
    createFile,
    updateFile,
    deleteFile,
    listDirectory,
    createDirectory,
    deleteDirectory,
    uploadFile
}; 
