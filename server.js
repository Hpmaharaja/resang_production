// ==================================================================
// MAIN BACKEND SERVER
// ==================================================================

// REQUIRING NECESSARY MODULES
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors = require('cors');
var multer = require('multer');
var fs = require('fs'),
    path = require('path'),
    url = require('url');
var imageDir = 'uploads/';

// CHAT APP STUFF
var chat_app = require('express')();
var http = require('http').createServer(chat_app);
var io = require( 'socket.io' )( http );
http.listen(9001);

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./models/user'); // get our mongoose model
var Messages = require('./models/messages');
var Images = require('./models/images');
var Clusters = require('./models/clusters');

// =================================
// CONFIGURATION
// =================================
mongoose.Promise = global.Promise;
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// CORS ISSUE RESOLVED
app.use(cors());

app.set('port', (process.env.PORT || 5600));
app.use(express.static(__dirname + '/chatapp/dist/'));

// ======================================================================
// ROUTES
// ======================================================================

// HOMEPAGE ROUTING

app.get('/', function(request, response) {
  response.status(200);
  response.send('<h1>Welcome to resNG!</h1>');
});

// CHATAPP SOCKETS -----------------------------------------------------
io.on('connection', function (socket) {
  var username = socket.handshake.query.username;
  console.log(username + ' connected');

  socket.on('client:message', function (data) {
    console.log(data.username + ': ' + data.message);
    var new_message = new Messages({
      userName: data.username,
      message: data.message
    });
    new_message.save(function(err) {
      if (err) throw err;
      console.log('Message saved in Database!');
    });

    // message received from client, now broadcast it to everyone else
    socket.broadcast.emit('server:message', data);
  });

  socket.on('client:image', function (data) {
    console.log(data.username + ': ' + data.imageURL);
    Images.findOne({ 'pathTofile' : data.imageURL }, function(err, images) {
      if (err) {console.log(err);}
      if (!images) {
        console.log('IMAGE NOT IN DATABASE!');
        var new_image = new Images({
          userName: data.username,
          pathTofile: data.imageURL,
          processed: false,
          localPath: data.localPath
        });
        new_image.save(function(err) {
          if (err) throw err;
          console.log('Image saved in Database!');
        });
      }
    });

    // message received from client, now broadcast it to everyone else
    socket.broadcast.emit('server:message', data);
  });

  socket.on('disconnect', function () {
    console.log(username + ' disconnected');
  });
});

// MESSAGES ------------------------------------------------------------

app.post('/messages', function(req,res) {
  var nick = new Messages({
    userName: req.body.userName,
    message: req.body.message
  });
  nick.save(function(err) {
    if (err) throw err;
    res.status(200);
    res.json({
      success: true,
      message: 'Message saved successfully!',
    });
    console.log('Message saved successfully!');
  });
});

app.get('/messages', function(req,res) {
  Messages.find({}, function(err, messages) {
    req.socket.setTimeout(10 * 60 * 1000);
    res.status(200);
    res.json(messages);
  });
});

// IMAGES ------------------------------------------------------------

// IMAGE STORAGE FUNCTIONS ====
var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '/root/Developer/resang_production/uploads/');
        },
        filename: function (req, file, cb) {
            // var datetimestamp = Date.now();
            // console.log(file);
            // console.log('Uploading... REQUEST.BODY');
            // console.log(req.body);
            // console.log(file);
            //cb(null, datetimestamp + '_' + file.originalname + '_' + req.body.userName + '.jpg');
            cb(null, req.body.fileName);
            //cb(null, String(req.body.fileName));
        },
        onFileUploadStart: function (file) {
          console.log('Uploading file..........');
        },
        onFileUploadComplete: function (file, req, res) {
            console.log("filename upload complete!");
        }
});

var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

//get the list of jpg files in the image dir
function getImages(imageDir, callback) {
    var fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
            files.push(list[i]);
        }
     
        callback(err, files);
    });
}
// ============================

// IMAGE ENDPOINTS =============================================================

// GET POST IMAGE PAGE
app.get('/postimage', function (req, res) {
  res.writeHeader(200, { 'Content-Type': 'text/html' });
  res.write('<form action="/images" enctype="multipart/form-data" method="POST">');
  res.write('<input type="file" name="file" />');
  res.write('<input type="text" name="userName" value="heran" />');
  res.write('<input type="submit" />');
  res.end('</form>');
});

// UPLOADING ENDPOINT
app.post('/images', function(req,res) {
  var datetimestamp = Date.now();
  upload(req,res, function(err){
      if(err){
          console.log(err);
           res.status(400);
           res.json({error_code:1,err_desc:err});
           return;
      }
      var userName = req.body.userName ? req.body.userName : '';
      var fullpath = 'http://localhost:5000/images/?image=' + req.body.fileName;
      res.status(200);
      res.json({error_code:0,err_desc:null, timestamp: res.timestamp});
      //res.redirect('/postimage');
      console.log('Image uploaded successfully!');
  });
});

// VIEW IMAGES ENDPOINT
app.get('/images', function(req,res) {
//use the url to parse the requested url and get the image name
    var query = url.parse(req.url,true).query;
    var pic = query.image;

    if (typeof pic === 'undefined') {
        getImages(imageDir, function (err, files) {
            var imageLists = '<ul>';
            for (var i=0; i<files.length; i++) {
                imageLists += '<li><a href="images/?image=' + files[i] + '">' + files[i] + '</li>';
            }
            imageLists += '</ul>';
            res.writeHead(200, {'Content-type':'text/html'});
            res.end(imageLists);
        });
    } else {
        //read the image using fs and send the image content back in the response
        fs.readFile(imageDir + pic, function (err, content) {
            if (err) {
                res.writeHead(400, {'Content-type':'text/html'})
                // console.log(err);
                res.end("No such image");
            } else {
                //specify the content type in the response will be an image
                res.writeHead(200,{'Content-type':'image/jpg'});
                res.end(content);
            }
        });
    }
});

// TEMPORARY ADDING IMAGES TO DB
app.get('/images_push', function(req,res) {
  var nick = new Images({
    userName: 'hp',
    pathTofile: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS1eM3EKHnOl4W5L5qfWhyx6-wbIg0ZqxV57TME33P6aBdbyVpK'
  });
  nick.save(function(err) {
    if (err) throw err;
    res.status(200);
    res.json({error_code:0,err_desc:null});
    //res.redirect('/postimage');
    console.log('Image saved successfully!');
  });
});

// IMAGES DATABASE
app.get('/images_db', function(req,res) {
  Images.find({}, function(err, images) {
    req.socket.setTimeout(10 * 60 * 1000);
    res.status(200);
    res.json(images);
  });
});

// app.get('/clusters_db', function(req, res) {
//   var new_cluster = new Clusters({
//     cluster_id: 1,
//     keywords: ['Yosemite', 'Park'],
//     images: ["https://content-oars.netdna-ssl.com/wp-content/uploads/2015/12/Yosemite.Fran_.jpg",
//     "http://www.yosemite.com/wp-content/uploads/2016/03/Yosemite-Falls-in-Spring-Mariposa-County.jpg",
//     "http://travels.kilroy.net/media/8955815/yosemite-national-park-river_517x291.jpg"]
//   });
//   new_cluster.save(function(err) {
//     if (err) throw err;
//     console.log('Message saved in Database!');
//   });
//   res.send("Cluster Saved!");
// });

app.get('/clusters_db', function(req,res) {
  Clusters.find({}, function(err, cluster) {
    req.socket.setTimeout(10 * 60 * 1000);
    res.status(200);
    res.json(cluster);
  });
});

// BACKUP IMAGE POSTING
app.get('/imageup', function(req,res) {
  res.sendFile(__dirname + '/client/index.html');
});

// APIDOCS ------------------------------------------------------------

app.get('/apidocs', function(req,res) {
  res.status(200);
  res.sendFile(__dirname + '/resangapidocs.html');
});

// USERS ------------------------------------------------------------

app.get('/users', function(req,res) {
  User.find({}, function(err, user) {
    res.status(200);
    res.json({data: user});
  });
});

// TOKEN-BASED AUTHENTICATION ------------------------------------------------------------

app.post('/auth/register', function(req, res) {
  User.findOne({
    userName: req.body.userName
  }, function(err, user) {
      if (err) throw err;
      if (user) {
        res.status(404);
        res.json({ success: false,
                   message: 'User already exists!',
                   data: {token: "No token authorized!", content: "helloworld"}});
      } else if (!user) {
          var nick = new User({
            userName: req.body.userName,
            passWord: req.body.passWord
          });
          nick.save(function(err) {
            if (err) throw err;

            var token = jwt.sign(nick, app.get('superSecret'), {
              expiresIn: '24h',
              algorithm: 'HS256'
            });
            res.status(200);
            res.json({
              success: true,
              message: 'Enjoy your token!',
              data: {token: token, content: "helloworld"}
            });
            console.log('User saved successfully');
          });
        }
  });
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/auth/login', function(req, res) {
  User.findOne({
    userName: req.body.userName
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(404);
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      if (user.passWord != req.body.passWord) {
        res.status(403);
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: "24h" // expires in 24 hours
        });
        res.status(200);
        res.json({
          success: true,
          message: 'Enjoy your token!',
          data: {token: token, content: "helloworld"}
        });
      }
    }
  });
});

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['Authorization'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.status(200);
  res.json({ message: 'Welcome to the RESANG API!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.status(200);
    res.json(users);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
