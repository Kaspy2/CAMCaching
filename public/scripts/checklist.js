document.addEventListener("DOMContentLoaded", async function () {
  var db = firebase.firestore();
  var caches = db.collection("caches");

  function setPreMessage(msg) {
    document.getElementById("mainContainer").children[0].innerHTML = msg;
  }

  //   let locsList = [];

  //   caches.get().then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       let newLoc = makeLoc(doc.data());
  //       locsList.push(newLoc);
  //     });
  //   });

  var url = new URL(window.location.href);
  var cid = url.searchParams.get("cid");

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
    console.log(cid);
  }
  return;

  // try to find in firestore
  var clist = await db.collection("checklists").doc(cid).get();

  if (!clist.exists) {
    setTimeout(() => {
      window.location = "/";
    }, 5000);
  } else {
  }
});
