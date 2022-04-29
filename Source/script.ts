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
    legoBoard.showOutline();
    
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

    boardPoints = camera.render([legoBoard])[0].screenPoints;

    const [ gridLinesStartTransformed, gridLinesEndTransformed ] = [camera.transformMatrix(gridLinesStart, { x: 0, y: 0, z: 0 }), camera.transformMatrix(gridLinesEnd, { x: 0, y: 0, z: 0 })];
    for (let i = 0; i != gridLinesStartTransformed.width; i += 1) {
        drawLine(gridLinesStartTransformed.getColumn(i), gridLinesEndTransformed.getColumn(i), "black");
    }

    camera.render(grid.blockModels.concat([blockIndicator.blockModel]));

    //plotPoint([x, y], "lime"); //green dot represents where the browser thinks your mouse is, to prove that the Macos Chrome Mouse API is buggy
}, 16);






//BLOCKS
let currentBlockIndex = 0; //index in availableBlocks
let currentBlockColourIndex = 0;
let currentRotation: 0 | 90 | 180 | 270 = 0;
const updateBlockIndicator = () => {
    if (currentBlockIndex == -1) { //block indicator is hidden
        setColour(blockIndicator.blockModel, "");
        return;
    }
    blockIndicator.blockModel = BlockIndicator.generateBlockIndicatorModel( availableBlocks[currentBlockIndex].blockModel.clone() );
    blockIndicator.blockModel.name = "indicator"

    const indicatorColour = availableColours[currentBlockColourIndex] + "60"; //opacity value
    setColour(blockIndicator.blockModel, indicatorColour)
}
const blockIndicator = new BlockIndicator();
blockIndicator.blockModel.name = "indicator";
updateBlockIndicator();

//show preview of where block will be placed, onmousemove()
const updateBlockIndicatorPosition = (x: number, y: number) => {
    if (boardPoints.width == 0 || currentBlockIndex == -1) { return; }

    const mousePosition = grid.getPositionClicked(boardPoints, [x, y] )
    if (mousePosition == undefined) { blockIndicator.position = undefined; blockIndicator.blockModel.position.x = -1000000; return; };

    blockIndicator.position = mousePosition;
    blockIndicator.syncPosition(grid, currentRotation);
}
const rotateIndicator = () => {
    currentRotation += 90;
    if (currentRotation == 360) {
        currentRotation = 0;
    }
    updateBlockIndicatorPosition( x, y );
}
const placeBlockAtIndicator = () => { //Just place block where the block indicator is
    if (blockIndicator.position == undefined || currentBlockIndex == -1) { return; }

    const newBlock = availableBlocks[currentBlockIndex].clone();
    setColour(newBlock.blockModel, availableColours[currentBlockColourIndex]); //can change the colour of the blocks here

    try { grid.placeBlock(newBlock, blockIndicator.position, currentRotation, 50); }
    catch (error) { console.error(error) }
}

const deleteBlock = (x: number, y: number) => {
    const cursorPosition = [x, y];
    const renderedBlocks = camera.render(grid.blockModels.concat([blockIndicator.blockModel])); //don't want to assign a variable every frame for performance

    //find block closest to (x, y) using center property (just ignore z position), ignore when name == "indicator"
    for (let i = 0; i != renderedBlocks.length; i += 1) {
        if (renderedBlocks[i].object.name == "indicator") {
            renderedBlocks.splice(i, 1);
            break;
        }
    }
    if (renderedBlocks.length == 0) { return; } //there are no other blocks

    let closestBlockIndex = 0;
    for (let i = 0; i != renderedBlocks.length; i += 1) {
        if ( distanceBetween2D(renderedBlocks[i].center, cursorPosition) < distanceBetween2D(renderedBlocks[closestBlockIndex].center, cursorPosition) ) {
            closestBlockIndex = i;
        }
    }

    if (distanceBetween2D(renderedBlocks[closestBlockIndex].center, cursorPosition) > Block.cellSize) { return; }

    //now just get the block's id, and run the remove() function
    const blockID = renderedBlocks[closestBlockIndex].object.name!;
    blocks[blockID].removeBlock(grid);
}

let [x, y] = [0, 0];
document.onmousemove = ($e) => {
    //Chrome's Mouse position API is buggy, watch the green dot, it doesn't follow the cursor
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY]
    x /= dpi; //scale to match device's dpi
    y /= dpi;
    updateBlockIndicatorPosition( x, y );
}

document.getElementById("renderingWindow")!.onclick = () => {
    placeBlockAtIndicator();
    updateBlockIndicatorPosition( x, y ); //to prevent user from clicking the same point
}






//BLOCK SELECTION
const initializeSelection = () => {
    const blockSelectionInner = document.getElementById("blockSelectionInner")!;

    blockSelectionInner.innerHTML = `<h2><u> Select Block </u></h2>`;

    blockSelectionInner.innerHTML += `<input type="button" class="blockSelectionButton" value="None" id="selectNone"> <br>`;

    for (let i = 0; i != availableBlocks.length; i += 1) {
        const block = availableBlocks[i];
        blockSelectionInner.innerHTML += `
        <input type="button" class="blockSelectionButton" value="${block.blockName}" id="selectBlock${String(i)}">
        <br>
        `;
    }

    blockSelectionInner.innerHTML += `<h2><u> Select Colour </u></h2>`;
    for (let i = 0; i != availableColours.length; i += 1) {
        const colour = availableColours[i];
        blockSelectionInner.innerHTML += `
        <input type="button" class="colourSelectionButton" style="background-color: ${colour}" id="selectColour${String(i)}"></input>
        <br>
        `;
    }

    blockSelectionInner.innerHTML += `<h4> Press R to rotate the current block </h4>`;

    blockSelectionInner.innerHTML += `<h4> Press DELETE or BACKSPACE while hovering on a block to delete it </h4>`
}
const initalizeButtonListeners = () => {
    document.getElementById("selectNone")!.onclick = () => {
        currentBlockIndex = -1;
        updateBlockIndicator();
    }

    for (let i = 0; i != availableBlocks.length; i += 1) {
        document.getElementById("selectBlock" + String(i))!.onclick = () => {
            currentBlockIndex = i;
            updateBlockIndicator();
            updateBlockIndicatorPosition( x, y );
        }
    }

    for (let i = 0; i != availableColours.length; i += 1) {
        document.getElementById("selectColour" + String(i))!.onclick = () => {
            currentBlockColourIndex = i;
            updateBlockIndicator();
            updateBlockIndicatorPosition( x, y );
        }
    }

    document.onkeydown = ($e) => {
        const key = $e.key.toLowerCase();
        if (key == "r") { rotateIndicator() }
        else if (key == "delete" || key == "backspace") { deleteBlock( x, y ); }
    }

}

updateBlockIndicatorPosition( x, y );
initializeSelection();
initalizeButtonListeners();