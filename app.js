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


app.listen(3000);