import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_SAt70x14CGe8DhzGyBfNm-V2rQ4wN1U",
  authDomain: "acme-explorer-d20ca.firebaseapp.com",
  projectId: "acme-explorer-d20ca",
  storageBucket: "acme-explorer-d20ca.appspot.com",
  messagingSenderId: "1076684851135",
  appId: "1:1076684851135:web:98c8e25266f9e6119ec30a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

export { auth, firebase };
