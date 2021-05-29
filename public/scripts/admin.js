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

          // create the firestore backup button for main admin
          if (querySnapshot.docs[0].data().mainAdmin) {
            document
              .getElementById("firestoreDownload")
              .addEventListener("click", async () => {
                let collections = {};

                // iterate over collections
                for (const c of ["admins", "caches"]) {
                  let querySnapshot = await db.collection(c).get();

                  collections[c] = {};
                  for (var i = 0; i < querySnapshot.size; i++) {
                    collections[c][querySnapshot.docs[i].id] =
                      querySnapshot.docs[i].data();
                  }
                }

                // save
                let a = document.createElement("a");
                let file = new Blob([JSON.stringify(collections, null, 2)], {
                  type: "text/json",
                });
                a.href = URL.createObjectURL(file);
                a.download = "firestore_backup.json";
                a.click();
              });
          } else {
            document.getElementById("firestoreManagement").style.display =
              "none";
          }
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

  function editLoc(e) {
    console.log(e.target);

    let locID = e.target.getAttribute("loc-id");

    window.location = `/admin-edit?locID=${locID}`;
  }

  function makeLoc(locID, loc) {
    var btn = document.createElement("BUTTON");
    btn.type = "button";
    btn.classList.add("list-group-item");
    btn.classList.add("list-group-item-action");

    btn.innerHTML = loc.name;
    btn.setAttribute("loc-name", loc.name);
    btn.setAttribute("loc-id", locID);

    btn.addEventListener("click", editLoc);

    return btn;
  }

  var sortTimerID;

  function timedSort() {
    clearTimeout(sortTimerID);

    sortTimerID = setTimeout(() => {
      let locsContainer = document.getElementById("locsContainer").children[0];
      let locs = locsContainer.children;
      let locNames = [];

      // get all names
      for (var i = 0; i < locs.length; i++) {
        locNames.push(locs[i].getAttribute("loc-name"));
      }

      // order names
      locNames.sort(function (a, b) {
        return b.localeCompare(a);
      });

      // reorder divs
      for (var i = 0; i < locs.length; i++) {
        let currName = locNames.pop();
        for (var j = 0; j < locs.length; j++) {
          if (currName == locsContainer.children[j].getAttribute("loc-name")) {
            locsContainer.appendChild(locsContainer.children[j]);
            break;
          }
        }
      }
    }, 100);
  }

  function showAdminPanel() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("signOut").style.display = "inline-flex";

    // load map
    const heatmapContainer = document.getElementById("heatmapContainer");
    const malta = heatmapContainer.children[0];
    heatmap = initHeatmap(heatmapContainer, malta, 10, 1);

    // load admin form and viewer for uploading tasks
    var caches = db.collection("caches");

    // load locations
    const locsContainer = document.getElementById("locsContainer").children[0];
    var locsList = {};
    var firstAdd = true;

    caches.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let newButton = makeLoc(change.doc.id, change.doc.data());
          locsList[change.doc.id] = newButton;
          locsContainer.appendChild(newButton);
          if (!firstAdd) {
            alertMessage(
              `New location added: ${change.doc.data().name}`,
              "alert-success"
            );
          }

          timedSort();
        }
        if (change.type === "modified") {
          console.log("Modified location: ", change.doc.data());
          // TODO: replace current button

          timedSort();
        }
        if (change.type === "removed") {
          locsList[change.doc.id].remove();
          alertMessage(
            `Removed location: ${change.doc.data().name}`,
            "alert-warning"
          );
        }
      });
      firstAdd = false;
    });

    locInputForm = document.getElementById("locInputForm");

    var firstHint = document.getElementById("hint1");
    var locName = document.getElementById("locName");
    var latitude = document.getElementById("latitude");
    var longitude = document.getElementById("longitude");
    var tagTR = document.getElementById("tagTR");
    var tagHK = document.getElementById("tagHK");
    var tagMP = document.getElementById("tagMP");

    [tagTR, tagHK, tagMP].forEach((btn) => {
      btn.onclick = function (e) {
        e.preventDefault();

        let newStatus =
          e.currentTarget.getAttribute("status") == "active"
            ? "inactive"
            : "active";
        e.currentTarget.setAttribute("status", newStatus);
      };
    });

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

    // TODO: edit cache
    document
      .getElementById("locationPinButton")
      .addEventListener("click", (e) => {
        e.preventDefault();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            latitude.value = position.coords.latitude;
            longitude.value = position.coords.longitude; // TODO: add validation (min and max at 35.something, 14.something), optionally add image uploads

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
      if (locName.value) {
        let children = locInputForm.children;
        for (var i = 0; i < children.length; i++) {
          if (
            children[i].name &&
            children[i].name.includes("hint") &&
            children[i].value
          ) {
            hints.push(children[i].value);
            children[i].value = "";
          }
        }

        let latv = parseFloat(latitude.value);
        let lonv = parseFloat(longitude.value);
        let gp =
          latv && lonv ? new firebase.firestore.GeoPoint(latv, lonv) : null;

        let activeTags = [tagTR, tagHK, tagMP].map((btn) => {
          return btn.getAttribute("status") == "active";
        });
        let tagsList = ["tr", "hk", "mp"];

        let tags = [];

        for (var i = 0; i < tagsList.length; i++) {
          if (activeTags[i]) {
            tags.push(tagsList[i]);
          }
        }

        caches
          .add({
            name: locName.value,
            coordinates: gp,
            hints: hints,
            tags: tags,
          })
          .then((docRef) => {
            // alertMessage("Location added successfully.", "alert-success");
          })
          .catch((error) => {
            alertMessage("Unable to add location: " + error, "alert-error");
          });

        locName.value = "";
        latitude.value = "";
        longitude.value = "";
        [tagTR, tagHK, tagMP].forEach((btn) => {
          btn.setAttribute("status", "inactive");
        });
        // reset hint elements
        cleanHints();

        locName.classList.remove("invalidInput");
        latitude.classList.remove("invalidInput");
        longitude.classList.remove("invalidInput");
      } else {
        for (const elem of [locName]) {
          if (!elem.value) {
            elem.classList.add("invalidInput");
          } else {
            elem.classList.remove("invalidInput");
          }
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
