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

// =================================
// CONFIGURATION
// =================================
mongoose.connect(''); // connect to database
var Cluster = require('./models/clusters');

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// CORS ISSUE RESOLVED
app.use(cors());

app.set('port', (process.env.PORT || 4000));

// ======================================================================
// ROUTES
// ======================================================================

// HOMEPAGE ROUTING

app.get('/', function(request, response) {
  response.status(200);
  response.send('<h1>Welcome to resNG!</h1>');
});

app.get('/cluster_db', function(req,res) {
  Cluster.find({}, function(err, cluster) {
    req.socket.setTimeout(10 * 60 * 1000);
    res.status(200);
    res.json(cluster);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
