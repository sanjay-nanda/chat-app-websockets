const socket = io()
const formRef = document.querySelector('#message-form');

formRef.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.message.value 

    socket.emit('newmessage', msg, (error) => {
        if(error){
            return console.log(error);
        }

        console.log("Message Delivered");
    });
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Geolocation not supported by your browser.')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (m) => {
            console.log(m);
        })
    })
})

socket.on('message', (data) => {
    console.log(data);
})

socket.on('newmessageAdded', (msg) => {
    console.log("New Message: " + msg);
})

socket.on('userlocation', (msg) => {
    console.log(msg);
})