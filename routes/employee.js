var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const SERVER = 'http://121.126.225.132:3001'

const connection = mysql.createConnection({
  // host: '121.126.225.132',
  host: 'localhost',
	user: 'root',
	port: 3307,
	password: 'polygon',
	database: 'andkorea'
});

connection.connect();

// 사진 업로드
var storage = multer.diskStorage({
  // 파일 저장할 폴더명 입력
  destination: function(req, file, cb){
    cb(null, 'uploads/')
  },
  // 파일 이름 설정
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage})


// 직원 관리 페이지
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  employeesAPI(req, res);
});

// 직원 등록 페이지
router.get('/employeeadd', function(req, res, next) {
  console.log('페이지 접속')
  departmentsAPI(req, res);
});

// 직원 등록 클릭시
router.post('/employeeadd', upload.single('employee_profile'), function(req, res, next) {
  console.log('등록 버튼 클릭');
  console.log(req.body);
  employeeAddAPI(req, res);
});

module.exports = router;

var employeesAPI = function(req, res) {
	var division_id = '58053d75-c1fe-11ea-9982-20cf305809b8';	// ADK
	// var division_id = '580cf650-c1fe-11ea-9982-20cf305809b8'; // ADKS
	var department_id = '';
	// const search = '';

  var query = 'SELECT e.id, e.name, e.gender, e.profile_img, e.extension_number, e.phone, e.birth, e.join_date, e.leave_date, dv.name AS division_name, dp.name AS department_name, p.name AS position_name FROM employees AS e LEFT JOIN divisions AS dv ON e.division_id = dv.id LEFT JOIN departments AS dp ON e.department_id = dp.id LEFT JOIN positions AS p ON e.position_id = p.id WHERE '
  var queryWhere = '';
  // queryWhere = queryWhere + 'e.name LIKE "%' + search + '%" AND ';
  queryWhere = queryWhere + 'e.division_id LIKE "%' + division_id + '%" AND ';
  queryWhere = queryWhere + 'e.department_id LIKE "%' + department_id + '%"';

  var queryOrder = ' ORDER BY e.name ASC, p.priority ASC';

  connection.query(query + queryWhere + queryOrder, (error, rows, fields) => {
    var resultCode = 404;
    var message = "에러가 발생했습니다.";

    if (error)
      throw error;
    else {
      resultCode = 200;
      message = "성공"
    }

    res.render('../views/index.ejs', {
        'code': resultCode,
        'message': message,
        'data': rows
      })
  });
}

var departmentsAPI = function(req, res) {
    // 부서목록 가져오기
    const promise1 = new Promise(function(resolve, reject){
      var query = 'SELECT de.id, de.name, de.telephone, de.division_id, dv.name AS division_name, dv.address, dv.telephone AS devision_telephone FROM departments AS de LEFT JOIN divisions AS dv ON de.division_id = dv.id ORDER BY name ASC';
      connection.query(query, (error, rows, fields) => {
          var resultCode = 404;
          var message = "에러가 발생했습니다.";

          if (error) {
            reject();
            throw error;
          }

          var adkList = _.filter(rows, function(dep){
            return dep.division_name == "ADK";
          });

          var adksList = _.filter(rows, function(dep){
            return dep.division_name == "ADKS";
          });    

          var adk = {
            'id': adkList[0].division_id,
            'name': adkList[0].division_name,
            'departments': adkList
          }

          var adks = {
            'id': adksList[0].division_id,
            'name': adksList[0].division_name,
            'departments': adksList
          }

          var result = [adk, adks];
          resolve(result);
        });
    })

    // 직급목록 가져오기
    const promise2 = new Promise(function(resolve, reject){ 
      var query = 'SELECT id, name FROM positions WHERE priority >= 3  ORDER BY priority ASC';
      connection.query(query, (error, rows, fields) => {
          var resultCode = 404;
          var message = "에러가 발생했습니다.";

          if (error) {
            reject();
              throw error;
          }

          var result = rows;
          resolve(result);
        });
    })

    Promise.all([promise1, promise2]).then(function (values) {

      var divisions = values[0];
      var adk_departments = divisions[0].departments;
      var adks_departments = divisions[1].departments;
      var positions = values[1];

      res.render('../views/employee/employee_add.ejs', {
          'divisions': divisions,
          'adk_departments': adk_departments,
          'adks_departments': adks_departments,
          'positions': positions
      })
    });
}

var employeeAddAPI = function(req, res){
  var body = req.body;
  var file = req.file;

  var employee_post = {
    id : uuid(),
    name : body.employee_name,
    gender : body.employee_gender,
    profile_img : null,
    extension_number : body.employee_extensionnum,
    phone : body.employee_phone,
    birth : body.employee_birth,
    join_date : body.employee_join,
    leave_date : null,
    division_id : body.employee_division,
    department_id : body.employee_department,
    position_id : body.employee_position
  }

  const promise1 = new Promise(function(resolve, reject){    

    if(file != undefined) {
      employee_post['profile_img'] = SERVER + '/and_employees_profile/' + file.originalname;
    }

    connection.query('INSERT INTO employees SET ?', employee_post, (error, rows, fields) => {
        var resultCode = 404;
        var message = "에러가 발생했습니다.";

        if (error) {
          reject();
          throw error;
        }
        else {
          resultCode = 200;
          message = "성공";
          resolve();
        }
      });
    });

  var user_post = {
    id : uuid(),
    account : body.employee_email,
    password : '123456',
    is_valid : 0,
    employee_id : employee_post.id,
    device_token : null,
    is_push : 1
  }

  const promise2 = new Promise(function(resolve, reject){
    connection.query('INSERT INTO users SET ?', user_post, (error, rows, fields) => {
      var resultCode = 404;
      var message = "에러가 발생했습니다.";

      if (error) {
          reject();
          throw error;
        }
        else {
          resultCode = 200;
          message = "성공";
          resolve();
        }
    });
  });

  Promise.all([promise1, promise2]).then(function (values) {
      res.redirect('/')
  });
}