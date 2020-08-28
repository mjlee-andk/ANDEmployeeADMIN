var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const moment = require('moment');
const fcm = require('../fcm/fcm');

const config = require('../config/configure');

const connection = config.db;

/*
  푸시알람 페이지
*/
router.get('/', function(req, res, next) {
  	console.log('푸시알람 페이지');
  	if (req.session.adminsession == config.sessionSecret) {
	   	res.render('../views/pushalarm/pushalarm_index.ejs', {
			
		})
	}
	else {
		// res.render('../views/auth/auth_index.ejs', {
		//     'message' : ''
		// })
		res.redirect('/');
	}	
});

/*
  푸시알람 보내기
*/
router.post('/', function(req, res, next) {
	console.log('푸시알람 보내기');
	pushAlarmAPI(req, res);
});

module.exports = router;

var pushAlarmAPI = function(req, res) {
	var body = req.body;

	// 앱 사용자 중 device_token이 있는 유저에게 푸시알람을 보냄
	// 관리자 페이지에서 보내는 것이므로 푸시알람 ON/OFF 상태와 상관없이 전송
	// is_valid = 1
	// device_token IS NOT NULL
	connection.query('SELECT device_token FROM users WHERE is_valid = 1 AND device_token IS NOT NULL' , (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) 
			throw error;
		else {
			resultCode = 200;
			message = "성공";

			var tokenList = [];
			for(var i in rows) {
				var item = rows[i];
				tokenList.push(item.device_token);
			}

			console.log("token list", tokenList);

			var fcmMessage = { 
			    registration_ids: tokenList,
			    notification: {
			        title: body.pushalarm_title, 
			        body: body.pushalarm_message 
			    }
			}

			fcm.fcmObj.send(fcmMessage, function(err, response){
				var resultCode = 404;
			    var message = "에러가 발생했습니다.";

			    if (err) {
			        console.log("Something has gone wrong!")
			    } else {
			        console.log("Successfully sent with response: ", response)
			        resultCode = 200;
			        message = "성공";
			    }
			    res.redirect('/pushalarm')
			})			
		}
	});
}