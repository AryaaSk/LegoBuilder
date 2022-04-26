"use strict";
const setColour = (shape, colour) => {
    for (let i = 0; i != shape.faces.length; i += 1) {
        shape.faces[i].colour = colour;
    }
};
class LegoGrid {
    constructor() {
        this.data = [];
        this.numOfLayers = 0;
        this.numOfRows = 0;
        this.numOfColumns = 0;
        this.generateGrid = (width, depth, height) => {
            const newGrid = [];
            for (let _ = 0; _ != height; _ += 1) {
                const currentLayer = [];
                for (let __ = 0; __ != depth; __ += 1) {
                    const currentRow = [];
                    for (let ___ = 0; ___ != width; ___ += 1) {
                        currentRow.push("-1");
                    }
                    currentLayer.push(currentRow);
                }
                newGrid.push(currentLayer);
            }
            this.data = newGrid; //[layer][row][column]
            this.numOfLayers = height;
            this.numOfRows = depth;
            this.numOfColumns = width;
        };
        this.placeBlock = (block, position) => {
            //go to that position in the grid, then go through the block.gridModel, and place blocks down
            for (let vector of block.gridModel) {
                const layerPos = position.layer + vector.layer;
                const rowPos = position.row + vector.row;
                const columnPos = position.column + vector.column;
                this.data[layerPos][rowPos][columnPos] = block.id;
            }
            block.position = position;
            this.generateBlockModels();
        };
        this.cleanGrid = () => {
            //go through grid, if the value is >-1 but doesn't exist in blocks, then set it to -1
            for (let layer = 0; layer != this.data.length; layer += 1) {
                for (let row = 0; row != this.data[layer].length; row += 1) {
                    for (let column = 0; column != this.data[layer][row].length; column += 1) {
                        if (Number(this.data[layer][row][column]) == -1) {
                            continue;
                        }
                        if (blocks[this.data[layer][row][column]] == undefined) {
                            this.data[layer][row][column] = "-1";
                        }
                    }
                }
            }
        };
        this.blockModels = [];
        this.generateBlockModels = () => {
            this.blockModels = [];
            for (let layer = 0; layer != this.data.length; layer += 1) {
                for (let row = 0; row != this.data[layer].length; row += 1) {
                    for (let column = 0; column != this.data[layer][row].length; column += 1) {
                        const currentBlockID = this.data[layer][row][column];
                        if (currentBlockID == "-1") {
                            continue;
                        }
                        const currentBlock = blocks[currentBlockID].blockModel;
                        //calculate the position of the newBlock in the 3D world
                        const [blockColumn, blockLayer, blockRow] = [blocks[currentBlockID].position.column, blocks[currentBlockID].position.layer, blocks[currentBlockID].position.row];
                        currentBlock.position.x = (blockColumn - this.numOfColumns / 2) * Block.cellSize;
                        currentBlock.position.y = (blockLayer) * (Block.cellHeight);
                        currentBlock.position.z = (blockRow - this.numOfRows / 2) * Block.cellSize;
                        this.blockModels.push(currentBlock);
                    }
                }
            }
        };
    }
}
