const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cookieParser = require('cookie-parser');
const path = require('path');
const io = require('socket.io')(server);

// body parser, cookie parser and urlencoding
app.use(express.json({limit: "10kb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// socket.io server
io.on('connect', (socket) => {

  // changeRoom request
  socket.on('changeRoom', ({ previousRoom, newRoom }) => {
    // leave previously joined room
    if (previousRoom) socket.leave(previousRoom);
    
    // join new room
    socket.join(newRoom);
    
    // send response
    socket.emit("changeRoomResponse", newRoom);
  })

  // sendMessage request
  socket.on('sendMessage', ({ msg, id, room }) => {
    io.to(room).emit('receiveMessage', { msg, id })
  });

  socket.on('error', (err) => console.log(err));

});

// headers info before switching headers and sending response
// wss.on("headers", (headers, req) => console.log(headers));


// static file serving
app.use('/', express.static(path.join(__dirname, 'client')));

// port
const port = process.env.PORT || 3000;

// start server 
const runningServer = server.listen(port, () => console.log(`server running on port ${port}`));


// close server on unhandled rejection
process.on('unhandledRejection', (err) => { 
  console.log(err);
  console.log('unhandled rejection, φ(゜▽゜*)♪, shutting down server...');
  runningServer.close(() => process.exit(1))
})

// handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log("uncaught exception, φ(゜▽゜*)♪, shutting down server...");
  runningServer.close(() => process.exit(1)); 
});


// handling SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. 👏 Shutting down gracefully.');
  runningServer.close(() => console.log('💥Process terminated'));
  // sigterm already stops the program..so no need to call process.exit.
})