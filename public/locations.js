
function makeLoc(loc) {
    return `<li>${loc.location}, ${loc.hint} at ${loc.coordinates[0]},${loc.coordinates[1]}</li>`
}

function setLocs(locs) {
    const locsContainer = document.getElementById("locsContainer");

    for (var i = 0; i < locs.length; i++) {
        locsContainer.innerHTML += makeLoc(locs[i]);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetch("locs.json").then(response => response.json()).then(setLocs);
});

