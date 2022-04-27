linkCanvas("renderingWindow");

const camera = new Camera();
camera.worldRotation = { x: -20, y: 20, z: 0 };
camera.updateRotationMatrix();
camera.zoom = 0.5;
camera.enableMovementControls("renderingWindow", true, true, true, true);



const grid = new LegoGrid();
grid.generateGrid(40, 40, 40); //10 blocks wide, 10 blocks tall, 15 blocks deep

//Board scaled to fit the LegoGrid()
const legoBoard = new Box(grid.numOfColumns * Block.cellSize, grid.numOfLayers * Block.cellHeight, grid.numOfRows * Block.cellSize);
legoBoard.position.y += (grid.numOfLayers * Block.cellHeight) / 2
legoBoard.showOutline = true;
setColour(legoBoard, "#ff0000");
legoBoard.faces[0].colour = "";
legoBoard.faces[1].colour = "";
legoBoard.faces[4].colour = "";
legoBoard.faces[5].colour = "";
legoBoard.name = "board";

const blockIndicator = new BlockIndicator();

let screenObjects: { object: Shape, screenPoints: matrix, center: number[]}[] = [];
let outputScreenObjects: { object: Shape, screenPoints: matrix, center: number[]}[] = [];
setInterval(() => {

    clearCanvas();
    camera.renderGrid();
    screenObjects = camera.render([legoBoard]);
    screenObjects.concat(camera.render(grid.blockModels.concat([blockIndicator.blockModel])));
    outputScreenObjects = screenObjects;

    plotPoint([x, y], "lime"); //green dot represents where the browser thinks your mouse is

}, 16);

//show preview of where block will be placed, onmousemove()
let [x, y] = [0, 0];
document.onmousemove = ($e) => {
    //Chrome's Mouse position API is buggy
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY]

    const mousePosition = grid.getPositionClicked(outputScreenObjects, [x, y] )
    if (mousePosition == undefined) { blockIndicator.position = undefined; blockIndicator.blockModel.position.y = 10000; return; };

    blockIndicator.position = mousePosition;
    blockIndicator.syncPosition(grid);
}

document.onclick = ($e) => {
    if (blockIndicator.position == undefined) { return; }

    //Just place block where the block indicator is
    const newSingleBlock = new DoubleBlock();
    grid.placeBlock(newSingleBlock, blockIndicator.position);
}