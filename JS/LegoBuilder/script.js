"use strict";
linkCanvas("renderingWindow");
const camera = new Camera();
camera.worldRotation = { x: -20, y: 20, z: 0 };
camera.updateRotationMatrix();
camera.enableMovementControls("renderingWindow", true, true, true, true);
const grid = new LegoGrid();
grid.generateGrid(10, 15, 20); //10 blocks wide, 15 blocks deep, 20 blocks tall
//Board scaled to fit the LegoGrid()
const legoBoard = new Box(grid.numOfColumns * Block.cellSize, 10, grid.numOfRows * Block.cellSize);
legoBoard.position.y -= 5;
legoBoard.showOutline = true;
setColour(legoBoard, "#ff0000");
const singleBlock = new SingleBlock();
grid.placeBlock(singleBlock, { layer: 0, row: 0, column: 0 });
const singleBlock2 = new SingleBlock();
grid.placeBlock(singleBlock2, { layer: 19, row: 0, column: 0 });
setInterval(() => {
    clearCanvas();
    camera.render([legoBoard]);
    camera.renderGrid();
    camera.render(grid.blockModels);
}, 16);
