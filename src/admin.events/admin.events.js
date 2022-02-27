import "./admin.events.css";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  where,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

import {
  auth,
  db,
  storage,
  relocatePage,
  getFooter,
  listenToNav,
  listenToLogout,
  resetBoard,
  th_e,
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

    getEvents();
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToProfile(e);

  if (e.target && e.target.id == "applyEvent") {
    var selected_event = e.target.parentElement.parentElement.id;
    sessionStorage.setItem("selected_event", selected_event);

    location.replace("apply.html");
  } else if (e.target && e.target.id == "editEvent") {
    console.log("edit");
  } else if (e.target && e.target.id == "deleteEvent") {
    deleteEvent(e.target.parentElement.parentElement.id);
  }
});

document.addEventListener("change", function (e) {
  if (e.target && e.target.type == "checkbox") {
    var event_id = e.target.parentElement.parentElement.parentElement.id;

    editEventDisplayStatus(event_id);
  }
});

const getEvents = async () => {
  var q = query(collection(db, "events"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    resetBoard("eventsTable");

    var events_count = 1;

    querySnapshot.forEach((event) => {
      var event_id = event.id;
      var title = event.data().title;
      var created_date = event.data().created_date;
      var display_status = event.data().display_status;

      addEvent(
        events_count,
        event_id,
        title,
        created_date.toDate().toLocaleString(),
        display_status
      );
      events_count++;
    });
  });
};

function addEvent(idx, event_id, title, date, display_status) {
  var tbody = document.getElementById("eventsTable");

  var tr_tag = document.createElement("tr");
  tr_tag.setAttribute("id", event_id);

  tr_tag.appendChild(th_e(idx, "row"));
  tr_tag.appendChild(th_e(title, "row"));
  tr_tag.appendChild(th_e(date, "row"));

  var apply_btn = document.createElement("th");
  apply_btn.setAttribute("scope", "row");
  apply_btn.appendChild(btn_e("apply", "신청"));

  var edit_btn = document.createElement("th");
  edit_btn.setAttribute("scope", "row");
  edit_btn.appendChild(btn_e("edit", "수정"));

  var del_btn = document.createElement("th");
  del_btn.setAttribute("scope", "row");
  del_btn.appendChild(btn_e("delete", "삭제"));

  var switch_tag = document.createElement("th");
  switch_tag.setAttribute("scope", "row");
  switch_tag.appendChild(switch_e(display_status));

  tr_tag.appendChild(apply_btn);
  tr_tag.appendChild(edit_btn);
  tr_tag.appendChild(del_btn);
  tr_tag.appendChild(switch_tag);

  tbody.appendChild(tr_tag);
}

function switch_e(display_status) {
  var div_tag = document.createElement("div");
  div_tag.setAttribute("class", "form-check form-switch");

  var input_tag = document.createElement("input");
  input_tag.setAttribute("class", "form-check-input");
  input_tag.setAttribute("type", "checkbox");

  if (display_status == true) {
    input_tag.setAttribute("checked", "");
  }

  div_tag.appendChild(input_tag);

  return div_tag;
}

const editEventDisplayStatus = async (event_id) => {
  const docRef = doc(db, "events", event_id);
  const docSnap = await getDoc(docRef);

  if (docSnap.data().display_status == true) {
    await updateDoc(docRef, {
      display_status: false,
    });
  } else {
    await updateDoc(docRef, {
      display_status: true,
    });
  }
};

const deleteEvent = async (event_id) => {
  const docRef = doc(db, "events", event_id);
  const docSnap = await getDoc(docRef);

  var poster_ref = docSnap.data().poster_ref;
  if (poster_ref != null) {
    const imgRef = ref(storage, poster_ref);
    deleteObject(imgRef);
  }
  
  await deleteDoc(doc(db, "events", event_id));

  var q = query(
    collection(db, "applications"),
    where("event_id", "==", event_id)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach(async (event) => {
      await deleteDoc(doc(db, "applications", event.id));
    });
  });
};
