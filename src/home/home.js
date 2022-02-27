import "./home.css";
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  relocatePage,
  getFooter,
  listenToLogout,
  listenToEventBtn,
  getCards,
  getOffCanvas,
  listenToProfile,
  listenToNav,
  getPage,
} from "../index.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    relocatePage(false, "");

    getPage();

    getOffCanvas();

    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());

    getCards(false);
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
