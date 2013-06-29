var assert = require('assert')
    , express = require('express')
    , routes = require('./routes');

var app = express();

// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));    
    app.use(app.router);  
});

app.get('/', routes.index);


var server = app.listen(3000);
var io = require('socket.io').listen(server);
var clients = {}
var latestPair = [];

io.sockets.on('connection', function (socket) {

  clients[socket.id] = socket;
  latestPair.push(socket.id);
  if (latestPair.length == 2) {
    var socket1 = clients[latestPair[0]];
    var socket2 = clients[latestPair[1]];
    socket1.emit('begin');
    socket2.emit('begin');
    console.log(latestPair.length , socket.id);
    latestPair = [];
  }


  socket.on('keydown', function (data) {
    socket.broadcast.emit('keydownfromserver', data);
  });
  socket.on('keyup', function (data) {
    socket.broadcast.emit('keyupfromserver', data);
  });  
});