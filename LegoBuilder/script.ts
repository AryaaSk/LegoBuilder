//SETUPS
//ARYAA3D SETUP
const setupAryaa3D = () => {
    linkCanvas("renderingWindow");

    const camera = new Camera();
    camera.worldRotation = { x: -20, y: 20, z: 0 };
    camera.updateRotationMatrix();
    camera.zoom = 0.5;
    camera.enableMovementControls("renderingWindow", true, true, true, true);

    return [camera]
}

//LEGO SETUP
const setupBoard = ( grid: LegoGrid ) => {
    //Board scaled to fit the LegoGrid()
    const legoBoard = new Box(grid.numOfColumns * Block.cellSize, grid.numOfLayers * Block.cellHeight, grid.numOfRows * Block.cellSize);
    legoBoard.name = "board";
    legoBoard.position.y += (grid.numOfLayers * Block.cellHeight) / 2
    setColour(legoBoard, "");
    legoBoard.faces[3].colour = "#dbdbdb";
    legoBoard.showOutline = true;
    
    return [legoBoard];
}

//MAIN SETUP
const [camera] = setupAryaa3D();
const grid = new LegoGrid();
grid.generateGrid(10, 40, 10); //width, height, depth (in blocks)

const [legoBoard] = setupBoard( grid );

const [gridLinesStart, gridLinesEnd] = grid.generateGridLines( legoBoard ); //creating the virtual grid lines, between each block






//ANIMATION LOOP
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






//BLOCKS
let currentBlockIndex = 0;
const updateBlockIndicator = () => {
    blockIndicator.blockModel = BlockIndicator.generateBlockIndicatorModel( availableBlocks[currentBlockIndex].blockModel.clone() );
}
const blockIndicator = new BlockIndicator();
updateBlockIndicator();

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
    setColour(newBlock.blockModel, "#FED557"); //can change the colour of the blocks here

    try { grid.placeBlock(newBlock, blockIndicator.position, 50); }
    catch { console.log("Out of bounds") }
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






//BLOCK SELECTION
const initializeSelection = () => {
    const blockSelection = document.getElementById("blockSelection")!;

    blockSelection.innerHTML = `
    <h2><u> Select Block </u></h2>
    `;

    for (let i = 0; i != availableBlocks.length; i += 1) {
        const block = availableBlocks[i];
        blockSelection.innerHTML += `
        <input type="button" class="blockSelectionButton" value="${block.blockName}" id="selectBlock${String(i)}">
        <br>
        `
    }
}
const initalizeButtonListeners = () => {
    for (let i = 0; i != availableBlocks.length; i += 1) {
        document.getElementById("selectBlock" + String(i))!.onclick = () => {
            currentBlockIndex = i;
            updateBlockIndicator();
            updateBlockIndicatorPosition( x, y );
        }
    }
}

initializeSelection();
initalizeButtonListeners();