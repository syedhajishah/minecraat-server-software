const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logoutBtn = document.getElementById('logoutBtn');
const consoleOutput = document.getElementById('consoleOutput');
const commandForm = document.getElementById('commandForm');
const commandInput = document.getElementById('commandInput');
const refreshFilesBtn = document.getElementById('refreshFiles');
const navigateUpBtn = document.getElementById('navigateUp');
const currentPathLabel = document.getElementById('currentPath');
const fileList = document.getElementById('fileList');
const editorDialog = document.getElementById('editorDialog');
const editorTitle = document.getElementById('editorTitle');
const editorContent = document.getElementById('editorContent');
const saveFile = document.getElementById('saveFile');
const cancelEdit = document.getElementById('cancelEdit');
const pluginUploadForm = document.getElementById('pluginUploadForm');
const pluginFile = document.getElementById('pluginFile');
const refreshPluginsBtn = document.getElementById('refreshPlugins');
const pluginList = document.getElementById('pluginList');

let currentPath = '.';
let activeFilePath = null;

const socket = io();

socket.on('console', (text) => {
    consoleOutput.textContent += text;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
});

socket.on('status', (payload) => {
    const isRunning = payload.running;
    statusText.textContent = isRunning ? 'Running' : 'Stopped';
    statusText.dataset.state = isRunning ? 'running' : 'stopped';
    startBtn.disabled = isRunning;
    stopBtn.disabled = !isRunning;
});

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText);
    }
    return response.json();
}

function pathJoin(base, segment) {
    if (base === '.' || base === '') return segment;
    return `${base.replace(/\\/g, '/')}/${segment}`;
}

function pathDir(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.length === 0 ? '.' : parts.join('/');
}

async function ensureAuthenticated() {
    const auth = await requestJson('/api/auth/status');
    if (!auth.authenticated) {
        window.location.href = '/login';
    }
}

async function refreshStatus() {
    const status = await requestJson('/api/status');
    const isRunning = status.running;
    statusText.textContent = isRunning ? 'Running' : 'Stopped';
    statusText.dataset.state = isRunning ? 'running' : 'stopped';
    startBtn.disabled = isRunning;
    stopBtn.disabled = !isRunning;
}

async function refreshFiles(path = '.') {
    currentPath = path;
    currentPathLabel.textContent = path;
    const data = await requestJson(`/api/files?path=${encodeURIComponent(path)}`);
    fileList.innerHTML = '';
    data.items.forEach((item) => {
        const entry = document.createElement('div');
        entry.className = 'file-item';
        entry.innerHTML = `<span>${item.isDirectory ? '📁' : '📄'} ${item.name}</span>`;
        entry.addEventListener('click', () => {
            const target = pathJoin(currentPath, item.name);
            if (item.isDirectory) {
                refreshFiles(target);
            } else {
                openFile(target);
            }
        });
        fileList.appendChild(entry);
    });
}

async function openFile(path) {
    const data = await requestJson('/api/files/read', {
        method: 'POST',
        body: JSON.stringify({ path })
    });
    activeFilePath = path;
    editorTitle.textContent = path;
    editorContent.value = data.content;
    editorDialog.showModal();
}

async function saveCurrentFile() {
    if (!activeFilePath) return;
    await requestJson('/api/files/write', {
        method: 'POST',
        body: JSON.stringify({ path: activeFilePath, content: editorContent.value })
    });
    editorDialog.close();
    refreshFiles(currentPath);
}

async function refreshPlugins() {
    const data = await requestJson('/api/plugins');
    pluginList.innerHTML = '';
    if (data.plugins.length === 0) {
        pluginList.textContent = 'No plugins installed yet.';
        return;
    }

    data.plugins.forEach((plugin) => {
        const item = document.createElement('div');
        item.className = 'file-item plugin-item';
        item.innerHTML = `<span>🧩 ${plugin.name}</span><button class="delete-plugin">Remove</button>`;
        const deleteButton = item.querySelector('.delete-plugin');
        deleteButton.addEventListener('click', async () => {
            if (!confirm(`Delete plugin ${plugin.name}?`)) return;
            await requestJson('/api/plugins/delete', {
                method: 'POST',
                body: JSON.stringify({ name: plugin.name })
            });
            refreshPlugins();
        });
        pluginList.appendChild(item);
    });
}

startBtn.addEventListener('click', async () => {
    await requestJson('/api/server/start', { method: 'POST' });
    refreshStatus();
});

stopBtn.addEventListener('click', async () => {
    await requestJson('/api/server/stop', { method: 'POST' });
    refreshStatus();
});

logoutBtn.addEventListener('click', async () => {
    await requestJson('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
});

commandForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const command = commandInput.value.trim();
    if (!command) return;
    await requestJson('/api/server/command', {
        method: 'POST',
        body: JSON.stringify({ command })
    });
    commandInput.value = '';
});

refreshFilesBtn.addEventListener('click', () => refreshFiles(currentPath));
navigateUpBtn.addEventListener('click', () => {
    const parentPath = currentPath === '.' ? '.' : pathDir(currentPath);
    refreshFiles(parentPath);
});

saveFile.addEventListener('click', saveCurrentFile);
cancelEdit.addEventListener('click', () => editorDialog.close());

pluginUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!pluginFile.files.length) return alert('Select a plugin .jar file first');
    const formData = new FormData();
    formData.append('plugin', pluginFile.files[0]);
    const response = await fetch('/api/plugins/upload', {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return alert(errorData.error || 'Upload failed');
    }
    pluginFile.value = '';
    refreshPlugins();
});

refreshPluginsBtn.addEventListener('click', refreshPlugins);

(async () => {
    await ensureAuthenticated();
    refreshStatus();
    refreshFiles();
    refreshPlugins();
})();
