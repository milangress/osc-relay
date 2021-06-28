/* const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`)
  })
  ws.send('ho!')
})

*/

const options = { /* ... */ };
const io = require("socket.io")(3000, options);
var osc = require('node-osc')



io.on("connect", () => {
  // either with send()
  io.send("Connected a User to Server");

  // or with emit() and custom event names
  io.emit("salutations", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
});



var oscServer, oscClient;


io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer = new osc.Server(obj.server.port, obj.server.host);
    oscClient = new osc.Client(obj.client.host, obj.client.port);

    oscClient.send('/status', socket.id + ' connected');

    oscServer.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('sent OSC message to WS', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    var toSend = obj.split(' ');
    oscClient.send(...toSend);
    console.log('sent WS message to OSC', toSend);
    socket.send(toSend)
  });
  socket.on("disconnect", function () {
    oscServer.kill();
  })
});



