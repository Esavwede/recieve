var logger = require('./health/logging/index') // Winston Logger 
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var startDatabase = require('./config/database/start_db')
var morgan = require('morgan')
var session = require('express-session') 


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

startDatabase()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: false, cookie: { maxAge: 60000 }}))
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


// API ENDPOINTS 
require('./routes/users')(app) // User 
require('./routes/lead')(app) // Leads 
require('./routes/contactUs')(app) // Contact Us 
require('./routes/business')(app) // business 
require('./routes/paymentLink')(app) // Payment Link 
require('./routes/payment')(app) // Payment 
require('./routes/transaction')(app) // transaction 
require('./routes/transfer')(app)  // Transfer 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

logger.info(' Logger Initialized ')

module.exports = app;
