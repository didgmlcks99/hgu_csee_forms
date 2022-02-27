import "./admin.set.css";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  relocatePage,
  getFooter,
  listenToNav,
  listenToLogout,
  resetBoard,
  btn_e,
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

    getUserStatTable();
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToProfile(e);

  if (e.target && e.target.id == "addNewUser") {
    var email_address = document.getElementById("emailAddress");
    checkEmail(true, true, true, email_address.value);
    email_address.value = "";
  } else if (e.target && e.target.id == "changeToAdmin") {
    checkEmail(
      true,
      true,
      false,
      e.target.parentElement.previousElementSibling.textContent
    );
  } else if (e.target && e.target.id == "changeToNon-Admin") {
    checkEmail(
      false,
      false,
      false,
      e.target.parentElement.previousElementSibling.textContent
    );
  }
});

function getUserStatTable() {
  const q = query(collection(db, "users"), orderBy("student_number"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("non-admins");
    resetBoard("admins");

    var non_admin_count = 1;
    var admin_count = 1;

    querySnapshot.forEach(async (user) => {
      var name = user.data().name;
      var email = user.data().email;
      var status = user.data().admin_status;

      if (status == true) {
        addRow("admins", name, email, admin_count);
        admin_count++;
      } else {
        addRow("non-admins", name, email, non_admin_count);
        non_admin_count++;
      }
    });
  });
}

const toAdminDoc = async (command, email) => {
  if (command == true) {
    const docRef = await addDoc(collection(db, "admins"), {
      admin_status: true,
      reg_date: serverTimestamp(),
      email: email,
    });
  } else {
    const q = query(collection(db, "admins"), where("email", "==", email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((adminDoc) => {
      deleteDoc(doc(db, "admins", adminDoc.id));
    });
  }
};

const toUserDoc = async (command, id) => {
  const userRef = doc(db, "users", id);

  if (command == true) {
    await updateDoc(userRef, {
      admin_status: true,
    });
  } else {
    await updateDoc(userRef, {
      admin_status: false,
    });
  }
};

const checkEmail = async (adminCommand, userCommand, nonCommand, email) => {
  if (nonCommand == true) {
    toAdminDoc(true, email);
  } else {
    const q = query(collection(db, "users"), where("email", "==", email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      if (adminCommand == true && userCommand == true) {
        toAdminDoc(true, email);
        toUserDoc(true, doc.id);
      } else if (adminCommand == false && userCommand == false) {
        toAdminDoc(false, email);
        toUserDoc(false, doc.id);
      }
    });
  }
};

function addRow(type, name, email, idx) {
  var tbody = document.getElementById(type);

  var tr_tag = document.createElement("tr");

  var idx_e = document.createElement("th");
  idx_e.setAttribute("scope", "row");
  var idx_text = document.createTextNode(idx);
  idx_e.appendChild(idx_text);

  var name_e = document.createElement("th");
  var name_text = document.createTextNode(name);
  name_e.appendChild(name_text);

  var email_e = document.createElement("th");
  var email_text = document.createTextNode(email);
  email_e.appendChild(email_text);

  var btn_col = document.createElement("th");
  btn_col.appendChild(btn_e(type, "변경"));

  tr_tag.appendChild(idx_e);
  tr_tag.appendChild(name_e);
  tr_tag.appendChild(email_e);
  tr_tag.appendChild(btn_col);

  tbody.appendChild(tr_tag);
}
