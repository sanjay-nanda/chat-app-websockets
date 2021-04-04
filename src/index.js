const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const path = require("path")
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')

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

    

    socket.on('join', ({username, roomname}, callback) => {
        //joins the room
        const { error, user} = addUser({ id: socket.id, username, room: roomname})
        if(error)
            return callback(error)
        socket.join(user.room)
        socket.emit('message', generateMessage({ username:'Server', msg: "Welcome!"}))
        socket.broadcast.to(user.room).emit('message', generateMessage( {username: 'Server', msg:`${user.username} has joined!`}))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        //io.to.emit - emits to all users in a particular room
        //socket.broadcast.to.emit - emits to all users in a room except the one who fires it

    })

    socket.on('newmessage', (msg, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage({username: user.username, msg}));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage({ username: 'Server', msg:`${user.username} has left`}))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (obj, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("userlocation",generateLocationMessage({
            username: user.username,
            url :`https://google.com/maps?@${obj.latitude},${obj.longitude}`
        }
        ));
        callback()
    })
})

server.listen(port, () => console.log("Server running at port: " + port));