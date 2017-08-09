"use strict";

process.title = 'node-chat';

var webSocketServerPort = 1337;

var webSocketServer = require('websocket').server;
const http = require('http');
const hearts = require('../game/hearts.js');

var history = [];
const clients = [];

function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function log(str) {
    console.log((new Date()) + str);
}

var server = http.createServer(function(request, response) {
});

server.listen(webSocketServerPort, ()=> {
    log(" Server is listening on port " + webSocketServerPort);
});

var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', request => {
    log(' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) -1;
    var userName = false;
    log(' Connection accepted.');

    var game = new hearts.HeartsGame();
    game.initNew(["aaa", "bbb", "ccc", "ddd"]);
    
    connection.sendUTF(
        JSON.stringify({ type : 'loadall', data: game })
    );

    connection.on('message', message => {
        if (message.type == 'utf8') {
            if(userName == false) {
                userName = htmlEntities(message.utf8Data);
                connection.sendUTF(
                    JSON.stringify({type: 'color', data:userColor})
                );
                
                log(' User is known as: ' + userName);
            } else {
                log(' Received message from ' + userName + ': ' + message.utf8Data);

                var obj =  {
                    time : (new Date()).getTime(),
                    text : htmlEntities(message.utf8Data),
                    author: userName
                };

                history.push(obj);
                history = history.slice(-100);

                var json = JSON.stringify({ type: 'message', data: obj});
                for(var i = 0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
                
            }
        }
    });

    connection.on('close', connection => {
        if(userName != null) {
            log(' Peer ' + connection.remoteAddress + ' disconnected.');
            clients.splice(index, 1);
        }
    });
    
});
