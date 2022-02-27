import "./signup.css";
import {
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  query,
  collection,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  db,
  relocatePage,
  alert,
  listenToAlert,
  getFooter,
} from "../index.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    var bottom = document.getElementById("bottom");
    bottom.appendChild(getFooter());
  } else {
    location.replace("login.html");
  }
});

const addNewUserBtn = document.querySelector("#addNewUser");

var email;
var regDate;
var uid;
var name;
var number;
var student_number;
var department;
var firstMajor;
var secondMajor;
var semCount;
var payment;
var agreement;
var admin_status;

const signIn = async () => {
  await setDoc(doc(db, "users", auth.currentUser.uid), {
    email: email,
    regDate: regDate,
    uid: uid,
    name: name,
    number: number,
    student_number: student_number,
    department: department,
    firstMajor: firstMajor,
    secondMajor: secondMajor,
    semCount: semCount,
    payment: payment,
    agreement: agreement,
    admin_status: false,
  });

  const q = query(collection(db, "admins"), where("email", "==", email));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (adminDoc) => {
    const userRef = doc(db, "users", auth.currentUser.uid);

    await updateDoc(userRef, {
      admin_status: true,
    });
  });

  relocatePage(false, "home.html");
};

document.addEventListener("click", (e) => {
  listenToAlert(e);
});

addNewUserBtn.addEventListener("click", () => {
  var forms = document.querySelector(".needs-validation");

  if (forms.checkValidity()) {
    setValue();

    if (agreement == "disagree") {
      alert("내용 동의해야 가입 가능합니다.", "danger");
    } else {
      signIn();
    }
  }
  forms.classList.add("was-validated");
});

const setValue = async () => {
  email = auth.currentUser.email;
  regDate = serverTimestamp();
  uid = auth.currentUser.uid;
  name = document.getElementById("name").value;
  number = document.getElementById("number").value;
  student_number = document.getElementById("student_number").value;
  department = document.getElementById("department").value;
  firstMajor = document.getElementById("firstMajor").value;
  secondMajor = document.getElementById("secondMajor").value;
  semCount = document.getElementById("semCount").value;
  payment = document.querySelector('input[name="payment"]:checked').id;
  agreement = document.querySelector('input[name="agreement"]:checked').id;
};
