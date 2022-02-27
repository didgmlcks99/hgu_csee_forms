import "./applied.css";

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
  getFooter,
  listenToNav,
  listenToLogout,
  resetBoard,
  th_e,
  getOffCanvas,
  listenToProfile,
  getPage,
} from "../index.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    getPage();

    getOffCanvas();

    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());

    getApplies();
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToProfile(e);
});

const getApplies = async () => {
  var q = query(
    collection(db, "applications"),
    where("uid", "==", auth.currentUser.uid)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("appliedEvents");

    var applied_count = 1;

    querySnapshot.forEach((applied) => {
      var event_id = applied.data().event_id;
      var title = applied.data().title;
      var name = applied.data().name;
      var student_number = applied.data().student_number;
      var email = applied.data().email;
      var reg_date = applied.data().reg_date;

      addApplied(
        applied_count,
        event_id,
        title,
        name,
        student_number,
        email,
        reg_date.toDate().toLocaleString()
      );
      applied_count++;
    });
  });
};

function addApplied(idx, event_id, title, name, student_number, email, date) {
  var tbody = document.getElementById("appliedEvents");

  var tr_tag = document.createElement("tr");
  tr_tag.setAttribute("id", event_id);

  tr_tag.appendChild(th_e(idx, "row"));
  tr_tag.appendChild(th_e(title, "row"));
  tr_tag.appendChild(th_e(name, "row"));
  tr_tag.appendChild(th_e(student_number, "row"));
  tr_tag.appendChild(th_e(email, "row"));
  tr_tag.appendChild(th_e(date, "row"));

  tbody.appendChild(tr_tag);
}
