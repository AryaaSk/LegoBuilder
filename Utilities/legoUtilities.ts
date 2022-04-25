const setColour = (shape: Shape, colour: string) => {
    for (let i = 0; i != shape.faces.length; i += 1) {
        shape.faces[i].colour = colour;
    }
}

class LegoGrid {

    data: string[][][] = [];
    numOfLayers: number = 0;
    numOfRows: number = 0;
    numOfColumns: number = 0;

    generateGrid = (width: number, depth: number, height: number) => {
        const newGrid: string[][][] = []
        for (let _ = 0; _ != height; _ += 1) {
            const currentLayer: string[][] = [];
            for (let __ = 0; __ != depth; __ += 1) {
                const currentRow: string[] = [];
                for (let ___ = 0; ___ != width; ___ += 1) {
                    currentRow.push("-1");
                }
                currentLayer.push(currentRow);
            }
            newGrid.push(currentLayer)
        }
    
        this.data = newGrid; //[layer][row][column]
        this.numOfLayers = height;
        this.numOfRows = depth;
        this.numOfColumns = width;
    }

    placeBlock = (block: Block , position: { layer: number, row: number, column: number }) => {
        //go to that position in the grid, then go through the block.gridModel, and place blocks down
        for (let vector of block.gridModel) {
            const layerPos = position.layer + vector.layer;
            const rowPos = position.row + vector.row;
            const columnPos = position.column + vector.column;
    
            this.data[layerPos][rowPos][columnPos] = block.id;
        }
        this.generateBlockModels();
    }

    cleanGrid = () => {
        //go through grid, if the value is >-1 but doesn't exist in blocks, then set it to -1
        for (let layer = 0; layer != this.data.length; layer += 1) {
            for (let row = 0; row != this.data[layer].length; row += 1) {
                for (let column = 0; column != this.data[layer][row].length; column += 1) {
                    if (Number(this.data[layer][row][column]) == -1) { continue; }
    
                    if (blocks[this.data[layer][row][column]] == undefined) {
                        this.data[layer][row][column] = "-1";
                    }
                }
            }
        }
    }

    blockModels: Shape[] = [];
    generateBlockModels = () => { //need to rewrite, each cell is a fixed size (set in the shapebuilder), the cellSize and cellHeight reflect that
        this.blockModels = [];
    
        for (let layer = 0; layer != this.data.length; layer += 1) {
            for (let row = 0; row != this.data[layer].length; row += 1) {
                for (let column = 0; column != this.data[layer][row].length; column += 1) {

                    const currentBlockID = this.data[layer][row][column];
                    if (currentBlockID == "-1") { continue; }

                    const currentBlock = blocks[currentBlockID].blockModel;
                    //calculate the position of the newBlock in the 3D world

                    currentBlock.position.x = (column - this.numOfColumns / 2) * Block.cellSize;
                    currentBlock.position.y = (layer) * (Block.cellHeight);
                    currentBlock.position.z = (row - this.numOfRows / 2) * Block.cellSize;

                    this.blockModels.push(currentBlock);
                }
            }
        }
    }

    constructor() { }
}