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

function globalToLocal(imgElem, c) {
  // takes any coordinate and returns a local coordinate
  let coord = normalizeLatLon(c);

  let ratio = [
    (coord[0] - ll_bl[0]) / ll_w,
    1 - (coord[1] - ll_bl[1]) / ll_h, // local coords are defined with top-left being origin not bottom-left
  ];

  return [
    Math.round(imgElem.width * ratio[0]),
    Math.round(imgElem.height * ratio[1]),
  ];
}

function initHeatmap(
  container,
  img = null,
  radius = 10,
  maxOpacity = 0.5,
  minOpacity = 0,
  blur = 0.75
) {
  let imgElem = img == null ? container.children[0] : img;

  if (imgElem.complete) {
    let config = {
      container: container,
      radius: radius,
      maxOpacity: maxOpacity,
      minOpacity: minOpacity,
      blur: blur,
    };

    // create heatmap with configuration
    var heatmap = h337.create(config);

    return heatmap;
  } else {
    alert("Image not yet loaded!");
  }
}
