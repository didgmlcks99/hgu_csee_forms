import "./login.css";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db, getFooter } from "../index.js";

const googleLogInBtn = document.querySelector("#googleLogIn");

const provider = new GoogleAuthProvider();

var bottom = document.getElementById("bottom");
bottom.appendChild(getFooter());

const addUser = async () => {
  if (auth.currentUser) {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().admin_status == true) {
        location.replace("admin.home.html");
      } else {
        location.replace("home.html");
      }
    } else {
      location.replace("signup.html");
    }
  }
};

const googleLogin = async () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
};
googleLogInBtn.addEventListener("click", () => {
  googleLogin();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      addUser();
    } else {
      console.log("user not siged in");
    }
  });
});
