const ID_ADK = '58053d75-c1fe-11ea-9982-20cf305809b8';

var adk_departments = [];
var adks_departments = [];

/*
    ADK 부서 목록 가져오기
*/
var getAdkDepartments = function(name, id) {
	adk_departments.push({
		'name': name,
		'id': id
	})
}


/*
    ADKS 부서 목록 가져오기
*/
var getAdksDepartments = function(name, id) {
	adks_departments.push({
		'name': name,
		'id': id
	})
}

/*
    소속 선택지 변경되면 부서 선택지 변경
*/
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

/*
    프로필 사진 업로드시 미리보기 설정
*/
var setPreview = function(event){
  var reader = new FileReader();

  reader.onload = function(event){
    var img = $('#profile_preview');
    img.css('display', 'block');
    img.attr('src', event.target.result);
  };

  reader.readAsDataURL(event.target.files[0]);
}

/*
    form에 입력값 빠진 것 있는지 체크
*/
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


/*
    직원 등록 버튼
*/
var employee_add_submit = function() {
    var employee_add_form = document.getElementById("employee_add_form");

    if(validateEmployeeInfo()) {
        employee_add_form.submit();
    }
}

/*
    직원 정보 수정 버튼
*/
var employee_edit_submit = function() {
    var employee_edit_form = document.getElementById("employee_edit_form");

    if(validateEmployeeInfo()) {
        employee_edit_form.submit();
    }
}

/*
    게시글 Form에 입력값 빠진 것 있는지 체크
*/
var validateBoardInfo = function() {  
    if($('#board_category_select').val() == '') {
        alert('카테고리를 선택해주세요.')
        return false;
    }
    if($('input[name="board_title"]').val() == '') {
        alert('제목을 입력해주세요.')
        return false;
    }
    if($('#board_contents_textarea').val() == '') {
        alert('내용을 입력해주세요.')
        return false;
    }
    return true;
}

/*
    게시글 등록 버튼
*/
var board_add_submit = function() {
    var board_add_form = document.getElementById("board_add_form");

    if(validateBoardInfo()) {
        board_add_form.submit();
    }
}

/*
    게시글 수정 버튼
*/
var board_edit_submit = function() {
    var board_edit_form = document.getElementById("board_edit_form");

    if(validateBoardInfo()) {
        board_edit_form.submit();
    }
}

/*
    게시글 삭제 버튼
*/
var board_alert_delete = function(board_id) {
  if(confirm('게시글을 삭제하시겠습니까?')) {
    window.location.href = '/board/delete?id=' + board_id;
    return;
  }
  else {
    return;
  }
}

/*
    부서 Form에 입력값 빠진 것 있는지 체크
*/
var validateDepartmentInfo = function() {  
    if($('#department_division_select').val() == '') {
        alert('소속을 선택해주세요.')
        return false;
    }
    if($('input[name="department_name"]').val() == '') {
        alert('부서명을 입력해주세요.')
        return false;
    }
    return true;
}

/*
    부서 등록 버튼
*/
var department_add_submit = function() {
    var department_add_form = document.getElementById("department_add_form");

    if(validateDepartmentInfo()) {
        department_add_form.submit();
    }
}

/*
    부서 수정 버튼
*/
var department_edit_submit = function() {
    var department_edit_form = document.getElementById("department_edit_form");

    if(validateDepartmentInfo()) {
        department_edit_form.submit();
    }
}

