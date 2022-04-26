linkCanvas("renderingWindow");

const camera = new Camera();
camera.worldRotation = { x: -90, y: 0, z: 0 };
camera.updateRotationMatrix();
camera.enableMovementControls("renderingWindow", true, true, true, true);



const grid = new LegoGrid();
grid.generateGrid(10, 15, 10); //10 blocks wide, 15 blocks deep, 10 blocks tall

//Board scaled to fit the LegoGrid()
const legoBoard = new Box(grid.numOfColumns * Block.cellSize, 10, grid.numOfRows * Block.cellSize);
legoBoard.position.y -= 5;
legoBoard.showOutline = true;
setColour(legoBoard, "#ff0000");
legoBoard.name = "board";


const singleBlock = new SingleBlock();
grid.placeBlock(singleBlock, { layer: 0, row: 0, column: 0 });

const doubleBlock = new DoubleBlock();
grid.placeBlock(doubleBlock, { layer: 0, row: 2, column: 1 });

let screenObjects: { object: Shape, screenPoints: matrix, center: number[]}[] = [];
setInterval(() => {

    clearCanvas();
    camera.renderGrid();
    screenObjects = camera.render([legoBoard]);
    screenObjects.concat(camera.render(grid.blockModels));

}, 16);


screenObjects = camera.render([legoBoard]);
grid.findPositionClicked(screenObjects, { x: 0, y: 0 });

document.onclick = ($e) => {
}