const socket = io()
const formRef = document.querySelector('#message-form');

formRef.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.message.value 

    socket.emit('newmessage', msg);
})

socket.on('message', (data) => {
    console.log(data);
})

socket.on('newmessageAdded', (msg) => {
    console.log("New Message: " + msg);
})