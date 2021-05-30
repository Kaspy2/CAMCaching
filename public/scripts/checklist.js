document.addEventListener("DOMContentLoaded", async function () {
  var db = firebase.firestore();

  var url = new URL(window.location.href);
  var cid = url.searchParams.get("cid");

  const preContainer = document.getElementById("mainContainer").children[0];
  var todoContainer = document.createElement("DIV");
  var doneContainer = document.createElement("DIV");
  todoContainer.id = "todoContainer";
  doneContainer.id = "doneContainer";

  function setPreMessage(msg) {
    preContainer.innerHTML = "<code>" + msg + "</code>";
  }

  function toggleLoc(e) {
    let loc = e.currentTarget;
    let locID = loc.getAttribute("loc-id");
    let container = e.currentTarget.parentElement;
    if (container.id == todoContainer.id) {
      // toggle in firestore
      db.collection("checklists")
        .doc(cid)
        .update({ checked: firebase.firestore.FieldValue.arrayUnion(locID) })
        .then(() => {
          doneContainer.appendChild(loc);
          sortChildren(doneContainer);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (container.id == doneContainer.id) {
      db.collection("checklists")
        .doc(cid)
        .update({ checked: firebase.firestore.FieldValue.arrayRemove(locID) })
        .then(() => {
          todoContainer.appendChild(loc);
          sortChildren(todoContainer);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function createLocCheck(locID, locName) {
    var btn = document.createElement("BUTTON");
    btn.type = "button";
    btn.classList.add("list-group-item");
    btn.classList.add("list-group-item-action");

    btn.innerHTML = locName;
    btn.setAttribute("loc-name", locName);
    btn.setAttribute("loc-id", locID);

    btn.addEventListener("click", toggleLoc);

    return btn;
  }

  function sortChildren(container) {
    let locs = container.children;
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
        if (currName == container.children[j].getAttribute("loc-name")) {
          container.appendChild(container.children[j]);
          break;
        }
      }
    }
  }

  if (!cid) {
    const loadChecklist = document.getElementById("loadChecklist");
    const createChecklist = document.getElementById("createChecklist");
    const checklistID = document.getElementById("checklistID");

    loadChecklist.onclick = function () {
      // get checklist id
      let cid = checklistID.value;
      if (cid) {
        window.location = `/checklist?cid=${cid}`;
      }
    };

    createChecklist.onclick = function () {
      // create checklist in firestore

      createChecklist.disabled = true;
      db.collection("checklists")
        .add({ checked: [] })
        .then((docRef) => {
          window.location = `/checklist?cid=${docRef.id}`;
        })
        .catch((err) => {
          setPreMessage("Unable to create a new checklist: " + err);
        });
    };
  } else {
    preContainer.innerHTML = "";
    preContainer.classList.add("wideContainer");
    preContainer.appendChild(todoContainer);
    preContainer.appendChild(doneContainer);

    // try to find in firestore
    var clist = await db.collection("checklists").doc(cid).get();

    if (!clist.exists) {
      setTimeout(() => {
        window.location = "/";
      }, 5000);
      setPreMessage(
        `Unable to find specified checklist.  Make sure ID is correct. [ID: ${cid}]`
      );
    } else {
      // checklist found
      var checked = clist.data().checked;

      // load locations
      var caches = await db.collection("caches").get();

      // we need a simple mapping: id -> [name, checked]
      caches.forEach((doc) => {
        let loc = createLocCheck(doc.id, doc.data().name);
        if (checked.includes(doc.id)) {
          doneContainer.appendChild(loc);
        } else {
          todoContainer.appendChild(loc);
        }
      });

      sortChildren(todoContainer);
      sortChildren(doneContainer);
    }
  }

  document.getElementById("share").onclick = function () {
    var inp = document.getElementById("hiddenInput");
    inp.value = window.location.href;
    
    inp.select();
    inp.setSelectionRange(0, 99999);

    document.execCommand("copy");

    let str1 = "Copied URL!";
    let str2 = "Share this checklist";
    let curr = document.getElementById("share").innerHTML;
    document.getElementById("share").innerHTML = curr.replace(str2, str1);

    setTimeout(() => {
      document.getElementById("share").innerHTML = curr.replace(str1, str2);
    }, 3000);
  };
});
