import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import {
  getFirestore,
  query,
  where,
  getDocs,
  collection,
  orderBy,
  onSnapshot,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const firebaseApp = initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
});

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export const relocatePage = async (state, page) => {
  var status = false;

  const q = query(
    collection(db, "admins"),
    where("email", "==", auth.currentUser.email)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    if (doc.data().email == auth.currentUser.email) {
      status = true;
    }
  });

  if (status == false && state == true) {
    location.replace("home.html");
  } else if (status == true && state == true && page != "") {
    location.replace(page);
  } else if (status == true && state == false) {
    location.replace("admin.home.html");
  } else if (status == false && page == "home.html") {
    location.replace(page);
  } else if (status == false && state == false && page != "") {
    location.replace(page);
  }
};

export const getPage = async () => {
  const docRef = doc(db, "users", auth.currentUser.uid);
  const docSnap = await getDoc(docRef);

  var state = false;
  if (docSnap.data().admin_status == true) {
    state = true;
  }

  var top = document.getElementById("top");
  top.appendChild(getHomeHeader(state));
  top.appendChild(getNavBar(state));

  var nameSpace = document.getElementById("userName");
  var name_text = document.createTextNode(
    "환영합니다, " + auth.currentUser.displayName + "!"
  );
  nameSpace.appendChild(name_text);
};

function getHomeHeader(admin_check) {
  var header_tag = document.createElement("header");
  header_tag.setAttribute("class", "blog-header py-3");

  header_tag.appendChild(comps_e(admin_check));

  return header_tag;
}

function comps_e(admin_check) {
  var comps_tag = document.createElement("div");
  comps_tag.setAttribute(
    "class",
    "row flex-nowrap justify-content-between align-items-center"
  );

  comps_tag.appendChild(name_e());
  comps_tag.appendChild(title_e(admin_check));
  comps_tag.appendChild(logout_e());

  return comps_tag;
}

function name_e() {
  var name_comp = document.createElement("div");
  name_comp.setAttribute("class", "col-4 pt-1");

  var name_tag = document.createElement("a");
  name_tag.setAttribute("id", "userName");
  name_tag.setAttribute("class", "link-secondary");
  name_tag.setAttribute("data-bs-toggle", "offcanvas");
  name_tag.setAttribute("href", "#offcanvasRight");
  name_tag.setAttribute("aria-controls", "offcanvasRight");
  name_tag.setAttribute("role", "button");

  name_comp.appendChild(name_tag);

  return name_comp;
}

function title_e(admin_check) {
  var title_comp = document.createElement("div");
  title_comp.setAttribute("class", "col-4 text-center");

  var title_tag = document.createElement("a");
  title_tag.setAttribute("class", "blog-header-logo text-dark");
  title_tag.setAttribute("href", "#");

  var title_text;
  if (admin_check == true) {
    title_text = document.createTextNode("HGU CSEE FORMS (ADMIN)");
  } else {
    title_text = document.createTextNode("HGU CSEE FORMS");
  }
  title_tag.appendChild(title_text);

  title_comp.appendChild(title_tag);

  return title_comp;
}

function logout_e() {
  var logout_comp = document.createElement("div");
  logout_comp.setAttribute(
    "class",
    "col-4 d-flex justify-content-end align-items-center"
  );

  var logout_tag = document.createElement("a");
  logout_tag.setAttribute("id", "logout");
  logout_tag.setAttribute("class", "btn btn-sm btn-outline-secondary");

  var logout_text = document.createTextNode("Logout");
  logout_tag.appendChild(logout_text);

  logout_comp.appendChild(logout_tag);

  return logout_comp;
}

function getNavBar(admin_check) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "nav-scroller py-1 mb-2");

  div_tag.appendChild(nav_e(admin_check));

  return div_tag;
}

function nav_e(state) {
  var nav_tag = document.createElement("nav");
  nav_tag.setAttribute("class", "nav d-flex justify-content-between");

  if (state == true) {
    nav_tag.appendChild(a_e("adminHomePage", "홈으로"));
    nav_tag.appendChild(a_e("makePage", "폼 제작"));
    nav_tag.appendChild(a_e("setPage", "사용자 관리"));
    nav_tag.appendChild(a_e("eventsPage", "이벤트 관리"));
    nav_tag.appendChild(a_e("statPage", "이벤트 현황"));
    nav_tag.appendChild(a_e("randPage", "랜던 당첨뽑기"));
    nav_tag.appendChild(a_e("adminAppliedPage", "나의 신청 현황"));
  } else {
    nav_tag.appendChild(a_e("homePage", "홈으로"));
    nav_tag.appendChild(a_e("appliedPage", "신청 현황"));
  }

  return nav_tag;
}

function a_e(a_id, a_intext) {
  var a_tag = document.createElement("a");
  a_tag.setAttribute("class", "p-2 link-secondary");
  a_tag.setAttribute("href", "#");
  a_tag.setAttribute("id", a_id);

  var a_text = document.createTextNode(a_intext);
  a_tag.appendChild(a_text);

  return a_tag;
}

export const getOffCanvas = async () => {
  const docRef = doc(db, "users", auth.currentUser.uid);
  const docSnap = await getDoc(docRef);

  var name = docSnap.data().name;
  var number = docSnap.data().number;
  var email = docSnap.data().email;
  var student_number = docSnap.data().student_number;
  var department = docSnap.data().department;
  var firstMajor = docSnap.data().firstMajor;
  var secondMajor = docSnap.data().secondMajor;
  var semCount = docSnap.data().semCount;
  var payment = docSnap.data().payment;

  var offCanvasArea = document.getElementById("offcanvasRight");

  offCanvasArea.appendChild(offCanvasHeader_e());
  offCanvasArea.appendChild(
    offCanvasBody_e(
      name,
      number,
      email,
      student_number,
      department,
      firstMajor,
      secondMajor,
      semCount,
      payment
    )
  );
};

function offCanvasHeader_e() {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "offcanvas-header");

  var h5_tag = document.createElement("h5");
  h5_tag.setAttribute("id", "offcanvasRightLabel");
  var h5_text = document.createTextNode(
    auth.currentUser.displayName + " 개인 정보"
  );
  h5_tag.appendChild(h5_text);

  var button_tag = document.createElement("button");
  button_tag.setAttribute("type", "button");
  button_tag.setAttribute("class", "btn-close text-reset");
  button_tag.setAttribute("data-bs-dismiss", "offcanvas");
  button_tag.setAttribute("aria-label", "Close");

  div_tag.appendChild(h5_tag);
  div_tag.appendChild(button_tag);

  return div_tag;
}

function offCanvasBody_e(
  name,
  number,
  email,
  student_number,
  department,
  firstMajor,
  secondMajor,
  semCount,
  payment
) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "offcanvas-body");

  div_tag.appendChild(profilePic_e());

  var br_tag = document.createElement("br");
  div_tag.appendChild(br_tag);

  var form_tag = document.createElement("form");
  form_tag.setAttribute("id", "form_area_profile");
  form_tag.setAttribute("class", "needs-validation");
  form_tag.setAttribute("novalidate", "");

  form_tag.appendChild(
    userInfo_e(
      name,
      number,
      email,
      student_number,
      department,
      firstMajor,
      secondMajor,
      semCount,
      payment
    )
  );
  div_tag.appendChild(form_tag);

  div_tag.appendChild(btn_e("editProfile", "정보 변경"));

  return div_tag;
}

function profilePic_e() {
  var img_tag = document.createElement("img");
  img_tag.setAttribute("src", auth.currentUser.photoURL);
  img_tag.setAttribute("class", "rounded mx-auto d-block");
  img_tag.setAttribute("alt", "profilePic");

  return img_tag;
}

function userInfo_e(
  name,
  number,
  email,
  student_number,
  department,
  firstMajor,
  secondMajor,
  semCount,
  payment
) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("id", "userInfoArea");

  div_tag.appendChild(info_e("name", "이름", name));
  div_tag.appendChild(info_e("number", "번호", number));
  div_tag.appendChild(info_e("email", "이메일", email));
  div_tag.appendChild(info_e("student_number", "학번", student_number));
  div_tag.appendChild(info_e("department", "학부", department));
  div_tag.appendChild(info_e("firstMajor", "1전공", firstMajor));
  div_tag.appendChild(info_e("secondMajor", "2전공", secondMajor));
  div_tag.appendChild(info_e("semCount", "학기수", semCount));
  div_tag.appendChild(info_e("payment", "학생경비", payment));

  return div_tag;
}

function info_e(id, label, info) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "row mb-2");

  div_tag.appendChild(label_e(label));

  if (id == "payment") {
    div_tag.appendChild(payment_area(id, info));
  } else if (id == "semCount") {
    div_tag.appendChild(semCount_area(id, info));
  } else {
    div_tag.appendChild(input_e(id, info));
  }

  return div_tag;
}

function label_e(forText) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-3");

  var label_tag = document.createElement("label");
  label_tag.setAttribute("class", "form-label");
  var label_text = document.createTextNode(forText + ": ");
  label_tag.appendChild(label_text);

  div_tag.appendChild(label_tag);

  return div_tag;
}

function input_e(t_id, value) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-9");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("type", "text");
  input_tag.setAttribute("class", "form-control");
  input_tag.setAttribute("id", t_id);
  input_tag.setAttribute("name", t_id);
  input_tag.setAttribute("placeholder", "");
  input_tag.setAttribute("value", value);

  if (t_id == "email") {
    input_tag.setAttribute("disabled", "");
  } else {
    input_tag.setAttribute("required", "");
  }

  div_tag.appendChild(input_tag);

  return div_tag;
}

function payment_area(id, info) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-9");

  var payment_state = false;

  if (info == "pay") {
    payment_state = true;
  }

  div_tag.appendChild(payment_e(id, payment_state, "pay", "납부"));
  div_tag.appendChild(payment_e(id, !payment_state, "Notpay", "미납"));

  return div_tag;
}

function payment_e(name, state, id, front) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check form-check-inline");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("class", "form-check-input");
  input_tag.setAttribute("type", "radio");
  input_tag.setAttribute("id", id);
  input_tag.setAttribute("value", id);
  input_tag.setAttribute("name", name);

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

  return div_tag;
}

function semCount_area(id, info) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col-md-9");

  var select_tag = document.createElement("select");
  select_tag.setAttribute("for", id);
  select_tag.setAttribute("id", id);
  select_tag.setAttribute("class", "form-select");

  var option_value;
  var option_text;
  var state = false;

  for (var i = 1; i < 10; i++) {
    if (i == 9) {
      option_value = i + " 이상";
      option_text = i + "학기 이상";
    } else {
      option_value = i;
      option_text = i + "학기";
    }

    if (option_value == info) {
      state = true;
    } else {
      state = false;
    }

    select_tag.appendChild(option_e(option_value, option_text, state));
  }

  div_tag.appendChild(select_tag);

  return div_tag;
}

function option_e(value, text, state) {
  var option_tag = document.createElement("option");
  option_tag.setAttribute("value", value);

  var option_text = document.createTextNode(text);
  option_tag.appendChild(option_text);

  if (state == true) {
    option_tag.setAttribute("selected", "");
  }

  return option_tag;
}

export function getFooter() {
  var div_tag = document.createElement("div");

  var p_tag = document.createElement("p");
  p_tag.setAttribute("class", "mb-1");

  var p_text = document.createTextNode("한동대학교 전산전자공학부 임원단");
  p_tag.appendChild(p_text);

  var ul_tag = document.createElement("ul");
  ul_tag.setAttribute("class", "list-inline");

  var li_tag = document.createElement("li");
  li_tag.setAttribute("class", "list-inline-item");

  var a_tag = document.createElement("a");
  a_tag.setAttribute("href", "#");

  var a_text = document.createTextNode("departmentinhgu.csee@gmail.com");
  a_tag.appendChild(a_text);

  li_tag.appendChild(a_tag);
  ul_tag.appendChild(li_tag);

  div_tag.appendChild(p_tag);
  div_tag.appendChild(ul_tag);

  return div_tag;
}

export function listenToProfile(e) {
  if (e.target && e.target.id == "editProfile") {
    var forms = document.querySelector("#form_area_profile");

    if (forms.checkValidity()) {
      editProfile();
    }

    forms.classList.add("was-validated");
  }
}

const editProfile = async () => {
  const docRef = doc(db, "users", auth.currentUser.uid);
  // const docSnap = await getDoc(docRef);

  await updateDoc(docRef, {
    name: document.getElementById("name").value,
    number: document.getElementById("number").value,
    student_number: document.getElementById("student_number").value,
    department: document.getElementById("department").value,
    firstMajor: document.getElementById("firstMajor").value,
    secondMajor: document.getElementById("secondMajor").value,
    semCount: document.getElementById("semCount").value,
    payment: document.querySelector('input[name="payment"]:checked').id,
  });
};

export function listenToNav(e) {
  if (e.target && e.target.id == "adminHomePage") {
    relocatePage(true, "admin.home.html");
  } else if (e.target && e.target.id == "makePage") {
    relocatePage(true, "admin.make.html");
  } else if (e.target && e.target.id == "setPage") {
    relocatePage(true, "admin.set.html");
  } else if (e.target && e.target.id == "statPage") {
    var selected_event = "all";
    sessionStorage.setItem("selected_event", selected_event);

    relocatePage(true, "admin.stat.html");
  } else if (e.target && e.target.id == "eventsPage") {
    relocatePage(true, "admin.events.html");
  } else if (e.target && e.target.id == "randPage") {
    var selected_event = "all";
    sessionStorage.setItem("selected_event", selected_event);

    relocatePage(true, "admin.rand.html");
  } else if (e.target && e.target.id == "adminAppliedPage") {
    relocatePage(true, "applied.html");
  } else if (e.target && e.target.id == "homePage") {
    relocatePage(false, "home.html");
  } else if (e.target && e.target.id == "appliedPage") {
    var admin_state = false;
    sessionStorage.setItem("admin_state", admin_state);

    relocatePage(false, "applied.html");
  }
}

export function listenToLogout(e) {
  if (e.target && e.target.id == "logout") {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          location.replace("login.html");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("not logged in");
    }
  }
}

export function listenToEventBtn(e) {
  if (e.target && e.target.id == "applyPage") {
    var selected_event = e.target.parentElement.id;
    sessionStorage.setItem("selected_event", selected_event);

    location.replace("apply.html");
  } else if (e.target && e.target.id == "eventStat") {
    var selected_event = e.target.parentElement.id;
    sessionStorage.setItem("selected_event", selected_event);

    relocatePage(true, "admin.stat.html");
  } else if (e.target && e.target.id == "randomPick") {
    var selected_event = e.target.parentElement.id;
    sessionStorage.setItem("selected_event", selected_event);

    relocatePage(true, "admin.rand.html");
  }
}

export function getCards(adminState) {
  const q = query(collection(db, "events"), orderBy("cmp_end_date"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("eventCards");

    querySnapshot.forEach((doc) => {
      var event_id = doc.id;
      var title = doc.data().title;

      var current_date = Timestamp.now().valueOf();

      var cmp_start_date = doc.data().cmp_start_date;
      var cmp_end_date = doc.data().cmp_end_date;

      var start_date = doc.data().start_date;
      var end_date = doc.data().end_date;

      var apply_ableness = false;
      if (current_date >= cmp_start_date && current_date <= cmp_end_date) {
        apply_ableness = true;
      }

      var display_status = doc.data().display_status;

      var poster_ref = doc.data().poster_ref;

      if (display_status == true) {
        addEventCard(
          event_id,
          title,
          apply_ableness,
          start_date.toDate().toLocaleString(),
          end_date.toDate().toLocaleString(),
          poster_ref,
          adminState
        );
      }
    });
  });

  editEventCard();
}

const editEventCard = async () => {
  const q = query(
    collection(db, "applications"),
    where("uid", "==", auth.currentUser.uid)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var btn_area = document.getElementById(doc.data().event_id);
      if (btn_area != null) {
        btn_area.firstChild.setAttribute("disabled", "");
      }
    });
  });
};

const addEventCard = async (
  event_id,
  title,
  apply_ableness,
  start_date,
  end_date,
  poster_ref,
  adminState
) => {
  var cardPack = document.getElementById("eventCards");
  cardPack.appendChild(
    eventCard(
      event_id,
      title,
      apply_ableness,
      start_date,
      end_date,
      poster_ref,
      adminState
    )
  );
};

function eventCard(
  event_id,
  title,
  apply_ableness,
  start_date,
  end_date,
  poster_ref,
  adminState
) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col");

  div_tag.appendChild(
    cardShadow(
      event_id,
      title,
      apply_ableness,
      start_date,
      end_date,
      poster_ref,
      adminState
    )
  );

  return div_tag;
}

function cardShadow(
  event_id,
  title,
  apply_ableness,
  start_date,
  end_date,
  poster_ref,
  adminState
) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "card shadow-sm");

  div_tag.appendChild(cardPlaceHolder(poster_ref));
  div_tag.appendChild(
    cardBody(event_id, title, apply_ableness, start_date, end_date, adminState)
  );

  return div_tag;
}

function cardPlaceHolder(poster_ref) {
  var svg_tag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg_tag.setAttribute("class", "bd-placeholder-img card-img-top");
  svg_tag.setAttribute("width", "100%");
  svg_tag.setAttribute("height", "225");
  svg_tag.setAttribute("role", "img");
  svg_tag.setAttribute("aria-label", "Placeholder: Thumbnail");
  svg_tag.setAttributeNS(null, "preserveAspectRatio", "xMidYMid slice");
  svg_tag.setAttribute("focusable", "false");

  var title_tag = document.createElement("title");
  var title_text = document.createTextNode("Placeholder");
  title_tag.appendChild(title_text);

  var rect_tag = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect_tag.setAttribute("width", "100%");
  rect_tag.setAttribute("height", "100%");
  rect_tag.setAttribute("fill", "#55595c");

  var img_tag = document.createElementNS("http://www.w3.org/2000/svg", "image");
  img_tag.setAttribute("width", "100%");
  img_tag.setAttribute("height", "100%");

  if (poster_ref != null) {
    getDownloadURL(ref(storage, poster_ref)).then((url) => {
      img_tag.setAttribute("href", url);
    });
  } else {
    img_tag.setAttribute(
      "href",
      "https://firebasestorage.googleapis.com/v0/b/handong-csee.appspot.com/o/posters%2Fdefault_poster.png?alt=media&token=7419c534-3140-4232-bc82-6f75e4f69a36"
    );
  }

  var text_tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text_tag.setAttribute("x", "50%");
  text_tag.setAttribute("y", "50%");
  text_tag.setAttribute("fill", "#eceeef");
  text_tag.setAttribute("dy", ".3em");
  var text_text = document.createTextNode("Thumbnail");
  text_tag.appendChild(text_text);

  svg_tag.appendChild(title_tag);
  svg_tag.appendChild(rect_tag);
  svg_tag.appendChild(img_tag);
  // svg_tag.appendChild(text_tag);

  return svg_tag;
}

function cardBody(
  event_id,
  title,
  apply_ableness,
  start_date,
  end_date,
  adminState
) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "card-body");

  div_tag.appendChild(stat_area(title, apply_ableness));
  div_tag.appendChild(date_area(start_date, end_date));
  div_tag.appendChild(btn_area(event_id, apply_ableness, adminState));

  return div_tag;
}

function stat_area(title, apply_ableness) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "row mb-2");

  var p_tag = document.createElement("a");
  p_tag.setAttribute("class", "card-text col-md-10");
  var p_text = document.createTextNode(title);
  p_tag.appendChild(p_text);

  var span_tag = document.createElement("span");
  if (apply_ableness == true) {
    span_tag.setAttribute("class", "badge rounded-pill bg-success col-md-2");
    var span_text = document.createTextNode("온라인");
    span_tag.appendChild(span_text);
  } else {
    span_tag.setAttribute("class", "badge rounded-pill bg-danger col-md-2");
    var span_text = document.createTextNode("오프라인");
    span_tag.appendChild(span_text);
  }

  div_tag.appendChild(p_tag);
  div_tag.appendChild(span_tag);

  return div_tag;
}

function date_area(start_date, end_date) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "col");

  var start_area = document.createElement("div");
  start_area.setAttribute("class", "row");

  var start_tag = document.createElement("small");
  start_tag.setAttribute("class", "text-muted");
  var start_text = document.createTextNode("시작일: " + start_date);
  start_tag.appendChild(start_text);

  var end_area = document.createElement("div");
  end_area.setAttribute("class", "row");

  var end_tag = document.createElement("small");
  end_tag.setAttribute("class", "text-muted");
  var end_text = document.createTextNode("종료일: " + end_date);
  end_tag.appendChild(end_text);

  start_area.append(start_tag);
  end_area.append(end_tag);

  div_tag.appendChild(start_area);
  div_tag.appendChild(end_area);

  return div_tag;
}

function btn_area(event_id, apply_ableness, adminState) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute(
    "class",
    "d-flex justify-content-between align-items-center"
  );

  div_tag.appendChild(btn_group(event_id, apply_ableness, adminState));

  return div_tag;
}

function btn_group(event_id, apply_ableness, adminState) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "btn-group");
  div_tag.setAttribute("id", event_id);

  if (adminState == true) {
    div_tag.appendChild(btn(apply_ableness, "applyPage", "신청"));
    div_tag.appendChild(btn(true, "eventStat", "가입 현황"));
    div_tag.appendChild(btn(true, "randomPick", "랜덤"));
  } else {
    div_tag.appendChild(btn(apply_ableness, "applyPage", "신청"));
  }

  return div_tag;
}

function btn(apply_ableness, id, name) {
  var btn_tag = document.createElement("button");
  btn_tag.setAttribute("type", "button");
  btn_tag.setAttribute("class", "btn btn-sm btn-secondary");
  btn_tag.setAttribute("id", id);

  if (apply_ableness == false) {
    btn_tag.setAttribute("disabled", "");
  }

  var btn_text = document.createTextNode(name);
  btn_tag.appendChild(btn_text);

  return btn_tag;
}

export function resetBoard(id) {
  var body = document.getElementById(id);
  while (body.lastChild) {
    body.removeChild(body.lastChild);
  }
}

export function th_e(val, scope) {
  var th_tag = document.createElement("th");
  th_tag.setAttribute("scope", scope);

  var th_text = document.createTextNode(val);
  th_tag.appendChild(th_text);

  return th_tag;
}

export function btn_e(type, value) {
  var btn_e = document.createElement("button");
  btn_e.setAttribute("type", "button");
  var btn_text = document.createTextNode(value);
  btn_e.appendChild(btn_text);

  if (type == "non-admins") {
    btn_e.setAttribute("class", "btn btn-success");
    btn_e.setAttribute("id", "changeToAdmin");
  } else if (type == "admins") {
    btn_e.setAttribute("class", "btn btn-danger");
    btn_e.setAttribute("id", "changeToNon-Admin");
  } else if (type == "edit") {
    btn_e.setAttribute("class", "btn btn-primary");
    btn_e.setAttribute("id", "editEvent");
  } else if (type == "delete") {
    btn_e.setAttribute("class", "btn btn-danger");
    btn_e.setAttribute("id", "deleteEvent");
  } else if (type == "apply") {
    btn_e.setAttribute("class", "btn btn-success");
    btn_e.setAttribute("id", "applyEvent");
  } else if (type == "editProfile") {
    btn_e.setAttribute("class", "btn btn-success");
    btn_e.setAttribute("id", "editProfile");
  }

  return btn_e;
}

export function alert(message, type) {
  var alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  var wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<div class="alert alert-' +
    type +
    ' alert-dismissible fade show" role="alert">' +
    message +
    '<button id="closeAlert" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';

  if (alertPlaceholder.childElementCount == 0) {
    alertPlaceholder.append(wrapper);
  }
}

export function listenToAlert(e) {
  if (e.target && e.target.id == "closeAlert") {
    e.target.parentElement.parentElement.remove();
  }
}
