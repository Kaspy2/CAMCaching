document.addEventListener("DOMContentLoaded", function () {
  function makeLoc(loc) {
    let locName = `<h4>${loc.name}</h4>`;

    let locHints = loc.hints.map((x) => `<p>${x}</p>`).join("");

    let locLink = loc.coordinates
      ? `<p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${loc.coordinates.latitude},${loc.coordinates.longitude}">Starting Point</a></p>`
      : "";

    console.log(loc.tags);

    let tagMapping = {
      tr: "tag_tr.svg",
      hk: "tag_hk.svg",
    };

    let locTags =
      "<p>" +
      (loc.tags
        ? loc.tags.map((t) => `<img class="tag" src="imgs/${tagMapping[t]}" />`).join("")
        : "") +
      "</p>";

    var newLoc = document.createElement("DIV");
    newLoc.classList.add("locationCard");

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

  document.getElementById("filterText").addEventListener("input", filterLocs);
});
