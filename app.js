var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var bodyParser = require('body-parser');

var authRouter = require('./routes/auth');
var employeeRouter = require('./routes/employee');
var boardRouter = require('./routes/board');
var departmentRouter = require('./routes/department');
var pushalarmRouter = require('./routes/pushalarm');
var accountRouter = require('./routes/account');

var config = require('./config/configure');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(bodyParser.urlencoded({extended: false}));	
app.use(session({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true
}))

app.use('/', authRouter);
app.use('/employee', employeeRouter);
app.use('/board', boardRouter);
app.use('/department', departmentRouter);
app.use('/pushalarm', pushalarmRouter);
app.use('/account', accountRouter);

// 프로필 사진 저장 경로
app.use('/and_employees_profile', express.static('and_employees_profile'));
// 게시글 사진 저장 경로
app.use('/and_boards_image', express.static('and_boards_image'));

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

module.exports = app;
