const xlims = [14.16, 14.6];
const ylims = [35.78, 36.1];

const ll_bl = [xlims[0], ylims[0]];

const ll_w = xlims[1] - xlims[0];
const ll_h = ylims[1] - ylims[0];

function normalizeLatLon(c) {
  // use prior knowledge that Malta coords must be within the specified range
  // return [x,y]

  let a = c[0];
  let b = c[1];

  if (a > xlims[0] && a < xlims[1]) {
    // a is x
    return [a, b];
  }
  // a is y
  return [b, a];
}

document.addEventListener("DOMContentLoaded", function () {
  const heatmapContainer = document.getElementById("heatmapContainer");
  const malta = heatmapContainer.children[0];

  if (malta.complete) {
    loadMap();
  } else {
    malta.addEventListener("load", loadMap);
    malta.addEventListener("error", function () {
      alert("Failed to load map!");
    });
  }

  function loadMap() {
    function globalToLocal(c) {
      // takes any coordinate and returns a local coordinate
      let coord = normalizeLatLon(c);

      let ratio = [
        (coord[0] - ll_bl[0]) / ll_w,
        1 - (coord[1] - ll_bl[1]) / ll_h, // local coords are defined with top-left being origin not bottom-left
      ];

      return [malta.width * ratio[0], malta.height * ratio[1]];
    }

    const comino = [36.01147, 14.336298];
    const comMap = globalToLocal(comino);

    const mqabba = [35.844057, 14.469791];
    const mqabbaMap = globalToLocal(mqabba);

    var config = {
      container: heatmapContainer,
      radius: 10,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75,
    };
    // create heatmap with configuration
    var heatmap = h337.create(config);

    heatmap.setData({
      max: 5,
      data: [
        { x: 34, y: 58, value: 2 },
        { x: 700, y: 635, value: 2 },
        { x: comMap[0], y: comMap[1], value: 5 },
        { x: mqabbaMap[0], y: mqabbaMap[1], value: 4 },
      ],
    });
  }
});
