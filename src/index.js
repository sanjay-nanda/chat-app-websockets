const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const path = require("path")

//for setting up socket.io
const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

//to serve up files from the public directory
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath))

//prints when a client is connected to the server
io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', "Welcome!")

    socket.on('newmessage', (msg) => {
        io.emit('newmessageAdded', msg);
    })
})

server.listen(port, () => console.log("Server running at port: " + port));