var express = require('express'),
    morgan = require('morgan'), // Logs each server request to the console
    bodyParser = require('body-parser'), // Takes information from POST requests and puts it into an object
    methodOverride = require('method-override'), // Allows for PUT and DELETE methods to be used in browsers where they are not supported
    fs = require('fs'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    router = express.Router(),
    DirManager = require(__dirname + "/controllers/DirManager"),
    Installer = require(__dirname + "/controllers/NpmInstaller");


var env = process.env.NODE_ENV || 'development';
//console.log(process.env);
console.log("ENV TYPE: "+env);
var config = require( __dirname + '/configs/config')[env];

var DOMAIN = config.url;
var HOME = DOMAIN + '/npminstaller';

var server = require('http').Server(app);
var io = require('socket.io')(server);
var JobsController = require(__dirname + '/controllers/JobsController');

/**
 * Configure database
 */
 // Connects to your MongoDB.  Make sure mongod is running!
mongoose.connect(process.env.PORT || 'mongodb://'+config.database.host+":"+
                                                  config.database.port+"/"+
                                                  config.database.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

mongoose.connection.on('connected', function() {
  console.log('MongoDB CONNECTED');
  new JobsController().init();
});

app.use(express.static(__dirname + '/views')); // set the static files location for the static html
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan(config.server.log)); // Log requests to the console
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride()); // simulate DELETE and PUT

var clients = {};

fs.readFile('/var/www/npminstaller/port.json', 'utf8', function(err, data) {
    if (err) throw err;
    var obj = JSON.parse(data);
    var port = obj.port;

    var dirManager = new DirManager();
    dirManager.init();
    
    server.listen(port, function() {
        console.log("... port %d in %s mode", port, app.settings.env);


        //var installer = new Installer();

        var MyRouter = require(__dirname + "/controllers/router");

        router = new MyRouter(app, DOMAIN, HOME, null, null);

        // Create a Socket.IO instance, passing it our server
        var socket = io.listen(server);
        require(__dirname + "/controllers/sockets")(socket,DOMAIN+":"+port);

    });

});
