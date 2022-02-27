import "./admin.home.css";
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  relocatePage,
  getFooter,
  listenToNav,
  listenToLogout,
  listenToEventBtn,
  getCards,
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

    getCards(true);
  } else {
    location.replace("login.html");
  }
});

document.addEventListener("click", function (e) {
  listenToLogout(e);
  listenToNav(e);
  listenToEventBtn(e);
  listenToProfile(e);
});
