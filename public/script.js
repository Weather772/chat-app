const socket = io();
const messagesDiv = document.getElementById('messages');
const chatDiv = document.getElementById('chat');
const authDiv = document.getElementById('auth');
let currentUsername = '';

// Register User
document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
};

// Login User
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        alert(data.message);
        currentUsername = data.username;
        authDiv.style.display = 'none';
        chatDiv.style.display = 'block';
    } else {
        alert('Invalid credentials');
    }
};

// Send Chat Message
document.getElementById('messageForm').onsubmit = (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const message = `${currentUsername}: ${messageInput.value}`;
    socket.emit('chat message', message);
    messageInput.value = '';
};

// Receive Chat Message
socket.on('chat message', (msg) => {
    const msgElement = document.createElement('div');
    msgElement.classList.add('chat-message');
    msgElement.textContent = msg;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
