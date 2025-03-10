let token = localStorage.getItem('api-token');
let currentDirectory = ''; // Track current directory path

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('set-token-btn').addEventListener('click', setToken);
    document.getElementById('upload-btn').addEventListener('click', uploadFile);
    document.getElementById('create-dir-btn').addEventListener('click', createDirectory);

    // Update UI based on authentication state
    updateUIState();
});

async function updateUIState() {
    const authSection = document.getElementById('auth-section');
    const fileSection = document.getElementById('file-section');
    const directorySection = document.getElementById('directory-section');
    const tokenInput = document.getElementById('token-input');

    if (token && await validateToken()) {
        authSection.style.display = 'none';
        fileSection.style.display = 'block';
        directorySection.style.display = 'block';
        loadData();
    } else {
        token = null;
        localStorage.removeItem('api-token');
        authSection.style.display = 'block';
        fileSection.style.display = 'none';
        directorySection.style.display = 'none';
        tokenInput.focus();
    }
}

async function setToken() {
    const tokenInput = document.getElementById('token-input');
    const newToken = tokenInput.value.trim();
    
    if (!newToken) {
        alert('Please enter a token');
        return;
    }

    try {
        const response = await fetch('/api/auth/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: newToken })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to set token');
        }

        token = newToken;
        localStorage.setItem('api-token', token);
        tokenInput.value = '';
        updateUIState();
    } catch (error) {
        alert('Error setting token: ' + error.message);
    }
}

async function fetchWithAuth(url, options = {}) {
    if (!token) {
        throw new Error('No token set');
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

function renderFileList(files) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = files.map(file => `
        <div class="list-group-item">
            <span>${file.name} (${formatSize(file.size)})</span>
            <div class="action-buttons">
                <button class="btn btn-sm btn-primary download-btn" data-filepath="${file.path}">Download</button>
                <button class="btn btn-sm btn-danger delete-file-btn" data-filepath="${file.path}">Delete</button>
            </div>
        </div>
    `).join('');

    // Add event listeners for dynamic buttons
    fileList.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => downloadFile(btn.dataset.filepath));
    });
    fileList.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFile(btn.dataset.filepath));
    });
}

function renderDirectoryList(directories) {
    const dirList = document.getElementById('directory-list');
    dirList.innerHTML = directories.map(dir => `
        <div class="list-group-item">
            <span>${dir.name}</span>
            <div class="action-buttons">
                <button class="btn btn-sm btn-primary open-dir-btn" data-dirpath="${dir.path}">Open</button>
                <button class="btn btn-sm btn-danger delete-dir-btn" data-dirpath="${dir.path}">Delete</button>
            </div>
        </div>
    `).join('');

    // Add event listeners for dynamic buttons
    dirList.querySelectorAll('.delete-dir-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteDirectory(btn.dataset.dirpath));
    });
    dirList.querySelectorAll('.open-dir-btn').forEach(btn => {
        btn.addEventListener('click', () => loadDirectory(btn.dataset.dirpath));
    });
}

async function loadData() {
    if (!token) return;

    try {
        // Load root directory contents
        await loadDirectory('');
    } catch (error) {
        if (error.message.includes('No token set')) {
            updateUIState();
        } else {
            alert('Error loading data: ' + error.message);
        }
    }
}

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        // Use current directory when uploading
        const uploadPath = currentDirectory ? `${currentDirectory}/${file.name}` : file.name;
        const response = await fetch(`/api/files/${uploadPath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload file');
        
        fileInput.value = '';
        await loadDirectory(currentDirectory); // Reload current directory
    } catch (error) {
        alert('Error uploading file: ' + error.message);
    }
}

async function downloadFile(filePath) {
    try {
        const response = await fetch(`/api/files/${filePath}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to download file');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error downloading file: ' + error.message);
    }
}

async function deleteFile(filePath) {
    if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;
    
    try {
        const response = await fetchWithAuth(`/api/files/${filePath}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete file');
        await loadDirectory(currentDirectory);
    } catch (error) {
        alert('Error deleting file: ' + error.message);
    }
}

async function createDirectory() {
    const dirInput = document.getElementById('directory-name');
    const dirName = dirInput.value.trim();
    
    if (!dirName) {
        alert('Please enter a directory name');
        return;
    }

    try {
        // Use current directory when creating new directory
        const dirPath = currentDirectory ? `${currentDirectory}/${dirName}` : dirName;
        const response = await fetchWithAuth(`/api/directories/${dirPath}`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to create directory');
        
        dirInput.value = '';
        await loadDirectory(currentDirectory); // Reload current directory
    } catch (error) {
        alert('Error creating directory: ' + error.message);
    }
}

async function deleteDirectory(dirPath) {
    if (!confirm(`Are you sure you want to delete directory ${dirPath}?`)) return;
    
    try {
        const response = await fetchWithAuth(`/api/directories/${dirPath}`, { method: 'DELETE' });
        if (!response.ok) {
            const data = await response.json();
            if (data.error === 'Directory is not empty') {
                alert('Cannot delete directory because it contains files or subdirectories. Please delete the contents first.');
            } else {
                throw new Error('Failed to delete directory');
            }
            return;
        }
        await loadDirectory(currentDirectory);
    } catch (error) {
        alert('Error deleting directory: ' + error.message);
    }
}

async function validateToken() {
    if (!token) return false;
    
    try {
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            // Token is invalid or expired
            token = null;
            localStorage.removeItem('api-token');
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Update loadDirectory function to handle navigation
async function loadDirectory(dirPath) {
    try {
        // Update current directory
        currentDirectory = dirPath || '';
        
        const response = await fetchWithAuth(`/api/directories/${currentDirectory}`);
        if (!response.ok) throw new Error('Failed to load directory');
        
        const items = await response.json();
        
        // Split items into files and directories
        const files = items.filter(item => !item.isDirectory);
        const directories = items.filter(item => item.isDirectory);
        
        renderFileList(files);
        renderDirectoryList(directories);
        
        // Update current directory display and navigation
        updateDirectoryNavigation();
    } catch (error) {
        alert('Error loading directory: ' + error.message);
    }
}

// Add new function for directory navigation
function updateDirectoryNavigation() {
    const pathDisplay = document.getElementById('current-path');
    const navigationHtml = [];
    
    // Add root directory link
    navigationHtml.push(`<a href="#" class="dir-nav" data-path="">root</a>`);
    
    if (currentDirectory) {
        // Split path and create navigation links
        const parts = currentDirectory.split('/');
        let accumPath = '';
        
        parts.forEach((part, index) => {
            accumPath = accumPath ? `${accumPath}/${part}` : part;
            navigationHtml.push(` / <a href="#" class="dir-nav" data-path="${accumPath}">${part}</a>`);
        });
    }
    
    pathDisplay.innerHTML = navigationHtml.join('');
    
    // Add click handlers for navigation links
    document.querySelectorAll('.dir-nav').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadDirectory(e.target.dataset.path);
        });
    });
}
