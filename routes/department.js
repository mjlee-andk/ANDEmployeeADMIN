var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const moment = require('moment');

const SERVER = 'http://121.126.225.132:3001'

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3307,
    password: 'polygon',
    database: 'andkorea'
});

connection.connect();

/*
  부서 관리 페이지
*/
router.get('/', function(req, res, next) {
  console.log('부서 관리 페이지');
  departmentsAPI(req, res);
});

/*
  부서 등록 페이지
*/
router.get('/add', function(req, res, next) {
  console.log('부서 등록 페이지');
  divisionsAPI(req, res);
});

/*
  부서 등록
  upload.single() 부분이 파일 있을 경우 서버에 업로드 해주는 부분
*/
router.post('/add', function(req, res, next) {
  console.log('부서 등록하기');
  departmentAddAPI(req, res);
});


module.exports = router;

var departmentsAPI = function(req, res) {
  var query = 'SELECT d.id, d.name AS department_name, d.telephone, d.order_seq, d.division_id, dv.name AS division_name FROM departments AS d LEFT JOIN divisions AS dv ON d.division_id = dv.id';
  var queryOrder = ' ORDER BY dv.name ASC, d.order_seq ASC';

  connection.query(query + queryOrder, (error, rows, fields) => {
    var resultCode = 404;
    var message = "에러가 발생했습니다.";

    if (error)
      throw error;
    else {
      resultCode = 200;
      message = "성공"
    }

    res.render('../views/department/department_index.ejs', {
        'data': rows
    })
  });
}

var divisionsAPI = function(req, res) {
	var query = 'SELECT dv.id, dv.name FROM divisions AS dv ORDER BY name ASC';

	connection.query(query, (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error)
		  throw error;

		res.render('../views/department/department_add.ejs', {
		    'divisions': rows
		})
	});
}

var departmentAddAPI = function(req, res){
	var body = req.body;
	connection.query('SELECT MAX(d.order_seq) FROM departments AS d WHERE division_id = "' + body.department_division + '"', (error, rows, fields) => {
		var resultCode = 404;
		var message = "에러가 발생했습니다.";

		if (error) {
			throw error;
		}

		var max_order = rows[0]['MAX(d.order_seq)'];
		console.log(max_order);

		var department_post = {
			id : uuid(),
			division_id : body.department_division,
			name : body.department_name,
			telephone : body.department_telephone,
			order_seq : max_order + 1
		}

		connection.query('INSERT INTO departments SET ?', department_post, (error, rows, fields) => {
			var resultCode = 404;
			var message = "에러가 발생했습니다.";

			if (error) {
				throw error;
			}
			res.redirect('/department');
		});
	});  
}