let token = localStorage.getItem('api-token');

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
            <span>${file.name} ${file.isDirectory ? '(Directory)' : `(${formatSize(file.size)})`}</span>
            <div class="action-buttons">
                ${!file.isDirectory ? `
                    <button class="btn btn-sm btn-primary download-btn" data-filename="${file.name}">Download</button>
                    <button class="btn btn-sm btn-danger delete-file-btn" data-filename="${file.name}">Delete</button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Add event listeners for dynamic buttons
    fileList.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => downloadFile(btn.dataset.filename));
    });
    fileList.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFile(btn.dataset.filename));
    });
}

function renderDirectoryList(directories) {
    const dirList = document.getElementById('directory-list');
    dirList.innerHTML = directories.map(dir => `
        <div class="list-group-item">
            <span>${dir.name}</span>
            <button class="btn btn-sm btn-danger delete-dir-btn" data-dirname="${dir.name}">Delete</button>
        </div>
    `).join('');

    // Add event listeners for dynamic buttons
    dirList.querySelectorAll('.delete-dir-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteDirectory(btn.dataset.dirname));
    });
}

async function loadData() {
    if (!token) return;

    try {
        // Load files
        const filesResponse = await fetchWithAuth('/api/files');
        if (filesResponse.status === 401) {
            // Token is invalid
            token = null;
            localStorage.removeItem('api-token');
            updateUIState();
            return;
        }
        
        if (!filesResponse.ok) {
            throw new Error('Failed to load files');
        }
        
        const files = await filesResponse.json();
        renderFileList(files);

        // Load directories
        const dirResponse = await fetchWithAuth('/api/directories');
        if (!dirResponse.ok) {
            throw new Error('Failed to load directories');
        }
        const directories = await dirResponse.json();
        renderDirectoryList(directories);
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

        const response = await fetch(`/api/files/${file.name}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload file');
        
        fileInput.value = '';
        await loadData();
    } catch (error) {
        alert('Error uploading file: ' + error.message);
    }
}

async function downloadFile(fileName) {
    try {
        const response = await fetch(`/api/files/${fileName}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to download file');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error downloading file: ' + error.message);
    }
}

async function deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    try {
        const response = await fetchWithAuth(`/api/files/${fileName}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete file');
        await loadData();
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
        const response = await fetchWithAuth(`/api/directories/${dirName}`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to create directory');
        
        dirInput.value = '';
        await loadData();
    } catch (error) {
        alert('Error creating directory: ' + error.message);
    }
}

async function deleteDirectory(dirName) {
    if (!confirm(`Are you sure you want to delete directory ${dirName}?`)) return;
    
    try {
        const response = await fetchWithAuth(`/api/directories/${dirName}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete directory');
        await loadData();
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
