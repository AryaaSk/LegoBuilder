class BlockIndicator {
    static generateBlockIndicatorModel = (model: Shape) => {
        const blockIndicatorModel = model.clone();
        /* //No need to make the block indicator shorter since it is already transparant
        for (let i = 0; i != blockIndicatorModel.pointMatrix.width; i += 1) {
            if (blockIndicatorModel.pointMatrix.getColumn(i)[1] >= Block.cellHeight) {
                blockIndicatorModel.pointMatrix.setValue(i, 1, blockIndicatorModel.pointMatrix.getColumn(i)[1] * 0.267);
            }
        }
        blockIndicatorModel.updateMatrices();
        */
        return blockIndicatorModel;
    }

    position? = { column: 0, layer: 0, row: 0 };
    blockModel: Shape;

    syncPosition(grid: LegoGrid, rotation: 0 | 90 | 180 | 270) {
        if (this.position == undefined) {
            console.error("Block position is undefined, cannont sync");
            return;
        }

        //need to convert to xyz
        const XYZPosition = generateXYZ( { column: this.position!.column, layer: this.position!.layer, row: this.position!.row }, rotation, grid.numOfColumns, grid.numOfRows )
        this.blockModel.position = XYZPosition;
        this.blockModel.rotation.y = rotation;
        this.blockModel.updateQuaternion();
    }

    constructor () {
        this.blockModel = BlockIndicator.generateBlockIndicatorModel( new SingleBlockModel() );
    }
}

const updateBlockIndicator = () => {
    if (currentBlockIndex == -1) { //block indicator is hidden
        blockIndicator.blockModel.setColour("");
        return;
    }
    blockIndicator.blockModel = BlockIndicator.generateBlockIndicatorModel( availableBlocks[currentBlockIndex].blockModel.clone() );
    blockIndicator.blockModel.name = "indicator"

    const indicatorColour = (isMobile == false) ? availableColours[currentBlockColourIndex] + "60" : ""; //don't show indicator if user is on mobile
    blockIndicator.blockModel.setColour(indicatorColour);
}

//show preview of where block will be placed, onmousemove()
const updateBlockIndicatorPosition = (mouseX: number, mouseY: number) => {
    if (boardPoints.width == 0 || currentBlockIndex == -1) { return; }

    const mousePosition = grid.getPositionClicked(boardPoints, [mouseX, mouseY] )
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
    newBlock.blockModel.setColour(availableColours[currentBlockColourIndex]);

    try { grid.placeBlock(newBlock, blockIndicator.position, currentRotation, 50); }
    catch (error) { console.error(error) }
}