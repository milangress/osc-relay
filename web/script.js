var socket = io('127.0.0.1:3000');
socket.on('connect', function() {
    // sends to socket.io server the host/port of oscServer
    // and oscClient
    socket.emit('config',
        {
            server: {
                port: 3333,
                host: '127.0.0.1'
            },
            client: {
                port: 3334,
                host: '127.0.0.1'
            }
        }
    );
});



socket.on('message', function(obj) {
    const status = document.getElementById("log");
    const newPtag = document.createElement('p')
    const newContent = document.createTextNode(obj + '\n\r')
    newPtag.appendChild(newContent);
    status.insertBefore(newPtag, status.firstChild);
    console.log('Message: ', obj[0], obj);
});

