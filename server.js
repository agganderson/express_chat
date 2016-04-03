var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.get('/', function(req, res){
	res.render('index');
});

var active_users = {};
var chat_log = '';

var server = app.listen(8000, function(){
	console.log('listening on port 8000');
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	console.log('SOCKET ON');

	socket.on('create_user', function(data){
		if(active_users[data.username] === undefined){
			active_users[data.username] = socket.id;
			socket.emit('send_all', {history:chat_log});
		}
		else{
			socket.emit('failed_name', {error:"That name exists"});
		}
	});

	socket.on('send_message', function(data){
		chat_log += data.message;
		socket.broadcast.emit('send_new_message', {new_message:data.message});
		console.log(data);
	})

	socket.on('disconnect', function(){
		console.log(socket.id + ' has disconnected');
	}); //only the disconnected socket will run this code


});