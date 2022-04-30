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
    legoBoard.setColour("");
    legoBoard.faces[3].colour = "#dbdbdb";
    legoBoard.showOutline();
    
    return [legoBoard];
}

//MAIN SETUP
const [camera] = setupAryaa3D();
const grid = new LegoGrid();
grid.generateGrid(20, 40, 20); //width, height, depth (in blocks)

const [legoBoard] = setupBoard( grid );

const [gridLinesStart, gridLinesEnd] = grid.generateGridLines( legoBoard ); //creating the virtual grid lines, between each block






//ANIMATION LOOP
let boardPoints: matrix = new matrix();
setInterval(() => {
    clearCanvas();

    boardPoints = camera.render([legoBoard])[0].screenPoints;

    const [ gridLinesStartTransformed, gridLinesEndTransformed ] = [camera.transformMatrix(gridLinesStart, { x: 0, y: 0, z: 0 }), camera.transformMatrix(gridLinesEnd, { x: 0, y: 0, z: 0 })];
    for (let i = 0; i != gridLinesStartTransformed.width; i += 1) {
        drawLine(gridLinesStartTransformed.getColumn(i), gridLinesEndTransformed.getColumn(i), "#919191");
    }

    camera.render(grid.blockModels.concat([blockIndicator.blockModel]));
}, 16);






//BLOCKS
let currentBlockIndex = 0; //index in availableBlocks
let currentBlockColourIndex = 0;
let currentRotation: 0 | 90 | 180 | 270 = 0;

const blockIndicator = new BlockIndicator();
blockIndicator.blockModel.name = "indicator";
updateBlockIndicator();

const deleteBlock = (x: number, y: number) => {
    const cursorPosition = [x, y];
    const renderedBlocks = camera.render(grid.blockModels.concat([blockIndicator.blockModel])); //don't want to assign a variable every frame for performance

    for (let i = 0; i != renderedBlocks.length; i += 1) { //find block closest to (x, y) using center property (just ignore z position), ignore when name == "indicator"
        if (renderedBlocks[i].object.name == "indicator") {
            renderedBlocks.splice(i, 1);
            break;
        }
    }
    if (renderedBlocks.length == 0) { return; } //there are no other blocks

    let closestBlockIndex = 0;
    for (let i = 0; i != renderedBlocks.length; i += 1) {
        if ( distanceBetween2D(renderedBlocks[i].center, cursorPosition) < distanceBetween2D(renderedBlocks[closestBlockIndex].center, cursorPosition) ) 
        { closestBlockIndex = i; }
    }
    if (distanceBetween2D(renderedBlocks[closestBlockIndex].center, cursorPosition) > Block.cellSize) { return; }

    const blockID = renderedBlocks[closestBlockIndex].object.name!; //now just get the block's id, and run the remove() function
    blocks[blockID].removeBlock(grid);
    updateBlockIndicatorPosition( x, y );
}

let [x, y] = [0, 0];
document.onmousemove = ($e) => {
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY];
    updateBlockIndicatorPosition( x, y );
}

document.getElementById("renderingWindow")!.onclick = ($e) => {
    [x, y] = [$e.clientX - window.innerWidth / 2, window.innerHeight / 2 - $e.clientY]; //update position on click, for mobile devices which won't have an onmove() function
    updateBlockIndicatorPosition( x, y );

    placeBlockAtIndicator();
    updateBlockIndicatorPosition( x, y ); //to prevent user from clicking the same point
}






//BLOCK SELECTION
const initializeSelection = () => {
    const blockSelectionInner = document.getElementById("blockSelectionInner")!;
    blockSelectionInner.innerHTML = ""; //clear html

    blockSelectionInner.innerHTML += `<input type="button" id="toggleSelection" value="☰">`;

    blockSelectionInner.innerHTML += `<h2><u> Select Block </u></h2>`;

    blockSelectionInner.innerHTML += `<input type="button" class="blockSelectionButton" value="None" id="selectNone"> <br>`;
    for (let i = 0; i != availableBlocks.length; i += 1) {
        const block = availableBlocks[i];
        blockSelectionInner.innerHTML += `
        <input type="button" class="blockSelectionButton" value="${block.blockName}" id="selectBlock${String(i)}">
        <br>
        `;
    }

    blockSelectionInner.innerHTML += `<h2><u> Select Colour </u></h2>`;
    blockSelectionInner.innerHTML += `<div id="colourSelectionContainer">  </div>`
    const colourSelectionContainer = document.getElementById("colourSelectionContainer")!;
    for (let i = 0; i != availableColours.length; i += 1) {
        const colour = availableColours[i];
        colourSelectionContainer.innerHTML += `<input type="button" class="colourSelectionButton" style="background-color: ${colour}" id="selectColour${String(i)}"></input>`;
    }

    blockSelectionInner.innerHTML += `<h4> Press R to rotate the current block </h4>`;

    blockSelectionInner.innerHTML += `<h4> Press DELETE or BACKSPACE while hovering on a block to delete it </h4>`

    setTimeout(() => { //create a small delay to make it feel more natural
        openSelection();
    }, 400);
}
const initalizeButtonListeners = () => {
    document.getElementById("toggleSelection")!.onclick = () => {
        toggleSelection();
    }

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

//Opening and Closing the Selection menu
let selectionOpen = true;
const toggleSelection = () => {
    if (selectionOpen == true) {
        closeSelection();
        selectionOpen = false;
    }
    else {
        openSelection();
        selectionOpen = true;
    }
}
const openSelection = () => {
    document.getElementById("blockSelection")!.style.left = "25px";
    document.getElementById("toggleSelection")!.style.fontSize = "medium";
    (<HTMLInputElement>document.getElementById("toggleSelection")!).value = "✕";
}
const closeSelection = () => {
    document.getElementById("blockSelection")!.style.left = "calc(var(--blockSelectionWidth) * -1 - 2px)";
    document.getElementById("toggleSelection")!.style.fontSize = "larger";
    (<HTMLInputElement>document.getElementById("toggleSelection")!).value = "☰";
}

initializeSelection();
initalizeButtonListeners();