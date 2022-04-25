"use strict";
linkCanvas("renderingWindow");
const camera = new Camera();
camera.worldRotation = { x: -20, y: 20, z: 0 };
camera.updateRotationMatrix();
camera.enableMovementControls("renderingWindow", true, true, true, true);
//Objects
const boardSize = 1000;
const legoBoard = new Box(1000, 10, 1000);
legoBoard.position.y -= 5;
legoBoard.showOutline = true;
setColour(legoBoard, "#ff0000");
const numOfRowsColumns = 50;
const grid = new LegoGrid();
grid.generateGrid(numOfRowsColumns, numOfRowsColumns, 10); //50 blocks per row/column
Block.cellSize = 1000 / numOfRowsColumns;
for (let row = 0; row != 20; row += 1) {
    for (let column = 0; column != 20; column += 1) {
        const singleBlock = new SingleBlock();
        grid.placeBlock(singleBlock, { layer: 0, row: row, column: column });
    }
}
for (let row = 0; row != 10; row += 1) {
    for (let column = 0; column != 10; column += 1) {
        const singleBlock = new SingleBlock();
        grid.placeBlock(singleBlock, { layer: 1, row: row, column: column });
    }
}
setInterval(() => {
    clearCanvas();
    camera.render([legoBoard]);
    camera.renderGrid();
    camera.render(grid.blockModels);
}, 16);
