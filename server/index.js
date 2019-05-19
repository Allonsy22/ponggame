const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Ball = require('./game/Ball');


app.use( bodyParser.json() );
app.use( morgan('tiny') );
app.use( cors() );

const port = process.env.PORT || 2222;
const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

const io = require('socket.io')(server);

let routes = {};

io.sockets.on('connection', function(socket) {
    let nsp = socket.handshake['query']['nsp'];
    let currentPlayer = socket.handshake['query']['currentPlayer'];
    
    if ( (currentPlayer == 'secondPlayer' && !routes[nsp]) 
        || (currentPlayer == 'secondPlayer' && 
        (routes[nsp] && routes[nsp]['secondPlayer']))) {
        socket.emit('cancel', true);
    } else {
        connection(socket, nsp, currentPlayer);
        socket.emit('cancel', false);
    }
    
    socket.on('disconnect', function() {    
        console.log('user disconnected');
    });
});

function connection(socket, nsp, currentPlayer) {

    let wWidth = socket.handshake['query']['wWidth'];
    let wHeight = socket.handshake['query']['wHeight'];

    io.of(nsp).on('connection', function(socket) {
        socket.removeAllListeners();
        if ( currentPlayer == 'firstPlayer' ) {

            routes[nsp] = {'firstPlayer': {wWidth: wWidth, wHeight: wHeight}};
            routes[nsp]['ball'] = getBall(io, nsp); 

        } else if ( currentPlayer == 'secondPlayer' ) {
            routes[nsp]['secondPlayer'] = {wWidth: wWidth, wHeight: wHeight};
            routes[nsp]['ball'].start();
        }
        
        socket.on('set-opponent-data', (data) => {
            socket.broadcast.emit('get-opponent-data', [wWidth, data[0]] );
        });

        socket.on('set-players-data', (data) => {
            if ( routes[nsp] && routes[nsp]['ball'] ) {
                routes[nsp]['ball'].getPlayersData(...data);
            } else {
                return;
            }
        });
        socket.on('disconnect', function() {   
            if ( routes[nsp] ) {
                routes[nsp]['ball'].endGame();
                delete routes[nsp];
            };
            io.of(nsp).emit('end-game');
            console.log('user disconnected');
        });
    });
}

function getBall(io, nsp) {
    let w = routes[nsp]['firstPlayer']['wWidth']
    let h = routes[nsp]['firstPlayer']['wHeight']

    return new Ball(io, nsp, w, h);
}