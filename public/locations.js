
var locations = [];

function stringCheck(s) {
    return (typeof s === 'string' || s instanceof String);
}

function makeLoc(loc) {
    let locName = `<h4>${loc.location}</h4>`;
    let locHints = "";

    if (stringCheck(loc.hint)) {
        locHints = `<p>${loc.hint}</p>`;
    }
    else {
        // list of hints
        locHints = loc.hint.map(x => `<p>${x}</p>`).join("")
    }

    let locLink = `<p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${loc.coordinates[0]},${loc.coordinates[1]}">Maps</a></p>`;

    return `<div class="locationCard">${locName}${locHints}${locLink}</div>`
}

function setLocs(locs) {
    let locsContainer = document.getElementById("locsContainer");

    locsContainer.innerHTML = "";
    if (locations.length == 0) { // if startup
        locations = locs;

        // replicate to increase
        for (var x = 0; x < 3; x++) {
            locations = [...locations, ...locations];
        }

        for (var i = 0; i < locations.length; i++) {
            locsContainer.innerHTML += makeLoc(locations[i]);
        }
    }
    else {
        for (var i = 0; i < locs.length; i++) {
            locsContainer.innerHTML += makeLoc(locs[i]);
        }
    }
}

function filterLocs(e) {
    let filterText = e.target.value;

    function checkLoc(l) {
        return (l.location.toLowerCase().includes(filterText) || (stringCheck(l.hint) ? l.hint : l.hint.join("")).toLowerCase().includes(filterText))
    }

    let filteredLocs = locations.filter(checkLoc);
    setLocs(filteredLocs);
}

document.addEventListener('DOMContentLoaded', function () {
    fetch("locs.json").then(response => response.json()).then(setLocs);

    document.getElementById("filterText").addEventListener('input', filterLocs)
});

