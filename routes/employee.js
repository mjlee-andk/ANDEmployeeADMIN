var express = require('express');
var router = express.Router();

const uuid = require('uuid4');
const mysql = require('mysql');
const _ = require('underscore');
const multer = require('multer');
const moment = require('moment');

const IMAGE_SERVER_ADDRESS = 'http://121.126.225.132';
const config = require('../config/configure');

const connection = config.db;
// config.dbConnect();

/*
  사진 서버 업로드 config
*/ 
var storage = multer.diskStorage({
  
  destination: function(req, file, cb){
    cb(null, 'and_employees_profile/')  // 파일 저장할 폴더명 입력
  },
  
  filename: function(req, file, cb) {
    cb(null, file.originalname) // 파일 이름 설정
  }
})

var upload = multer({ storage: storage})

/*
  직원 관리 페이지     
*/
router.get('/', function(req, res, next) {
  console.log('직원 관리 페이지');
  console.log(req.session.adminsession);
  if (req.session.adminsession == config.sessionSecret) {
    employeesAPI(req, res);  
  }
  else {
    // res.render('../views/auth/auth_index.ejs', {
    //     'message' : ''
    // })
    res.redirect('/');
  }
});

/*
  직원 등록 페이지
*/
router.get('/add', function(req, res, next) {
  console.log('직원 등록 페이지');
  if (req.session.adminsession == config.sessionSecret) {
    departmentsAPI(req, res);  
  }
  else {
    res.render('../views/auth/auth_index.ejs', {
        'message' : ''
    })
  }  
});

/*
  직원 등록
  upload.single() 부분이 파일 있을 경우 서버에 업로드 해주는 부분
*/
router.post('/add', upload.single('employee_profile'), function(req, res, next) {
  console.log('직원 등록하기');
  console.log(req.body);
  employeeAddAPI(req, res);
});


/*
  직원 수정 페이지
*/
router.get('/edit', function(req, res, next) {
  console.log('직원 수정 페이지');
  employeeAPI(req, res);
  
});

/*
  직원 정보 수정
*/
router.post('/edit', upload.single('employee_profile'), function(req, res, next) {
  console.log('직원 정보 수정하기');
  console.log(req.body);
  employeeEditAPI(req, res);
});

module.exports = router;

var employeesAPI = function(req, res) {
  var query = 'SELECT e.id, e.name, e.gender, e.profile_img, e.extension_number, e.phone, e.birth, e.join_date, e.leave_date, dv.name AS division_name, dp.name AS department_name, p.name AS position_name FROM employees AS e LEFT JOIN divisions AS dv ON e.division_id = dv.id LEFT JOIN departments AS dp ON e.department_id = dp.id LEFT JOIN positions AS p ON e.position_id = p.id';
  var queryWhere = ' WHERE e.leave_date IS NULL';
  var queryOrder = ' ORDER BY dv.name ASC, e.name ASC, p.priority ASC';


  connection.query(query + queryWhere + queryOrder, (error, rows, fields) => {
    var resultCode = 404;
    var message = "에러가 발생했습니다.";

    if (error)
      throw error;
    else {
      resultCode = 200;
      message = "성공"
    }

    res.render('../views/employee/employee_index.ejs', {
        'code': resultCode,
        'message': message,
        'data': rows
    })
  });
}

var employeeAPI = function(req, res) {
  var employee_id = req.query.id;

  // 직원 정보 가져오기
  const promise1 = new Promise(function(resolve, reject){ 
    console.log(employee_id)
      var query = 'SELECT e.id, e.name, u.account AS email, u.is_push, e.gender, e.profile_img, e.extension_number, e.phone, e.birth, e.join_date, e.leave_date, e.school_name, e.final_education, e.annual_incomes, dv.id AS division_id, dv.name AS division_name, dp.id AS department_id, dp.name AS department_name, p.id AS position_id, p.name AS position_name FROM employees AS e LEFT JOIN divisions AS dv ON e.division_id = dv.id LEFT JOIN departments AS dp ON e.department_id = dp.id LEFT JOIN positions AS p ON e.position_id = p.id LEFT JOIN users AS u ON u.employee_id = e.id WHERE e.id = ?'
      connection.query(query, [employee_id], (error, rows, fields) => {
            var resultCode = 404;
            var message = "에러가 발생했습니다.";

            if (error){
              reject();
              throw error;
            }
            // console.log(rows[0]);

            var birth_origin = rows[0].birth;
            rows[0].birth = moment(birth_origin).format('YYYY-MM-DD');

            var join_date_origin = rows[0].join_date;
            rows[0].join_date = moment(join_date_origin).format('YYYY-MM-DD');

          resolve(rows[0]);
          });
      })

  // 부서목록 가져오기
    const promise2 = new Promise(function(resolve, reject){ 
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
    const promise3 = new Promise(function(resolve, reject){ 
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

    Promise.all([promise1, promise2, promise3]).then(function (values) {
      
      var employee = values[0];
      var divisions = values[1];
      var adk_departments = divisions[0].departments;
      var adks_departments = divisions[1].departments;
      var positions = values[2];

      res.render('../views/employee/employee_edit.ejs', {
            'employee': employee,
            'divisions': divisions,
            'adk_departments': adk_departments,
            'adks_departments': adks_departments,
            'positions': positions
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

// 신규 직원 등록
var employeeAddAPI = function(req, res){
  var body = req.body;
  var file = req.file;

  // 직원 정보 등록
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
    position_id : body.employee_position,
    final_education : body.employee_final_education,
    school_name : body.employee_school_name,
    annual_incomes : body.employee_annual_incomes
  }

  const promise1 = new Promise(function(resolve, reject){    

    if(file != undefined) {
      employee_post['profile_img'] = IMAGE_SERVER_ADDRESS + '/and_employees_profile/' + file.originalname;
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
      res.redirect('/employee')
  });
}

var employeeEditAPI = function(req, res){
  var body = req.body;
  var file = req.file;

  console.log(body.employee_leave);

  var employee_post = {
    name : body.employee_name,
    gender : body.employee_gender,
    extension_number : body.employee_extensionnum,
    phone : body.employee_phone,
    birth : body.employee_birth,
    join_date : body.employee_join,
    leave_date : null,
    division_id : body.employee_division,
    department_id : body.employee_department,
    position_id : body.employee_position,
    final_education : body.employee_final_education,
    school_name : body.employee_school_name,
    annual_incomes : body.employee_annual_incomes
  }

  const promise1 = new Promise(function(resolve, reject){    

    if(file != undefined) {
      employee_post['profile_img'] = IMAGE_SERVER_ADDRESS + '/and_employees_profile/' + file.originalname;
    }

    if(body.employee_leave != '1901-01-01') {
      employee_post.leave_date = body.employee_leave;
    }

    connection.query('UPDATE employees SET ? WHERE id = "' + body.employee_id + '"', employee_post, (error, rows, fields) => {
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
    account : body.employee_email,
    is_push : body.employee_ispush
  }

  const promise2 = new Promise(function(resolve, reject){
    connection.query('UPDATE users SET ? WHERE employee_id = "' + body.employee_id + '"', user_post, (error, rows, fields) => {
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
      res.redirect('/employee')
  });
}