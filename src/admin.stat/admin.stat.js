import "./admin.stat.css";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  where,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  relocatePage,
  getFooter,
  listenToNav,
  listenToLogout,
  resetBoard,
  th_e,
  getOffCanvas,
  listenToProfile,
  getPage,
} from "../index.js";

var selected_event = sessionStorage.getItem("selected_event");

onAuthStateChanged(auth, (user) => {
  if (user) {
    relocatePage(true, "");

    getPage();

    getOffCanvas();

    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());

    addTitle();
    addDropDown();
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToProfile(e);
});

document.addEventListener("change", function (e) {
  if (e.target && e.target.id == "eventSelection") {
    selected_event = e.target.value;

    addTitle();
  } else if (e.target && e.target.name == "fields[]") {
    getCheckedFields();
  }
});

const addTitle = async () => {
  const docRef = doc(db, "events", selected_event);
  const docSnap = await getDoc(docRef);

  var title;
  if (docSnap.exists()) {
    title = docSnap.data().title;

    var questions = docSnap.data().forms_questions;
    clearChecks();
    addQuestionChecks(questions);
  } else if (selected_event == "all") {
    title = "전체 신청서";
    clearChecks();
  } else {
    title = "error getting event title!";
  }

  var title_area = document.getElementById("eventTitle");
  title_area.textContent = title;

  getCheckedFields();
};

function clearChecks() {
  resetBoard("checks");

  addCheck("numField", "num", "번호", true);
  addCheck("titleField", "title", "제목", false);
  addCheck("nameField", "name", "이름", true);
  addCheck("student_numberField", "student_number", "학번", true);
  addCheck("emailField", "email", "이메일", true);
  addCheck("numberField", "number", "연락처", true);
  addCheck("paymentField", "payment", "납부현황", true);
  addCheck("dateField", "reg_date", "신청날짜", true);
  addCheck("departmentField", "department", "학부", false);
  addCheck("semCountField", "semCount", "학기수", false);
  addCheck("firstMajorField", "firstMajor", "1전공", false);
  addCheck("secondMajorField", "secondMajor", "2전공", false);
}

function addQuestionChecks(questions) {
  for (var i = 0; i < questions.length; i++) {
    addCheck("inputsField", "inputs_" + i, questions[i], false);
  }
}

function addCheck(id, value, front, state) {
  var checks_area = document.getElementById("checks");

  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check form-check-inline");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("class", "form-check-input");
  input_tag.setAttribute("type", "checkbox");
  input_tag.setAttribute("id", id);
  input_tag.setAttribute("value", value);
  input_tag.setAttribute("name", "fields[]");

  if (state == true) {
    input_tag.setAttribute("checked", "");
  }

  var label_tag = document.createElement("label");
  label_tag.setAttribute("class", "form-check-label");
  label_tag.setAttribute("for", id);

  var label_text = document.createTextNode(front);
  label_tag.appendChild(label_text);

  div_tag.appendChild(input_tag);
  div_tag.appendChild(label_tag);

  checks_area.appendChild(div_tag);
}

function getCheckedFields() {
  var checkedFields = [];
  var checkedFieldTexts = [];

  var checkboxes = document.querySelectorAll('input[name="fields[]"]:checked');
  for (var j = 0; j < checkboxes.length; j++) {
    checkedFields.push(checkboxes[j].value);
    checkedFieldTexts.push(checkboxes[j].nextElementSibling.textContent);
  }
  getStatTable(checkedFields, checkedFieldTexts);
}

function getStatTable(checkedFields, checkedFieldTexts) {
  var q;
  if (selected_event == "all") {
    q = query(collection(db, "applications"), orderBy("cmp_date"));
  } else {
    q = query(
      collection(db, "applications"),
      where("event_id", "==", selected_event),
      orderBy("cmp_date")
    );
  }

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("appliedFields");

    checkedFieldTexts.forEach(function (fieldName) {
      addField(fieldName);
    });

    resetBoard("appliedUsers");

    var application_count = 1;

    querySnapshot.forEach(async (application) => {
      addRow(checkedFields, application, application_count);

      application_count++;
    });
  });
}

function addField(val) {
  var tr_tag = document.getElementById("appliedFields");
  tr_tag.appendChild(th_e(val, "col"));
}

function addRow(checkedFields, application, application_count) {
  var data;
  var tbody = document.getElementById("appliedUsers");

  var tr_tag = document.createElement("tr");

  checkedFields.forEach(function (val) {
    if (val == "num") {
      data = application_count;
    } else if (val == "reg_date") {
      data = application.get(val).toDate().toLocaleString();
    } else {
      var input_data = val.split("_");
      if (input_data[0] == "inputs") {
        var idx = parseInt(input_data[1]);
        data = application.get(input_data[0])[idx];
      } else {
        data = application.get(val);
      }
    }

    tr_tag.appendChild(th_e(data, "row"));
  });

  tbody.appendChild(tr_tag);
}

const addDropDown = async () => {
  const q = query(collection(db, "events"), orderBy("end_date"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("eventSelection");
    addSelection("all", "전체 신청서");

    querySnapshot.forEach((doc) => {
      var event_id = doc.id;
      var title = doc.data().title;

      addSelection(event_id, title);
    });
  });
};

function addSelection(event_id, title) {
  var select_tag = document.getElementById("eventSelection");
  select_tag.appendChild(option_e(event_id, title));
}

function option_e(event_id, title) {
  var option_tag = document.createElement("option");
  option_tag.setAttribute("id", event_id);
  option_tag.setAttribute("value", event_id);

  var option_text = document.createTextNode(title);
  option_tag.appendChild(option_text);

  if (event_id == selected_event) {
    option_tag.setAttribute("selected", "");
  }

  return option_tag;
}
