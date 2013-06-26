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

io.sockets.on('connection', function (socket) {
  socket.on('keydown', function (data) {
    socket.broadcast.emit('keydownfromserver', data);
  });
  socket.on('keyup', function (data) {
    socket.broadcast.emit('keyupfromserver', data);
  });  
});