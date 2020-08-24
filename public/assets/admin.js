const ID_ADK = '58053d75-c1fe-11ea-9982-20cf305809b8';
var dbConObj = require('../../config/db_info');
var dbconn = dbConObj.init();
dbConObj.dbopen(dbconn);

var adk_departments = [];
var adks_departments = [];

window.onload = function(){
	// getDepartments();
}

var getDepartments = function() {
	var query = 'SELECT de.id, de.name, de.division_id, dv.name AS division_name FROM departments AS de LEFT JOIN divisions AS dv ON de.division_id = dv.id ORDER BY name ASC';
	connection.query(query, (error, rows, fields) => {
	    var resultCode = 404;
	    var message = "에러가 발생했습니다.";

	    if (error) {
	      	throw error;
	    }

	    var adkList = _.filter(rows, function(dep){
	      return dep.division_name == "ADK";
	    });

	    var adksList = _.filter(rows, function(dep){
	      return dep.division_name == "ADKS";
	    });

	    adk_departments = adkList;
	    adks_departments = adksList;
  	});
}

var setDepartments = function() {
	var division_selected_id = document.getElementById("employee_division_select").value;
    var departments_select = document.getElementById("employee_department_select");
    departments_select.options.length = 0;

    // ADK
    if(division_selected_id == ID_ADK) {
        for(var i = 0; i < adk_departments.length; i++) {
        	var option = document.createElement('option');
        	option.value = adk_departments[i].id; 
        	option.text = adk_departments[i].name;

        	// if(employee.department_id == adk_departments[i].id) {
        	// 	option.selected = true;
        	// }
        	departments_select.add(option);
        }
    } 
    // ADKS
    else {
        for(var i = 0; i < adks_departments.length; i++) {
        	var option = document.createElement('option');
        	option.value = adks_departments[i].id; 
        	option.text = adks_departments[i].name;

        	// if(employee.department_id == adks_departments[i].id) {
        	// 	option.selected = true;
        	// }
        	departments_select.add(option);
        }
    }
}

var employeeEdit = function() {
	var edit_form = document.forms['employee_edit_form'];
	
	// validation
	var employee_name = edit_form['employee_name'].value;
	var employee_email = edit_form['employee_email'].value;
	var employee_gender = edit_form['employee_gender'].value;
	var employee_phone = edit_form['employee_phone'].value;
	var employee_extensionnum = edit_form['employee_extensionnum'].value;

	var employee_birth = edit_form['employee_birth'].value;
	var employee_join = edit_form['employee_join'].value;

	var employee_division = edit_form['employee_division'].value;
	var employee_department = edit_form['employee_department'].value;
	var employee_position = edit_form['employee_position'].value;

	console.log(employee_gender);

	console.log(employee_division);
	console.log(employee_department);
	console.log(employee_position);


	// if(employee_name == '') {
	// 	alert('')
	// 	return false;
	// }

	// if(employee_email == '') {
	// 	alert('')
	// 	return false;
	// }

	// if(employee_email == '') {
	// 	alert('')
	// 	return false;
	// }
}