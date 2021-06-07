// socket.io client
const socket = io(window.location.origin);

// inputs 
const msgInput = document.querySelector('#message');
const roomInput = document.querySelector('#room');

// forms 
const msgForm = document.querySelector('#messageForm');
const roomForm = document.querySelector('#roomForm');

// divs 
const roomNameContainer = document.querySelector("#roomNameContainer");
const messageContainer = document.querySelector('#messageContainer');

// event listeners 
msgForm.addEventListener('submit', (e) => sendMessage(e));
roomForm.addEventListener('submit', (e) => changeRoom(e));


// room name
const roomKey = 'socket.io-room'
const jsonRoom = localStorage.getItem(roomKey);
let room = null;

// get initial room from localStorage
if (jsonRoom) {
  room = JSON.parse(jsonRoom);
  socket.emit('changeRoom', { previousRoom: null, newRoom: room });
} else {
  roomNameContainer.innerHTML = `no rooms joined`;
}

// send message
const sendMessage = e => {
  e.preventDefault();
  const msg = msgInput.value;
    
  if (!msg || !room) return;
    
  // send message request
  socket.emit('sendMessage', {msg, id:socket.id, room});
}

// receive message 
socket.on("receiveMessage", ({msg, id}) => {
  const messageDiv = `<div class="py-1 px-3 my-1 rounded-xl my-1 max-w-max ${
    id === socket.id ? "bg-blue-600 self-end" : "bg-gray-700"
  }">${msg}</div>`;
 
  messageContainer.innerHTML += messageDiv;
  const updatedMessageContainer = document.querySelector('#messageContainer');
  updatedMessageContainer.scrollTop = updatedMessageContainer.scrollHeight;
  msgInput.value = '';
});

// changeRoom
const changeRoom = e => {
  e.preventDefault();
  const newRoom = roomInput.value;
  if (!newRoom) return;

  // changeRoom request
  socket.emit('changeRoom', {previousRoom: room, newRoom});
}

// changeRoom response 
socket.on(
  "changeRoomResponse",
  (roomName) => {
    room = roomName;
    roomNameContainer.innerHTML = `<p>joined room <span class="normal-case"> ${roomName}</span></p>`;
    
    // save room in localStorage
    localStorage.setItem(roomKey, JSON.stringify(room));
    roomInput.value = roomName;
  }
);