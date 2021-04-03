const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const msg = e.target.elements.message.value 

    socket.emit('newmessage', msg, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus()
        if(error){
            return console.log(error);
        }
        console.log("Message Delivered");
    });
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Geolocation not supported by your browser.')

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled');
        })
    })
})

socket.on('message', (data) => {
    console.log(data);  
    const html = Mustache.render(messageTemplate, {
        message: data
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('userlocation', (msg) => {
    console.log(msg);
    const html = Mustache.render(locationTemplate, {
        link: msg
    })
    $messages.insertAdjacentHTML('beforeend', html)
})