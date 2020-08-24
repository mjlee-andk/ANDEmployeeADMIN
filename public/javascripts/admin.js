const ID_ADK = '58053d75-c1fe-11ea-9982-20cf305809b8';

var adk_departments = [];
var adks_departments = [];

var getAdkDepartments = function(name, id) {
	adk_departments.push({
		'name': name,
		'id': id
	})
}

var getAdksDepartments = function(name, id) {
	adks_departments.push({
		'name': name,
		'id': id
	})
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

var setPreview = function(event){
  var reader = new FileReader();

  reader.onload = function(event){
    var img = document.createElement("img");
    img.setAttribute("src", event.target.result);
    document.querySelector("div#image_container").appendChild(img);
  };

  reader.readAsDataURL(event.target.files[0]);
}

var validateEmployeeInfo = function() {

  if($('input[name="employee_name"]').val() == '') {
    alert('이름을 입력해주세요.')
    return false;
  }

  if($('input[name="employee_email"]').val() == '') {
    alert('회사메일을 입력해주세요.')
    return false;
  }

  if($('input[name="employee_gender"]').val() == '') {
    alert('성별을 선택해주세요.')
    return false;
  }

  if($('input[name="employee_phone"]').val() == '') {
    alert('핸드폰 번호를 입력해주세요.')
    return false;
  }

  if($('input[name="employee_extensionnum"]').val() == '') {
    alert('내선 번호를 입력해주세요.')
    return false;
  }

  if($('input[name="employee_birth"]').val() == '') {
    alert('생일을 입력해주세요.')
    return false;
  }

  if($('input[name="employee_join"]').val() == '') {
    alert('입사일을 입력해주세요.')
    return false;
  }

  if($('input[name="employee_division"]').val() == '') {
    alert('소속을 선택해주세요.')
    return false;
  }

  if($('input[name="employee_department"]').val() == '') {
    alert('부서를 선택해주세요.')
    return false;
  }

  if($('input[name="employee_position"]').val() == '') {
    alert('직급을 선택해주세요.')
    return false;
  }

  return true;
}

var employee_add_submit = function() {
    var employee_add_form = document.getElementById("employee_add_form");

    if(validateEmployeeInfo()) {
        employee_add_form.submit();
    }
}