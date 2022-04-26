"use strict";
linkCanvas("renderingWindow");
const camera = new Camera();
camera.worldRotation = { x: -20, y: 20, z: 0 };
camera.updateRotationMatrix();
camera.enableMovementControls("renderingWindow", true, true, true, true);
const grid = new LegoGrid();
grid.generateGrid(10, 15, 10); //10 blocks wide, 15 blocks deep, 10 blocks tall
//Board scaled to fit the LegoGrid()
const legoBoard = new Box(grid.numOfColumns * Block.cellSize, grid.numOfLayers * Block.cellHeight, grid.numOfRows * Block.cellSize);
legoBoard.position.y += (grid.numOfLayers * Block.cellHeight) / 2;
legoBoard.showOutline = true;
setColour(legoBoard, "#ff0000");
legoBoard.faces[0].colour = "";
legoBoard.faces[1].colour = "";
legoBoard.faces[4].colour = "";
legoBoard.faces[5].colour = "";
legoBoard.name = "board";
const singleBlock = new SingleBlock();
grid.placeBlock(singleBlock, { layer: 0, row: 0, column: 0 });
const doubleBlock = new DoubleBlock();
grid.placeBlock(doubleBlock, { layer: 0, row: 2, column: 1 });
let screenObjects = [];
setInterval(() => {
    clearCanvas();
    camera.renderGrid();
    screenObjects = camera.render([legoBoard]);
    screenObjects.concat(camera.render(grid.blockModels));
    grid.findPositionClicked(screenObjects, { x: 0, y: 0 });
}, 16);
/*
screenObjects = camera.render([legoBoard]);
screenObjects.concat(camera.render(grid.blockModels));
*/
document.onclick = ($e) => {
};
