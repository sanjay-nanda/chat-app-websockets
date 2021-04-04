const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages")
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, roomname} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    const $messagesWrap = document.querySelector("#messages");
  const $messages = document.querySelector("#messages div");
  // New message element
  const $newMessage = $messages.lastElementChild;
  if ($newMessage !== null) {
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messagesWrap.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messagesWrap.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
      // scroll to bottom
      $messagesWrap.scrollTop = $messagesWrap.scrollHeight;
    }
  }
}

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
        userName: data.username,
        text: data.text,
        createdAt: moment(data.createdAt).format('H:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('userlocation', (msg) => {
    console.log(msg);
    const html = Mustache.render(locationTemplate, {
        userName: msg.username,
        link: msg.url,
        createdAt: moment(msg.createdAt).format('H:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.emit('join', { username, roomname}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
});

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})