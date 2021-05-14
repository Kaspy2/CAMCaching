document.addEventListener("DOMContentLoaded", function () {
  const heatmapContainer = document.getElementById("heatmapContainer");
  const malta = heatmapContainer.children[0];

  if (malta.complete) {
    loadData();
  } else {
    malta.addEventListener("load", loadData);
    malta.addEventListener("error", function () {
      alert("Failed to load map!");
    });
  }

  function loadData() {
    var heatmap = initHeatmap(heatmapContainer);

    const comino = [36.01147, 14.336298];
    const comMap = globalToLocal(malta, comino);

    const mqabba = [35.844057, 14.469791];
    const mqabbaMap = globalToLocal(malta, mqabba);

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
