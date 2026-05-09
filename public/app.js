const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const consoleOutput = document.getElementById('consoleOutput');
const commandForm = document.getElementById('commandForm');
const commandInput = document.getElementById('commandInput');
const refreshFilesBtn = document.getElementById('refreshFiles');
const fileList = document.getElementById('fileList');

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
    return response.json();
}

async function refreshStatus() {
    const status = await requestJson('/api/status');
    const isRunning = status.running;
    statusText.textContent = isRunning ? 'Running' : 'Stopped';
    statusText.dataset.state = isRunning ? 'running' : 'stopped';
    startBtn.disabled = isRunning;
    stopBtn.disabled = !isRunning;
}

async function refreshFiles() {
    const data = await requestJson('/api/files?path=.');
    fileList.innerHTML = '';
    data.items.forEach((item) => {
        const entry = document.createElement('div');
        entry.className = 'file-item';
        entry.textContent = `${item.isDirectory ? '📁' : '📄'} ${item.name}`;
        fileList.appendChild(entry);
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

refreshFilesBtn.addEventListener('click', refreshFiles);

refreshStatus();
refreshFiles();
