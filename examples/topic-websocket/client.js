const io = require('socket.io-client');

const socket = io('http://localhost:4000');

const request = {
  accountId: '0.0.12345',
  topicId: '0.0.12345'
};

socket.emit('encrypted_topic_messages', request);

let messages = [];

socket.on('encrypted_topic_message', (message) => {
  if (message) {
    console.log(message);
  }
});

socket.on('encrypted_topic_error', (error) => {
  socket.disconnect();
});
