import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { db, auth, relocatePage, getFooter } from "../index.js";

var selected_event = sessionStorage.getItem("selected_event");

var input_count;

var event_id;

var name;
var student_number;
var number;
var payment;
var department;
var semCount;
var firstMajor;
var secondMajor;

var inputs = {};

var questions;
var title;
var description;
var types;
var meta_data;

onAuthStateChanged(auth, (user) => {
  if (user) {
    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());

    eventInfo();
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id == "addInput") {
    var forms = document.querySelector(".needs-validation");

    if (forms.checkValidity()) {
      set_input();
      add_input();
    }

    forms.classList.add("was-validated");
  } else if (e.target && e.target.id == "cancel") {
    relocatePage(false, "home.html");
  }
});

const eventInfo = async () => {
  const eventRef = doc(db, "events", selected_event);
  const eventSnap = await getDoc(eventRef);

  event_id = eventSnap.id;
  title = eventSnap.data().title;
  questions = eventSnap.data().forms_questions;
  description = eventSnap.data().description;
  types = eventSnap.data().forms_types;
  meta_data = eventSnap.data().forms_meta_data;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  name = userSnap.data().name;
  student_number = userSnap.data().student_number;
  number = userSnap.data().number;
  payment = userSnap.data().payment;
  department = userSnap.data().department;
  semCount = userSnap.data().semCount;
  firstMajor = userSnap.data().firstMajor;
  secondMajor = userSnap.data().secondMajor;

  if (payment == "pay") {
    payment = "납부";
  } else {
    payment = "미납";
  }

  makeForm();
};

const makeForm = async () => {
  info_area();
  form_area();
};

function info_area() {
  var info = document.getElementById("info_area");

  var h2_tag = document.createElement("h2");
  var h2_text = document.createTextNode(title);
  h2_tag.appendChild(h2_text);

  var p_tag = document.createElement("p");
  p_tag.setAttribute("class", "lead");
  var p_text = document.createTextNode(description);
  p_tag.appendChild(p_text);

  info.appendChild(h2_tag);
  info.appendChild(p_tag);
}

function form_area() {
  input_count = questions.length;

  for (var i = 0; i < input_count; i++) {
    if (types[i] == "text") {
      addTextQuestion(questions[i], i + 1);
    } else if (types[i] == "radio") {
      addRadioQuestion(questions[i], i + 1, meta_data[i]);
    } else if (types[i] == "check") {
      addCheckboxQuestion(questions[i], i + 1, meta_data[i]);
    }
  }
}

function addTextQuestion(question, idx) {
  var form = document.getElementById("form_area");

  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-sm-12");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("type", "text");
  input_tag.setAttribute("class", "form-control");
  input_tag.setAttribute("id", "question_" + idx);
  input_tag.setAttribute("placeholder", "");
  input_tag.setAttribute("value", "");
  input_tag.setAttribute("required", "");

  var invalid_tag = document.createElement("div");
  invalid_tag.setAttribute("class", "invalid-feedback");
  var invalid_text = document.createTextNode("미입력");
  invalid_tag.appendChild(invalid_text);

  div_tag.appendChild(question_label_e(idx, question));
  div_tag.appendChild(input_tag);
  div_tag.appendChild(invalid_tag);

  form.appendChild(div_tag);
  form.appendChild(hr_e());
}

function addRadioQuestion(question, idx, meta_data) {
  var form = document.getElementById("form_area");

  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "my-3");

  div_tag.appendChild(question_label_e(idx, question));

  var data_count = meta_data.length;
  for (var i = 0; i < data_count; i++) {
    div_tag.appendChild(radio_data_e(meta_data[i], idx, i));
  }

  form.appendChild(div_tag);
  form.appendChild(hr_e());
}

function radio_data_e(data, idx, i) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("value", data);
  input_tag.setAttribute("id", data);
  input_tag.setAttribute("name", "question_" + idx);
  input_tag.setAttribute("type", "radio");
  input_tag.setAttribute("class", "form-check-input");
  input_tag.setAttribute("required", "");

  if (i == 0) {
    input_tag.setAttribute("check", "");
  }

  var label_tag = document.createElement("label");
  label_tag.setAttribute("class", "form-check-label");
  label_tag.setAttribute("for", data);
  var label_text = document.createTextNode(data);
  label_tag.appendChild(label_text);

  div_tag.appendChild(input_tag);
  div_tag.appendChild(label_tag);

  return div_tag;
}

function addCheckboxQuestion(question, idx, meta_data) {
  var form = document.getElementById("form_area");

  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-sm-12");

  div_tag.appendChild(question_label_e(idx, question));

  var data_count = meta_data.length;
  for (var i = 0; i < data_count; i++) {
    div_tag.appendChild(checkbox_data_e(meta_data[i], idx));
  }

  form.appendChild(div_tag);
  form.appendChild(hr_e());
}

function checkbox_data_e(data, idx) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("value", data);
  input_tag.setAttribute("id", data);
  input_tag.setAttribute("name", "question_" + idx);
  input_tag.setAttribute("type", "checkbox");
  input_tag.setAttribute("class", "form-check-input");

  var label_tag = document.createElement("label");
  label_tag.setAttribute("class", "form-check-label");
  label_tag.setAttribute("for", data);
  var label_text = document.createTextNode(data);
  label_tag.appendChild(label_text);

  div_tag.appendChild(input_tag);
  div_tag.appendChild(label_tag);

  return div_tag;
}

function question_label_e(idx, question) {
  var label_tag = document.createElement("label");
  label_tag.setAttribute("for", "question_" + idx);
  label_tag.setAttribute("class", "form-label");
  var label_text = document.createTextNode(question);
  label_tag.appendChild(label_text);

  return label_tag;
}

function hr_e() {
  var hr_tag = document.createElement("hr");
  hr_tag.setAttribute("class", "my-4");

  return hr_tag;
}

function set_input() {
  inputs = {};

  for (var i = 0; i < input_count; i++) {
    var idx = i + 1;

    if (types[i] == "text") {
      inputs[i] = document.getElementById("question_" + idx).value;
    } else if (types[i] == "radio") {
      inputs[i] = document.querySelector(
        'input[name="' + "question_" + idx + '"]:checked'
      ).value;
    } else if (types[i] == "check") {
      var array = [];
      var checkboxes = document.querySelectorAll(
        "input[type=checkbox][name=" + "question_" + idx + "]:checked"
      );

      for (var j = 0; j < checkboxes.length; j++) {
        array.push(checkboxes[j].value);
      }

      inputs[i] = array;
    }
  }
}

const add_input = async () => {
  var docRef = doc(db, "applications", "x");

  const q = query(
    collection(db, "applications"),
    where("event_id", "==", event_id),
    where("uid", "==", auth.currentUser.uid)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (applicationDoc) => {
    docRef = doc(db, "applications", applicationDoc.id);
  });

  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      cmp_date: Timestamp.now().valueOf(),

      event_id: event_id,
      uid: auth.currentUser.uid,
      title: title,

      name: name,
      student_number: student_number,
      email: auth.currentUser.email,
      number: number,
      payment: payment,
      department: department,
      semCount: semCount,
      firstMajor: firstMajor,
      secondMajor: secondMajor,
      reg_date: serverTimestamp(),

      questions: questions,
      inputs: inputs,
    });
  } else {
    await addDoc(collection(db, "applications"), {
      cmp_date: Timestamp.now().valueOf(),

      event_id: event_id,
      uid: auth.currentUser.uid,
      title: title,

      name: name,
      student_number: student_number,
      email: auth.currentUser.email,
      number: number,
      payment: payment,
      department: department,
      semCount: semCount,
      firstMajor: firstMajor,
      secondMajor: secondMajor,
      reg_date: serverTimestamp(),

      questions: questions,
      inputs: inputs,
    });
  }

  relocatePage(false, "home.html");
};
