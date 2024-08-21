const express = require('express');
const http = require('http');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 4000; // Use PORT 4000 as specified in your error

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper to read users from the JSON file
const readUsers = () => {
    try {
        const data = fs.readFileSync('users.json', 'utf8'); // Read file with UTF-8 encoding
        return data ? JSON.parse(data) : []; // Return an empty array if data is falsy
    } catch (error) {
        console.error('Error reading users.json:', error);
        return []; // Return an empty array on error
    }
};

// Helper to write users to the JSON file
const writeUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2)); // Pretty print JSON
};

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        return res.status(400).send({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    writeUsers(users);
    res.send({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        res.send({ message: 'Login successful', username: user.username });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

// Socket.IO connection for real-time chat
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Broadcast the message to all clients
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
