var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const moment = require('moment');
const fcm = require('../fcm/fcm');

const IMAGE_SERVER_ADDRESS = 'http://admin.andk.co.kr';
const ADMIN_ID = '9373d9f6-e6ca-11ea-9982-20cf305809b8';
const GONGJI_ID = '6797f061-c997-11ea-9982-20cf305809b8';
const GYEONGJOSA_ID = '38509e8c-cb37-11ea-9982-20cf305809b8';
const config = require('../config/configure');

const connection = config.db;

/*
  사진 서버 업로드 config
*/ 
var storage = multer.diskStorage({
  
  destination: function(req, file, cb){
    cb(null, 'and_boards_image/')  // 파일 저장할 폴더명 입력
  },
  
  filename: function(req, file, cb) {
    cb(null, file.originalname) // 파일 이름 설정
  }
})

var upload = multer({storage: storage})

/*
  게시글 관리 페이지
*/
router.get('/', function(req, res, next) {
  	console.log('게시글 관리 페이지');
  	if (req.session.adminsession == config.sessionSecret) {
	   	boardsAPI(req, res);
	}
	else {
		// res.render('../views/auth/auth_index.ejs', {
		//     'message' : ''
		// })
		res.redirect('/');
	}	
});

/*
  게시글 등록 페이지
*/
router.get('/add', function(req, res, next) {
  	console.log('게시글 등록 페이지');
  	
  	if (req.session.adminsession == config.sessionSecret) {
	   	categoryAPI(req, res);
	}
	else {
		res.render('../views/auth/auth_index.ejs', {
		    'message' : ''
		})
	}
});

/*
  게시글 등록
  upload.single() 부분이 파일 있을 경우 서버에 업로드 해주는 부분
*/
router.post('/add', upload.single('board_img'), function(req, res, next) {
	console.log('게시글 등록하기');
	console.log(req.body);
	boardAddAPI(req, res);
});


/*
  게시글 수정 페이지
*/
router.get('/edit', function(req, res, next) {
	console.log('게시글 수정 페이지');
	
  	if (req.session.adminsession == config.sessionSecret) {
	   	boardAPI(req, res);
	}
	else {
		res.render('../views/auth/auth_index.ejs', {
		    'message' : ''
		})
	}
});

/*
  게시글 정보 수정
*/
router.post('/edit', upload.single('board_img'), function(req, res, next) {
  console.log('게시글 정보 수정하기');
  console.log(req.body);
  boardEditAPI(req, res);
});

/*
  게시글 삭제
*/
router.get('/delete', function(req, res, next) {
  console.log('게시글 삭제하기');
  boardDeleteAPI(req, res);
});


module.exports = router;

var boardsAPI = function(req, res){
	console.log(req.query);
	const category_id = req.query.category_id;

	var query = 'SELECT b.id, u.account AS user_name, b.category_id, bca.name AS category_name, b.title, b.contents, b.createdat FROM boards AS b LEFT JOIN users AS u ON b.user_id = u.id LEFT JOIN board_categories AS bca ON b.category_id = bca.id ';

	var queryWhere = 'WHERE b.category_id = "' + category_id + '" AND b.deletedat IS NULL ORDER BY b.createdat DESC';
	// 카테고리 아이디가 '' 로 올 경우 공지사항, 경조사 글만 조회
	if(category_id == '' || category_id == undefined) {
		// queryWhere = 'WHERE (b.category_id = "6797f061-c997-11ea-9982-20cf305809b8" OR b.category_id = "38509e8c-cb37-11ea-9982-20cf305809b8") AND b.deletedat IS NULL ORDER BY b.createdat DESC';
		queryWhere = 'WHERE b.deletedat IS NULL ORDER BY b.createdat DESC';
	}

	connection.query(query + queryWhere, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) 
		  throw error;
		else {
		  resultCode = 200;
		  message = "성공"
		}

		for(var index in rows) {
			var item = rows[index];
			var board_title = item.title;
			if (board_title.length > 10) {
				item.title = board_title.substring(0, 9) + '...';
			}
			var board_contents = item.contents;
			if (board_contents.length > 20) {
				item.contents = board_contents.substring(0, 19) + '...';
			}
			var board_createdat_origin = item.createdat
			item.createdat = moment(board_createdat_origin).format('YYYY-MM-DD HH:mm')

			// var board_updatedat_origin = item.updatedat
			// item.updatedat = moment(board_updatedat_origin).format('MM.DD HH:mm')
		}
		console.log(rows);

		res.render('../views/board/board_index.ejs', {
			'data' : rows
		})
	});
}

var categoryAPI = function(req, res){
	// 부서목록 가져오기
    var query = 'SELECT bc.id, bc.name FROM board_categories AS bc ORDER BY name ASC';
	connection.query(query, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) {
			reject();
			throw error;
		}

		res.render('../views/board/board_add.ejs', {
		  	'categories': rows
		})
	});
}

var boardAPI = function(req, res) {
  	var board_id = req.query.id;
  	console.log(board_id);

  	// 게시글 정보 가져오기
	const promise1 = new Promise(function(resolve, reject){
		var query = 'SELECT b.id, u.account AS user_name, b.category_id, bca.name AS category_name, b.title, b.contents, b.createdat FROM boards AS b LEFT JOIN users AS u ON b.user_id = u.id LEFT JOIN board_categories AS bca ON b.category_id = bca.id ';
		var queryWhere = 'WHERE b.id = "' + board_id + '" AND b.deletedat IS NULL';

		connection.query(query + queryWhere, (error, rows, fields) => {
			var resultCode = 404;
			var message = "에러가 발생했습니다.";

			if (error) {
				reject();
			  throw error;
			}

			for(var index in rows) {
				var item = rows[index];				
				var board_createdat_origin = item.createdat
				item.createdat = moment(board_createdat_origin).format('YYYY-MM-DD HH:mm')

				// var board_updatedat_origin = item.updatedat
				// item.updatedat = moment(board_updatedat_origin).format('MM.DD HH:mm')
			}
			resolve(rows[0]);
		});
	})

  	// 부서목록 가져오기
	const promise2 = new Promise(function(resolve, reject){ 
		// 부서목록 가져오기
	    var query = 'SELECT bc.id, bc.name FROM board_categories AS bc ORDER BY name ASC';
		connection.query(query, (error, rows, fields) => {
			var resultCode = 404;
			var message = "에러가 발생했습니다.";

			if (error) {
				reject();
				throw error;
			}

			resolve(rows);
		});
	})

    Promise.all([promise1, promise2]).then(function (values) {
      
		var board = values[0];
		var categories = values[1];
		console.log(board);
		console.log(categories);

		res.render('../views/board/board_edit.ejs', {
			'board' : board,
			'categories' : categories
		})
    });
}

var boardAddAPI = function(req, res){
	var body = req.body;
	var file = req.file;

	var board_post = {
		id : uuid(),
		user_id : ADMIN_ID,
		category_id : body.board_category,
		title : body.board_title,
		contents : body.board_contents,
		image :  null,
		click_count : 0,
		createdat : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
		updatedat : null,
		deletedat : null
	}

	if(file != undefined) {
		employee_post['image'] = IMAGE_SERVER_ADDRESS + '/boards/' + file.originalname;
	}

  	connection.query('INSERT INTO boards SET ?', board_post, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) {
		  throw error;
		}
		// 공지사항 또는 경조사일 경우 전 직원에게 푸시알람 보내기
		// is_valid = 1
		// is_push = 1
		// device_token IS NOT NULL
		if(board_post.category_id == GONGJI_ID || board_post.category_id == GYEONGJOSA_ID) {

			connection.query('SELECT device_token FROM users WHERE is_valid = 1 AND is_push = 1 AND device_token IS NOT NULL' , (error2, rows2, fields2) => {
				var resultCode = 404;
				var message = "에러가 발생했습니다.";

				if (error) 
				  	throw error;
				else {
					resultCode = 200;
					message = "성공";

					console.log(rows2);

					var tokenList = [];
					for(var i in rows2) {
						var item = rows2[i];
						tokenList.push(item.device_token);
					}

					console.log("token list", tokenList);
					var fcm_title = '';
					if(board_post.category_id == GONGJI_ID) {
						fcm_title = '공지사항';
					}
					if(board_post.category_id == GYEONGJOSA_ID) {
						fcm_title = '경조사';	
					}

					var fcmMessage = { 
					    registration_ids: tokenList,
					    notification: {
					        title: fcm_title, 
					        body: board_post.title 
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
					})	
				}
			});
		}
		res.redirect('/board');
	});
}

var boardEditAPI = function(req, res){
	var body = req.body;
	var file = req.file;

	var board_post = {
		category_id : body.board_category,
		title : body.board_title,
		contents : body.board_contents,
		updatedat : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
	}

	if(file != undefined) {
		employee_post['image'] = IMAGE_SERVER_ADDRESS + '/boards/' + file.originalname;
	}

	connection.query('UPDATE boards SET ?, createdat = createdat WHERE id = "' + body.board_id + '"', board_post, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) {
			throw error;
		}
		res.redirect('/board');
	});	
}

var boardDeleteAPI = function(req, res) {
	const board_id = req.query.id;

	var post = {
		deletedat : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
	}

	connection.query('UPDATE boards SET ? WHERE id = "' + board_id + '"', post, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) 
			throw error;

		res.redirect('/board');
	});
}