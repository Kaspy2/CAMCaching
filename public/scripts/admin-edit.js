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

  function triggerFocus(element) {
    var eventType = "onfocusin" in element ? "focusin" : "focus",
      bubbles = "onfocusin" in element,
      event;

    if ("createEvent" in document) {
      event = document.createEvent("Event");
      event.initEvent(eventType, bubbles, true);
    } else if ("Event" in window) {
      event = new Event(eventType, { bubbles: bubbles, cancelable: true });
    }

    element.focus();
    element.dispatchEvent(event);
  }

  function showModal(cacheID, deleting = false, data = null) {
    const changes = document.getElementById("changes");
    const confirmButton = document.getElementById("confirmButton");

    if (deleting) {
      // deleting

      changes.innerHTML = "";
      confirmButton.innerHTML = "Confirm deletion";

      confirmButton.onclick = function () {
        console.log("DELETE"); // TODO: this (show modal for confirmation, on confirm redirect)
        // TODO: maybe -> move deleted locs to another collection for record-keeping

        // // redirect to admin
        // window.location = "/admin";
      };
    } else {
      // changing
      let currData = data[0];
      let updatedData = data[1];

      let diff = Object.keys(updatedData).reduce((diff, key) => {
        if (JSON.stringify(currData[key]) === JSON.stringify(updatedData[key]))
          return diff;
        return [...diff, key];
      }, []);

      let changeString = "";
      let updatedFields = {};
      for (const change of diff) {
        changeString += `<div class="changeRow"><div class="oldVersion">${JSON.stringify(
          currData[change],
          null,
          2
        )}</div><div class="newVersion">${JSON.stringify(
          updatedData[change],
          null,
          2
        )}</div></div>`;

        updatedFields[change] = updatedData[change];
      }

      changes.innerHTML = changeString;
      confirmButton.innerHTML = "Confirm changes";

      confirmButton.onclick = function () {
        db.collection("caches")
          .doc(cacheID)
          .update(updatedFields)
          .then(() => {
            // redirect to admin
            window.location = "/admin";
          })
          .catch((error) => {
            alertMessage("Error updating document: " + error, "alert-error");
          });
      };
    }

    document.getElementById("changesModalBG").style.display = "block";
  }

  async function loadLocationData() {
    var url = new URL(window.location.href);
    var locID = url.searchParams.get("locID");

    var cache = await db.collection("caches").doc(locID).get();

    if (!cache.exists) {
      alertMessage("Unable to find location!", "alert-error");
      return;
    }

    let currData = cache.data();

    let locName = document.getElementById("locName");
    let firstHint = document.getElementById("hint1");
    let latitude = document.getElementById("latitude");
    let longitude = document.getElementById("longitude");
    let tagTR = document.getElementById("tagTR");
    let tagHK = document.getElementById("tagHK");
    let submitButton = document.getElementById("updateLoc");
    let deleteButton = document.getElementById("deleteLoc");

    locName.value = currData.name;
    if (currData.coordinates) {
      latitude.value = currData.coordinates.latitude;
      longitude.value = currData.coordinates.longitude;
    }

    let activeTags = ["tr", "hk"]
      .map((x, i) => {
        return currData.tags && currData.tags.includes(x) ? i : -1;
      })
      .filter((x) => x != -1);

    let tagsList = [tagTR, tagHK];
    for (const i of activeTags) {
      console.log(i);
      tagsList[i].setAttribute("status", "active");
    }

    let hintsElements = [];

    let lastHint = firstHint;
    for (var i = 0; i < currData.hints.length; i++) {
      triggerFocus(lastHint);
      lastHint.value = currData.hints[i];
      triggerFocus(locName);
      lastHint = lastHint.nextElementSibling;
      hintsElements.push(lastHint);
    }

    for (const elem of [
      locName,
      latitude,
      longitude,
      firstHint,
      tagTR,
      tagHK,
      submitButton,
      deleteButton,
      ...hintsElements,
    ]) {
      elem.disabled = false;
    }

    submitButton.addEventListener("click", (e) => {
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
          }
        }

        let latv = parseFloat(latitude.value);
        let lonv = parseFloat(longitude.value);
        let gp =
          latv && lonv ? new firebase.firestore.GeoPoint(latv, lonv) : null;

        let activeTags = [tagTR, tagHK].map((btn) => {
          return btn.getAttribute("status") == "active";
        });
        let tagsList = ["tr", "hk"];

        let tags = [];

        for (var i = 0; i < tagsList.length; i++) {
          if (activeTags[i]) {
            tags.push(tagsList[i]);
          }
        }

        locName.classList.remove("invalidInput");

        let updatedData = {
          name: locName.value,
          coordinates: gp,
          hints: hints,
          tags: tags,
        };

        showModal(locID, false, [currData, updatedData]);
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

    deleteButton.addEventListener("click", (e) => {
      e.preventDefault();
      showModal(locID, true);
    });
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

    locInputForm = document.getElementById("locInputForm");

    var firstHint = document.getElementById("hint1");
    var locName = document.getElementById("locName");
    var latitude = document.getElementById("latitude");
    var longitude = document.getElementById("longitude");
    var tagTR = document.getElementById("tagTR");
    var tagHK = document.getElementById("tagHK");

    [tagTR, tagHK].forEach((btn) => {
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

    document
      .getElementById("locationPinButton")
      .addEventListener("click", (e) => {
        e.preventDefault();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            latitude.value = position.coords.latitude;
            longitude.value = position.coords.longitude;

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

    // load location
    loadLocationData(heatmap).then(() => {
      let mapLoc = globalToLocal(malta, [latitude.value, longitude.value]);

      heatmap.setData({
        max: 1,
        data: [{ x: mapLoc[0], y: mapLoc[1], value: 1 }],
      });
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
