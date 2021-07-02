import { Server as WSServer } from "socket.io";
import { Client, Server } from "node-osc"
import detectIsOnGlitch  from 'detect-is-on-glitch'

detectIsOnGlitch().then((isOnGlitch) => {
  console.log('OSC-Relay 0.0.1')
  console.log('--------------------')
  if (isOnGlitch) {
    console.log('-- Detected -- GLITCH -- Environment!');
    runGlitchServer()
  } else {
    console.log('-- Detected -- LOCAL -- Environment!');
    runLocalServer()
  }
});


const OSCServerData = {
  server: {
    port: 3333,
    host: "127.0.0.1"
  },
  client: {
    port: 3334,
    host: "127.0.0.1"
  }
}

// ['127.0.0.1:3030', 'http://www.re-set.space', /\.glitch\.me$/]
const WSServerOptions = {
  'cors': {
    'methods': ['GET', 'PATCH', 'POST', 'PUT'],
    'origin': ['127.0.0.1:3030', 'http://www.re-set.space', /\.glitch\.me$/],
    'allowedHeaders': ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    'credentials': true
  }
}


function runGlitchServer() {
  const io = new WSServer(3030, WSServerOptions);
  io.on("connect", () => {
    io.send("Connected a User to Server");
  });
  io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('message', function (obj) {
      const toSend = obj.split(' ');
      console.log('got message', toSend);
      socket.send(toSend)
    });
  })
}



function runLocalServer() {
  console.log('Starting local Server')
  console.log('--------------------')

  const io = new WSServer(3030, WSServerOptions);




  io.on("connect", () => {
    // either with send()
    io.send("Connected a User to Server");

    // or with emit() and custom event names
    io.emit("salutations", "Hello!", {"mr": "john"}, Uint8Array.from([1, 2, 3, 4]));
  });


  console.log('Starting OSC Server…')
  console.log('--------------------')
  const oscServer = new Server(OSCServerData.server.port, OSCServerData.server.host, () => {
    console.log('OSC Server is listening')
    console.log('--------------------')
    console.log('Server configuration:', OSCServerData)
  });

  const oscClient = new Client(OSCServerData.client.host, OSCServerData.client.port)


  io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('config', function (obj) {

      // console.log('config', obj);

      oscClient.send('/status', socket.id + ' connected');

      oscServer.on('message', function (msg, rinfo) {
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
      // oscServer.kill();
      console.log('client disconnected');
    })
  });


}
