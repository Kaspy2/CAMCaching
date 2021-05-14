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
          alertMessage("Bye imposter!", "alert-error");
          signOut();
        }
      })
      .catch((error) => {
        alertMessage("Error getting documents: " + error, "alert-error");
      });
  }

  function showAdminPanel() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("signOut").style.display = "inline-block";

    // load map
    const heatmapContainer = document.getElementById("heatmapContainer");
    const malta = heatmapContainer.children[0];
    heatmap = initHeatmap(heatmapContainer, malta, 10, 1);

    // load admin form and viewer for uploading tasks
    var caches = db.collection("caches");

    caches.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " = ", doc.data());
      });
    });

    locInputForm = document.getElementById("locInputForm");

    var firstHint = document.getElementById("hint1"); // TODO: hint addition with `locInputForm.children['locName'].insertAdjacentHTML("afterend","test3")`
    var locName = document.getElementById("locName");
    var latitude = document.getElementById("latitude");
    var longitude = document.getElementById("longitude");
    var challenge = document.getElementById("challenge");

    function addHint(e) {
      let oldHint = e.target.name;
      let newHint = `hint${parseInt(oldHint.replace("hint", "")) + 1}`;
      if (!document.getElementById(newHint)) {
        e.target.insertAdjacentHTML(
          "afterend",
          e.target.outerHTML.replaceAll(oldHint, newHint)
        );
        document.getElementById(newHint).addEventListener("focus", addHint);
        document
          .getElementById(newHint)
          .addEventListener("focusout", cleanHints);
      }
    }

    function cleanHints(e) {
      let hints = [];
      let hintElements = [];
      let children = locInputForm.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].name && children[i].name.includes("hint")) {
          if (children[i].value != "") hints.push(children[i].value);
          hintElements.push(children[i]);
        }
      }

      for (var i = 0; i < hints.length; i++) {
        hintElements[i].value = hints[i];
      }

      hintElements[hints.length].value = "";

      for (var i = hints.length + 1; i < hintElements.length; i++) {
        hintElements[i].remove();
      }
    }

    firstHint.addEventListener("focus", addHint);
    firstHint.addEventListener("focusout", cleanHints);

    // TODO: display caches and make a cache form for creating new caches, editing, approximate location display on map
    document
      .getElementById("locationPinButton")
      .addEventListener("click", (e) => {
        e.preventDefault();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            latitude.value = position.coords.latitude;
            longitude.value = position.coords.longitude; // TODO: display on map, add validation (min and max at 35.something, 14.something), optionally add image uploads

            let mapLoc = globalToLocal(malta, [
              position.coords.latitude,
              position.coords.longitude,
            ]);

            heatmap.setData({
              max: 1,
              data: [{ x: mapLoc[0], y: mapLoc[1], value: 1 }],
            });
          });
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      });

    document.getElementById("addLoc").addEventListener("click", (e) => {
      e.preventDefault();

      let hints = [];
      if (locName.value != "" && latitude.value && longitude.value) {
        let children = locInputForm.children;
        for (var i = 0; i < children.length; i++) {
          if (
            children[i].name &&
            children[i].name.includes("hint") &&
            children[i].value != ""
          ) {
            hints.push(children[i].value);
            children[i].value = "";
          }
        }

        caches
          .add({
            name: locName.value,
            coordinates: new firebase.firestore.GeoPoint(
              parseFloat(latitude.value),
              parseFloat(longitude.value)
            ),
            hints: hints,
            challenge: challenge.value,
          })
          .then((docRef) => {
            alertMessage("Location added successfully.", "alert-success");
          })
          .catch((error) => {
            alertMessage("Unable to add location: " + error, "alert-error");
          });

        locName.value = "";
        latitude.value = "";
        longitude.value = "";
        challenge.value = "";
        // reset hint elements
        cleanHints();

        locName.classList.remove("invalidInput");
        latitude.classList.remove("invalidInput");
        longitude.classList.remove("invalidInput");
      } else {
        if (locName.value == "") {
          locName.classList.add("invalidInput");
        } else {
          locName.classList.remove("invalidInput");
        }
        if (!latitude.value) {
          latitude.classList.add("invalidInput");
        } else {
          latitude.classList.remove("invalidInput");
        }
        if (!longitude.value) {
          longitude.classList.add("invalidInput");
        } else {
          longitude.classList.remove("invalidInput");
        }
      }
    });
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (signingOut) return;
    if (user) {
      // user is signed in - check if is admin.
      checkUser(user);

      // show admin panel
      showAdminPanel();
    } else {
      // No user is signed in.

      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().languageCode = "en";

      firebase
        .auth()
        .signInWithRedirect(provider)
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
          alertMessage("Unable to sign in", "alert-error");
          window.location.href = "/";
        });
    }
  });

  document.getElementById("signOut").addEventListener("click", signOut);

  function alertMessage(msg, type = "alert-error") {
    document.getElementById("alerterMessage").innerHTML = msg;
    document.getElementById("alerter").classList.value = "";
    document.getElementById("alerter").classList.add(type);

    setTimeout(() => {
      document.getElementById("alerter").classList.add("hidden");
    }, 3000);
  }
});
