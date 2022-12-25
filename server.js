const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utlis/messages') 
const {getCurrentUser , userJoin,userleave , getuserroom} = require('./utlis/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Jarvis'

app.use(express.static(path.join(__dirname , 'public')));

io.on('connection' , socket => {

     socket.on('joinRoom' , ({username , room}) => {

     const user = userJoin(socket.id,username, room);

     socket.join(user.room)

     socket.emit('message' , formatMessage(botName,'welcome to the chat'))

     socket.broadcast.to(user.room).emit('message' , formatMessage(botName,` ${user.username} join the chat`))

     io.to(user.room).emit('roomUsers' , {
       
          room : user.room,
          users: getuserroom(user.room)
     })

     })
      
     console.log('new connection')

     socket.on('disconnect' , () => {
     
          const user = userleave(socket.id)

          if(user){

           io.to(user.room).emit('message' , formatMessage(botName,`${user.username} left The Chat`))

           io.to(user.room).emit('roomUsers' , {
       
               room : user.room,
               users: getuserroom(user.room)
          })

          }
     });

     socket.on('chatMessage' ,  msg => {

          const user = getCurrentUser(socket.id)

          io.to(user.room).emit('message' , formatMessage(user.username,msg));
     });
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT , () => console.log(`server running on ${PORT}`));