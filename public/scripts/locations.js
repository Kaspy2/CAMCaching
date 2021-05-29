document.addEventListener("DOMContentLoaded", function () {
  // var pastelColors = ["#D4F0F0", "#8FCACA", "#CCE2CB", "#B6CFB6", "#97C1A9"];
  // var pastelColors = ["#D5D6EA", "#F6F6EB", "#D7ECD9", "#F5D5CB", "#F6ECF5", "#F3DDF2"];
  var pastelColors = [
    "#D5D6EA",
    "#F6F6EB",
    "#D7ECD9",
    "#F5D5CB",
    "#F6ECF5",
    "#FFC8A2",
  ];
  var currIndex = pastelColors.length;
  function getNextPastelColor() {
    currIndex += 1;
    if (currIndex >= pastelColors.length) {
      currIndex = 0;
    }

    return pastelColors[currIndex];
  }

  function getRandomPastelColor() {
    let newIndex = Math.round(Math.random() * (pastelColors.length - 1));
    while (currIndex == newIndex) {
      newIndex = Math.round(Math.random() * (pastelColors.length - 1));
    }
    currIndex = newIndex;
    return pastelColors[currIndex];
  }

  function makeLoc(loc) {
    let locName = `<h4>${loc.name}</h4>`;

    let locHints = loc.hints.map((x) => `<p>${x}</p>`).join("");

    let locLink = loc.coordinates
      ? `<p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${loc.coordinates.latitude},${loc.coordinates.longitude}">Starting Point</a></p>`
      : "";

    let tagMapping = {
      tr: "tag_tr.svg",
      hk: "tag_hk.svg",
    };

    let locTags = loc.tags
      ? loc.tags
          .map((t) => `<img class="tag" src="imgs/${tagMapping[t]}" />`)
          .join("")
      : "";

    locTags = locTags == "" ? "" : "<p>" + locTags + "</p>";

    var newLoc = document.createElement("DIV");
    newLoc.classList.add("locationCard");
    newLoc.style.backgroundColor = getRandomPastelColor();

    newLoc.innerHTML = `${locName}${locHints}${locLink}${locTags}`;

    return newLoc;
  }

  var db = firebase.firestore();
  var caches = db.collection("caches");

  let locsContainer = document.getElementById("locsContainer");
  let locsList = [];

  caches.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let newLoc = makeLoc(doc.data());
      locsList.push(newLoc);
      locsContainer.appendChild(newLoc);
    });
  });

  function filterLocs(e) {
    let filterText = e.target.value.toLowerCase();

    for (var i = 0; i < locsList.length; i++) {
      if (
        locsList[i].innerText
          .replace("\n\nMaps", "")
          .toLowerCase()
          .includes(filterText)
      ) {
        locsList[i].classList.remove("hidden");
      } else {
        locsList[i].classList.add("hidden");
      }
    }
  }

  function genChecklist(e) {
    window.location = `/checklist`;
  }

  document.getElementById("filterText").addEventListener("input", filterLocs);
  document
    .getElementById("genChecklist")
    .addEventListener("click", genChecklist);
});
