window.addEventListener("load", function () {
  var db = firebase.firestore();

  var signingOut = false;

  function signOut() {
    signingOut = true;
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        window.location.href = "/";
      })
      .catch((error) => {
        // An error happened.
        window.location.href = "/";
      });
  }

  function checkUser(u) {
    db.collection("admins")
      .where("email", "==", u.email)
      .where("uid", "==", u.uid)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size === 1) {
          console.log("Welcome admin!");

          // set icon
          document.getElementById("profileIcon").src = u.photoURL;
        } else {
          // sign the user out
          console.log("Bye imposter!");
          signOut();
        }
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (signingOut) return;
    if (user) {
      // user is signed in - check if is admin.
      checkUser(user);

      // show admin panel
      document.getElementById("adminPanel").style.opacity = 1;
    } else {
      // No user is signed in.

      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().languageCode = "en";

      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          //   /** @type {firebase.auth.OAuthCredential} */
          //   var credential = result.credential;
          //   // This gives you a Google Access Token. You can use it to access the Google API.
          //   var token = credential.accessToken;
          // The signed-in user info.
          //   user = result.user;
          //   checkUser(user);
        })
        .catch((error) => {
          alert(
            `Unable to sign in.  Error code: ${error.code} - ${error.message}.`
          );
          window.location.href = "/";
        });
    }
  });

  document.getElementById("signOut").addEventListener("click", signOut);
});
