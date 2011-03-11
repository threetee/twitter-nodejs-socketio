var sys    = require('sys'),
    http   = require('http'),
    io     = require('socket.io'),
    static = require('node-static');

// Command line args
var USERNAME = process.ARGV[2] || process.env.TWITTER_USERNAME;
var PASSWORD = process.ARGV[3] || process.env.TWITTER_PASSWORD;
var KEYWORD  = process.ARGV[4] || "disney";

if (!USERNAME || !PASSWORD)
  return sys.puts("Usage: node server.js <twitter_username> <twitter_password> <keyword>");

// Set up Twitter
var twitter = new (require("twitter-node").TwitterNode)({
  user: USERNAME, 
  password: PASSWORD, 
  track: [ KEYWORD ]
});
 
// Set up static file serving
var file = new(static.Server)('./public');

// Set up a simple server
server = http.createServer(function(req, res){
  req.addListener('end', function() {
    sys.debug("got HTTP request: " + req);
    file.serve(req, res);
  })
});
server.listen(8080);

// Set up socket.io
var socket = io.listen(server);

socket.on('connection', function(client) { 
  // new client is here!
  client.on('message', function(resource) {
    sys.debug("connect: " + resource);  
  });
  client.on('disconnect', function() {
    sys.debug("close");
  });
}); 

// Set up the tweet stream
twitter.addListener('tweet', function (tweet) {
  sys.debug("got a tweet: " + tweet);
  socket.broadcast(tweet);
});
twitter.stream();