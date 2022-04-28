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
const [gridLinesStart, gridLinesEnd] = grid.generateGridLines( legoBoard );

let boardPoints: matrix = new matrix();
setInterval(() => {

    clearCanvas();
    camera.renderGrid();
    boardPoints = camera.render([legoBoard])[0].screenPoints;

    const [ gridLinesStartTransformed, gridLinesEndTransformed ] = [camera.transformMatrix(gridLinesStart, { x: 0, y: 0, z: 0 }), camera.transformMatrix(gridLinesEnd, { x: 0, y: 0, z: 0 })];
    for (let i = 0; i != gridLinesStartTransformed.width; i += 1) {
        drawLine(gridLinesStartTransformed.getColumn(i), gridLinesEndTransformed.getColumn(i), "black");
    }

    camera.render(grid.blockModels.concat([blockIndicator.blockModel]));

    plotPoint([x, y], "lime"); //green dot represents where the browser thinks your mouse is

}, 16);




//Blocks
let currentBlockIndex = 0;
const blockIndicator = new BlockIndicator();
blockIndicator.blockModel = BlockIndicator.generateBlockIndicatorModel( availableBlocks[currentBlockIndex].blockModel.clone() );

//show preview of where block will be placed, onmousemove()
const updateBlockIndicatorPosition = (x: number, y: number) => {
    if (boardPoints.width == 0) { return; }
    const mousePosition = grid.getPositionClicked(boardPoints, [x, y] )
    if (mousePosition == undefined) { blockIndicator.position = undefined; blockIndicator.blockModel.position.x = -1000000; return; };

    blockIndicator.position = mousePosition;
    blockIndicator.syncPosition(grid);
}
const placeBlockAtIndicator = () => { //Just place block where the block indicator is
    if (blockIndicator.position == undefined) { return; }
    const newBlock = availableBlocks[currentBlockIndex].clone();
    grid.placeBlock(newBlock, blockIndicator.position, 50);
}

let [x, y] = [0, 0];
document.onmousemove = ($e) => {
    //Chrome's Mouse position API is buggy, watch the green dot, it doesn't follow the cursor
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY]
    updateBlockIndicatorPosition( x, y );
}

document.onclick = () => {
    placeBlockAtIndicator();
}

document.onkeydown = ($e) => {
    const key = $e.key.toLowerCase();
    if (key == "1") { currentBlockIndex = 0; }
    else if (key == "2") { currentBlockIndex = 1; }

    blockIndicator.blockModel = BlockIndicator.generateBlockIndicatorModel( availableBlocks[currentBlockIndex].blockModel.clone() );
    updateBlockIndicatorPosition( x, y );
}