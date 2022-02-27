import "./admin.rand.css";

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
  alert,
  listenToAlert,
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
  listenToAlert(e);
  listenToProfile(e);

  if (e.target && e.target.id == "runRand") {
    var randNum = document.getElementById("randNum");
    pickRandom(randNum.value);
    randNum.value = "";
  }
});

document.addEventListener("change", function (e) {
  if (e.target && e.target.id == "eventSelection") {
    selected_event = e.target.value;

    addTitle();
  } else if (e.target && e.target.name == "fields[]") {
    getCheckedFields();
  } else if (e.target && e.target.id == "allRand") {
    changeAllRandChecks(e.target.checked);
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
  addCheck("nameField", "name", "이름", false);
  addCheck("student_numberField", "student_number", "학번", true);
  addCheck("emailField", "email", "이메일", true);
  addCheck("numberField", "number", "연락처", false);
  addCheck("paymentField", "payment", "납부현황", false);
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

    addRandCheck();
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

function addRandCheck() {
  var tr_tag = document.getElementById("appliedFields");

  var th_tag = document.createElement("th");
  th_tag.setAttribute("scope", "col");
  th_tag.appendChild(randCheck_e("allRand", "allRand"));

  tr_tag.appendChild(th_tag);
}

function randCheck_e(id, name) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check form-check-inline");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("class", "form-check-input");
  input_tag.setAttribute("type", "checkbox");
  input_tag.setAttribute("id", id);
  input_tag.setAttribute("name", name);

  div_tag.appendChild(input_tag);

  return div_tag;
}

function addField(val) {
  var tr_tag = document.getElementById("appliedFields");
  tr_tag.appendChild(th_e(val, "col"));
}

function addRow(checkedFields, application, application_count) {
  var data;
  var tbody = document.getElementById("appliedUsers");

  var tr_tag = document.createElement("tr");

  var th_tag = document.createElement("th");
  th_tag.setAttribute("scope", "row");
  th_tag.appendChild(randCheck_e(application.id, "randChecks[]"));

  tr_tag.appendChild(th_tag);

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

function changeAllRandChecks(state) {
  var checkboxes = document.querySelectorAll('input[name="randChecks[]"]');
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = state;
  }
}

function pickRandom(randNum) {
  resetBoard("winnerTable");

  var checkboxes = document.querySelectorAll(
    'input[name="randChecks[]"]:checked'
  );
  var randList = [];

  if (
    checkboxes.length != 0 &&
    Number.isInteger(Number(randNum)) &&
    Number(randNum) > 0 &&
    Number(randNum) <= checkboxes.length
  ) {
    randList = returnRandList(Number(randNum), checkboxes);
  } else if (randNum == "전체") {
    randList = returnRandList(checkboxes.length, checkboxes);
  } else {
    alert("랜덤 당첨 인원수 확인해주세요.", "danger");
  }

  addWinnerList(randList);
}

function returnRandList(num, checkboxes) {
  var randList = [];

  while (randList.length < num) {
    var idx = Math.floor(Math.random() * checkboxes.length);
    if (!randList.includes(checkboxes[idx].id)) {
      randList.push(checkboxes[idx].id);
    }
  }

  return randList;
}

const addWinnerList = async (winnerList) => {
  var winnerCount = 1;

  winnerList.forEach(async (applicationId) => {
    const docRef = doc(db, "applications", applicationId);
    const docSnap = await getDoc(docRef);

    var email = docSnap.data().email;
    addWinnerRow(winnerCount, email);
    winnerCount++;
  });
};

function addWinnerRow(idx, email) {
  var winnerTable = document.getElementById("winnerTable");

  var tr_tag = document.createElement("tr");

  tr_tag.appendChild(th_e(idx, "row"));
  tr_tag.appendChild(th_e(email, "row"));

  winnerTable.appendChild(tr_tag);
}
