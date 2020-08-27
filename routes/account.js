var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const moment = require('moment');

const SERVER = 'http://121.126.225.132:3001';
const config = require('../config/config');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3307,
    password: 'polygon',
    database: 'andkorea'
});

connection.connect();

/*
  계정관리 페이지
*/
router.get('/', function(req, res, next) {
	console.log('계정관리 페이지');
	if (req.session.adminsession == config.sessionSecret) {
	   	accountsAPI(req, res);
	}
	else {
		// res.render('../views/auth/auth_index.ejs', {
		//     'message' : ''
		// })
		res.redirect('/');
	}	
});

/*
  계정 비밀번호 초기화
*/
router.get('/resetpassword', function(req, res, next) {
  console.log('계정 비밀번호 초기화');
  resetPasswordAPI(req, res);
});

module.exports = router;

var accountsAPI = function(req, res) {
	var query = 'SELECT u.id, u.account FROM users AS u';

	connection.query(query, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error)
		  throw error;

		res.render('../views/account/account_index.ejs', {
		    'data': rows
		})
	});
}

var resetPasswordAPI = function(req, res) {
	const user_id = req.query.id;

	var post = {
		password : '123456',
		is_valid : 0
	}

	connection.query('UPDATE users SET ? WHERE id = "' + user_id + '"', post, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error)
			throw error;

		res.redirect('/account');
	});
}