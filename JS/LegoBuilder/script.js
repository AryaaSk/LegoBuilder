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
const blockIndicator = new BlockIndicator();
let screenObjects = [];
let outputScreenObjects = [];
setInterval(() => {
    clearCanvas();
    camera.renderGrid();
    screenObjects = camera.render([legoBoard]);
    screenObjects.concat(camera.render(grid.blockModels.concat([blockIndicator.blockModel])));
    outputScreenObjects = screenObjects;
}, 16);
//show preview of where block will be placed, onmousemove()
document.onmousemove = ($e) => {
    const mousePosition = grid.getPositionClicked(outputScreenObjects, [$e.clientX - canvasWidth / 2, canvasHeight / 2 - $e.clientY]);
    if (mousePosition == undefined) {
        blockIndicator.blockModel.position.y = 10000;
        return;
    }
    ;
    blockIndicator.position = mousePosition;
    blockIndicator.syncPosition(grid);
};
document.onclick = ($e) => {
    //Just place block where the block indicator is
    const newSingleBlock = new SingleBlock();
    grid.placeBlock(newSingleBlock, blockIndicator.position);
};
