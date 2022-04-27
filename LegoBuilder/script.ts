linkCanvas("renderingWindow");

const camera = new Camera();
camera.worldRotation = { x: -20, y: 20, z: 0 };
camera.updateRotationMatrix();
camera.zoom = 0.5;
camera.enableMovementControls("renderingWindow", true, true, true, true);



const grid = new LegoGrid();
grid.generateGrid(10, 40, 10); //width, height, depth (in blocks)

//Board scaled to fit the LegoGrid()
const legoBoard = new Box(grid.numOfColumns * Block.cellSize, grid.numOfLayers * Block.cellHeight, grid.numOfRows * Block.cellSize);
legoBoard.name = "board";
legoBoard.position.y += (grid.numOfLayers * Block.cellHeight) / 2
setColour(legoBoard, "#dbdbdb");
legoBoard.faces[0].colour = "";
legoBoard.faces[1].colour = "";
legoBoard.faces[4].colour = "";
legoBoard.faces[5].colour = "";
legoBoard.showOutline = true;

//creating the virtual grid lines, between each block
const increments = Block.cellSize;
const baseCorner = legoBoard.pointMatrix.getColumn(0);
const gridLinesStart = new matrix();
for (let i = 1; i != grid.numOfColumns; i += 1) {
    gridLinesStart.addColumn( [ baseCorner[0] + increments * i, 0, baseCorner[2] ] )
}
for (let i = 1; i != grid.numOfRows; i += 1) {
    gridLinesStart.addColumn( [ baseCorner[0], 0, baseCorner[2] + increments * i ] )
}

const furthestCorner = legoBoard.pointMatrix.getColumn(5);
const gridLinesEnd = new matrix();
for (let i = 1; i != grid.numOfColumns; i += 1) {
    gridLinesEnd.addColumn( [ furthestCorner[0] - ((grid.numOfColumns * Block.cellSize) - increments * i), 0, furthestCorner[2] ] )
}
for (let i = 1; i != grid.numOfRows; i += 1) {
    gridLinesEnd.addColumn( [ furthestCorner[0], 0, furthestCorner[2] - ((grid.numOfRows * Block.cellSize) - increments * i) ] )
}

const blockIndicator = new BlockIndicator();

let screenObjects: { object: Shape, screenPoints: matrix, center: number[]}[] = [];
setInterval(() => {

    clearCanvas();
    camera.renderGrid();
    screenObjects = camera.render([legoBoard]);
    const gridLinesStartTransformed = camera.transformMatrix(gridLinesStart, { x: 0, y: 0, z: 0 });
    const gridLinesEndTransformed = camera.transformMatrix(gridLinesEnd, { x: 0, y: 0, z: 0 });
    for (let i = 0; i != gridLinesStartTransformed.width; i += 1) {
        drawLine(gridLinesStartTransformed.getColumn(i), gridLinesEndTransformed.getColumn(i), "black");
    }

    camera.render(grid.blockModels
        .concat([blockIndicator.blockModel]));

    plotPoint([x, y], "lime"); //green dot represents where the browser thinks your mouse is

}, 16);

//show preview of where block will be placed, onmousemove()
let [x, y] = [0, 0];
document.onmousemove = ($e) => {
    //Chrome's Mouse position API is buggy
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY]

    if (screenObjects.length == 0) { return; }
    const mousePosition = grid.getPositionClicked(screenObjects, [x, y] )
    if (mousePosition == undefined) { blockIndicator.position = undefined; blockIndicator.blockModel.position.x = -1000000; return; };

    blockIndicator.position = mousePosition;
    blockIndicator.syncPosition(grid);
}

document.onclick = () => {
    if (blockIndicator.position == undefined) { return; }

    //Just place block where the block indicator is
    const newSingleBlock = new SingleBlock();
    grid.placeBlock(newSingleBlock, blockIndicator.position, 50);
}

document.onkeydown = () => { //just testing changing indicator's model dynamically
    blockIndicator.blockModel = generateBlockIndicatorModel( new DoubleBlockModel() );
}