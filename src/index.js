const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const path = require("path")
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require('./utils/messages')

//for setting up socket.io
const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

//to serve up files from the public directory
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath))

// listens for all the events emitted by the clients after they are connected
io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    

    socket.on('join', ({username, roomname}) => {
        //joins the room
        socket.join(roomname)

        socket.emit('message', generateMessage("Welcome!"))
        socket.broadcast.to(roomname).emit('message', generateMessage(`${username} has joined!`))
        //io.to.emit - emits to all users in a particular room
        //socket.broadcast.to.emit - emits to all users in a room except the one who fires it

    })

    socket.on('newmessage', (msg, callback) => {

        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMessage(msg));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User has left'))
    })

    socket.on('sendLocation', (obj, callback) => {
        console.log("Location: lattitude: " + obj.latitude + " Longitude: " + obj.longitude);
        socket.emit("userlocation",generateLocationMessage(`https://google.com/maps?@${obj.latitude},${obj.longitude}`));
        callback()
    })
})

server.listen(port, () => console.log("Server running at port: " + port));