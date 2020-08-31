var express = require('express');
var router = express.Router();

const mysql = require('mysql');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');

const config = require('../config/configure');

const connection = config.db;
config.dbConnect(connection);

/*
  로그인 페이지
*/
router.get('/', function(req, res, next) {
  	console.log('로그인 페이지');
  	if (req.session.adminsession == config.sessionSecret) {
	   	res.redirect('/employee');
	}
	else {
		res.render('../views/auth/auth_index.ejs', {
		    'message' : ''
		})
	}
});

/*
  로그인
*/
router.post('/', function(req, res, next) {
  	console.log('로그인');
  	loginAPI(req, res);
});

/*
  로그아웃
*/
router.get('/logout', function(req, res, next) {
  console.log('로그아웃하기');
  logoutAPI(req, res);
});

module.exports = router;

var loginAPI = function(req, res) {
	var body = req.body;

	var query = 'SELECT u.account, u.password FROM users AS u';
	var queryWhere = ' WHERE u.account = "' + body.auth_email + '"';

	connection.query(query + queryWhere, (error, rows, fields) => {

		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error)
			throw error;

		var password = rows[0].password;

		// 비밀번호 일치 - 로그인 허용
		bcrypt.compare(body.auth_password, password, function(err, result){
			if(result) {
				console.log('login success.');
              	// 세션 값 부여 후 리디렉트
				req.session.adminsession = config.sessionSecret;
				res.redirect('/employee');
            }
            else {
              	console.log('login fail.');
				res.render('../views/auth/auth_index.ejs', {
			  		'message' : '비밀번호를 확인해주세요.'
				})
            }
		})	
	});
}

var logoutAPI = function(req, res) {
	delete req.session.adminsession;

	res.redirect('/');
}