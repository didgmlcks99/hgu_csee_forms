import "./admin.make.css";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";

import {
  db,
  auth,
  storage,
  relocatePage,
  getFooter,
  listenToNav,
  listenToLogout,
  getOffCanvas,
  listenToProfile,
  getPage,
} from "../index.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    relocatePage(true, "");

    getPage();

    getOffCanvas();

    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());
  } else {
    location.replace("login.html");
  }
});

var questionCount = 0;

var title;
var description;
var types = [];
var questions = [];
var metaDatas = {};
var start_date;
var end_date;
var cmp_start_date;
var cmp_end_date;
var imageFile;
var fileType;

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToProfile(e);
});

const submitEvent = async () => {
  title = document.getElementById("title").value;
  description = document.getElementById("description").value;

  start_date = Timestamp.fromDate(
    new Date(document.getElementById("start_date").value)
  );
  end_date = Timestamp.fromDate(
    new Date(document.getElementById("end_date").value)
  );

  cmp_start_date = start_date.valueOf();
  cmp_end_date = end_date.valueOf();

  types = [];
  questions = [];
  metaDatas = {};

  var type_list = document.getElementsByName("selections[]");
  var question_list = document.getElementsByName("questions[]");

  type_list.forEach(function (element) {
    types.push(element.value);
  });

  question_list.forEach(function (element) {
    questions.push(element.value);
  });

  var q_elements = document.getElementById("form_area").childNodes;

  for (var i = 0; i < questionCount; i++) {
    if (q_elements[i * 2 + 23].childElementCount == 6) {
      var type = q_elements[i * 2 + 23].childNodes[5].id;

      var tmpList = [];

      var metaData_list = document.getElementsByName(type + "[]");
      metaData_list.forEach(function (element) {
        tmpList.push(element.value);
      });

      metaDatas[i] = tmpList;
    } else {
      metaDatas[i] = [];
    }
  }

  imageFile = document.getElementById("eventImage").files.item(0);
  if (imageFile != null) {
    fileType = imageFile.type.split("/")[1];
  }
};

document.addEventListener("click", function (e) {
  if (e.target && e.target.id == "addQuestion") {
    addQuestion();
  } else if (e.target && e.target.id == "submitEvent") {
    var forms = document.querySelector(".needs-validation");

    if (forms.checkValidity()) {
      submitEvent();
      addEvent();
    }

    forms.classList.add("was-validated");
  } else if (e.target && e.target.id == "cancel") {
    relocatePage(true, "admin.home.html");
  } else if (e.target && e.target.id == "printCurrent") {
    console.log(title);
    console.log(description);

    console.log(start_date);
    console.log(end_date);

    console.log(types);
    console.log(questions);
    console.log(metaDatas);

    console.log(imageFile);
  }
});

document.addEventListener("change", function (e) {
  if (e.target && e.target.id == "selections[]") {
    var type = e.target.value;
    var q_id = e.target.parentElement.parentElement.id;
    var parent_count = e.target.parentElement.parentElement.childElementCount;

    if (parent_count == 6) {
      e.target.parentElement.childNodes[5].remove();
    }

    if (type == "text") {
    } else if (type == "radio") {
      metaData_e("radio", q_id);
    } else if (type == "check") {
      metaData_e("check", q_id);
    }
  }
});

document.addEventListener("click", function (e) {
  if (e.target && e.target.id == "removeQuestion") {
    var pre_idx = e.target.parentElement.parentElement.id;
    var nxt_sib = e.target.parentElement.parentElement.nextSibling.nextSibling;

    while (nxt_sib != null) {
      var tmp_idx = nxt_sib.id;

      nxt_sib.setAttribute("id", pre_idx);
      nxt_sib.firstChild.firstChild.textContent = "q_label_" + pre_idx + ": ";

      var child_count = nxt_sib.childElementCount;
      if (child_count == 6) {
        var child_list = nxt_sib.childNodes;
        var type = child_list[2].firstChild.value;

        child_list[5].setAttribute("id", type + "_" + pre_idx);

        var walk_child = child_list[5].firstElementChild;
        while (walk_child != null) {
          walk_child.childNodes[0].firstChild.textContent =
            type + "_" + pre_idx;

          walk_child.childNodes[1].firstChild.setAttribute(
            "name",
            type + "_" + pre_idx + "[]"
          );
          walk_child.childNodes[1].firstChild.setAttribute(
            "id",
            type + "_" + pre_idx + "[]"
          );

          walk_child = walk_child.nextSibling;
        }
      }

      pre_idx = tmp_idx;
      nxt_sib = nxt_sib.nextSibling.nextSibling;
    }

    e.target.parentElement.parentElement.nextSibling.remove();
    e.target.parentElement.parentElement.remove();

    questionCount--;
  } else if (e.target && e.target.id == "addMetaData") {
    var id = e.target.parentElement.parentElement.parentElement.id;

    var meta_div_tag = document.createElement("div");
    meta_div_tag.setAttribute("class", "row mb-4");

    meta_div_tag.appendChild(label_e(id));
    meta_div_tag.appendChild(input_e(id + "[]"));
    meta_div_tag.appendChild(addBtn_e());
    meta_div_tag.appendChild(rmBtn_e("rmMetaData"));

    var element = document.getElementById(id);
    element.appendChild(meta_div_tag);
  } else if (e.target && e.target.id == "rmMetaData") {
    var meta_count =
      e.target.parentElement.parentElement.parentElement.childElementCount;
    if (meta_count == 1) {
      e.target.parentElement.parentElement.parentElement.parentElement.childNodes[2].firstChild.selectedIndex = 0;
      e.target.parentElement.parentElement.parentElement.remove();
    } else {
      e.target.parentElement.parentElement.remove();
    }
  }
});

const addEvent = async () => {
  var poster_ref = null;

  if (imageFile != null) {
    poster_ref = "posters/" + title + "." + fileType;

    const imageRef = ref(storage, poster_ref);
    uploadBytes(imageRef, imageFile).then((snapshot) => {});
  }
  const docRef = await addDoc(collection(db, "events"), {
    created_date: serverTimestamp(),
    title: title,
    description: description,
    forms_types: types,
    forms_questions: questions,
    forms_meta_data: metaDatas,
    start_date: start_date,
    end_date: end_date,

    display_status: false,

    cmp_start_date: cmp_start_date,
    cmp_end_date: cmp_end_date,

    poster_ref: poster_ref,
  });

  relocatePage(true, "admin.home.html");
};

const addQuestion = async () => {
  question_e();
  questionCount++;
};

function question_e() {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("id", questionCount);
  div_tag.setAttribute("class", "row mb-4");

  var invalid_tag = document.createElement("div");
  invalid_tag.setAttribute("class", "invalid-feedback");
  var invalid_text = document.createTextNode("미입력");
  invalid_tag.appendChild(invalid_text);

  div_tag.appendChild(label_e("q_label_" + questionCount));
  div_tag.appendChild(input_e("questions[]"));
  div_tag.appendChild(dropDownSelection_e());
  div_tag.appendChild(rmBtn_e("removeQuestion"));
  div_tag.appendChild(invalid_tag);

  var element = document.getElementById("form_area");
  element.appendChild(div_tag);
  element.appendChild(hr_e());
}

function label_e(forText) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-2");

  var label_tag = document.createElement("label");
  label_tag.setAttribute("class", "form-label");
  var label_text = document.createTextNode(forText + ": ");
  label_tag.appendChild(label_text);

  div_tag.appendChild(label_tag);

  return div_tag;
}

function input_e(t_id) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-6");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("type", "text");
  input_tag.setAttribute("class", "form-control");
  input_tag.setAttribute("id", t_id);
  input_tag.setAttribute("name", t_id);
  input_tag.setAttribute("placeholder", "");
  input_tag.setAttribute("value", "");
  input_tag.setAttribute("required", "");

  div_tag.appendChild(input_tag);

  return div_tag;
}

function dropDownSelection_e() {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-2");

  var select_tag = document.createElement("select");
  select_tag.setAttribute("name", "selections[]");
  select_tag.setAttribute("id", "selections[]");
  select_tag.setAttribute("class", "form-select");
  select_tag.setAttribute("aria-label", "Default select example");

  var opt_text_tag = document.createElement("option");
  var opt_text_text = document.createTextNode("Text");
  opt_text_tag.setAttribute("value", "text");
  opt_text_tag.setAttribute("selected", "");
  opt_text_tag.appendChild(opt_text_text);

  var opt_radio_tag = document.createElement("option");
  var opt_radio_text = document.createTextNode("Radio");
  opt_radio_tag.setAttribute("value", "radio");
  opt_radio_tag.appendChild(opt_radio_text);

  var opt_check_tag = document.createElement("option");
  var opt_check_text = document.createTextNode("Check");
  opt_check_tag.setAttribute("value", "check");
  opt_check_tag.appendChild(opt_check_text);

  select_tag.appendChild(opt_text_tag);
  select_tag.appendChild(opt_radio_tag);
  select_tag.appendChild(opt_check_tag);

  div_tag.appendChild(select_tag);

  return div_tag;
}

function rmBtn_e(id) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-2");

  var rmBtn_tag = document.createElement("button");
  rmBtn_tag.setAttribute("id", id);
  rmBtn_tag.setAttribute("type", "button");
  rmBtn_tag.setAttribute("class", "btn btn-danger");
  rmBtn_tag.setAttribute("style", "width: 100%");
  var rmBtn_text = document.createTextNode("Remove");
  rmBtn_tag.appendChild(rmBtn_text);

  div_tag.appendChild(rmBtn_tag);

  return div_tag;
}

function hr_e() {
  var hr_tag = document.createElement("hr");
  hr_tag.setAttribute("class", "my-4");

  return hr_tag;
}

function metaData_e(type, q_id) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("id", type + "_" + q_id);

  var meta_div_tag = document.createElement("div");
  meta_div_tag.setAttribute("class", "row mb-4");

  meta_div_tag.appendChild(label_e(type + "_" + q_id));
  meta_div_tag.appendChild(input_e(type + "_" + q_id + "[]"));
  meta_div_tag.appendChild(addBtn_e());
  meta_div_tag.appendChild(rmBtn_e("rmMetaData"));

  div_tag.appendChild(meta_div_tag);

  var q_element = document.getElementById(q_id);
  q_element.appendChild(div_tag);
}

function addBtn_e() {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-2");

  var addBtn_tag = document.createElement("button");
  addBtn_tag.setAttribute("id", "addMetaData");
  addBtn_tag.setAttribute("type", "button");
  addBtn_tag.setAttribute("class", "btn btn-success");
  addBtn_tag.setAttribute("style", "width: 100%");
  var addBtn_text = document.createTextNode("add");
  addBtn_tag.appendChild(addBtn_text);

  div_tag.appendChild(addBtn_tag);

  return div_tag;
}
