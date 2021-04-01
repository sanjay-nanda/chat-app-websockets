const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const path = require("path")
const Filter = require("bad-words")

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
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('newmessage', (msg, callback) => {

        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.emit('newmessageAdded', msg);
    })

    socket.on('disconnect', () => {
        io.emit('message', 'User has left')
    })

    socket.on('sendLocation', (obj, callback) => {
        console.log("Location: lattitude: " + obj.latitude + " Longitude: " + obj.longitude);
        socket.broadcast.emit("userlocation","https://google.com/maps?@" + obj.latitude + "," + obj.longitude)
        callback('Location Shared')
    })
})

server.listen(port, () => console.log("Server running at port: " + port));