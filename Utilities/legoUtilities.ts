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

    placeBlock = (block: Block , position: { layer: number, row: number, column: number }) => {
        if (block.position != undefined) { console.error("Cannot replace block, once you have placed it must be removed and recreated"); return; }

        //go to that position in the grid, then go through the block.gridModel, and place blocks down
        for (let vector of block.gridModel) {
            const layerPos = position.layer + vector.layer;
            const rowPos = position.row + vector.row;
            const columnPos = position.column + vector.column;
    
            this.data[layerPos][rowPos][columnPos] = block.id;
        }
        block.position = position;
        this.generateBlockModels();
    }

    blockModels: Shape[] = [];
    generateBlockModels = () => { //need to rewrite, each cell is a fixed size (set in the shapebuilder), the cellSize and cellHeight reflect that
        this.blockModels = [];
    
        for (const currentBlockID in blocks) {
            if (blocks[currentBlockID].position == undefined) { continue; }

            //calculate the position of the newBlock in the 3D world
            const [blockColumn, blockLayer, blockRow] = [blocks[currentBlockID].position!.column, blocks[currentBlockID].position!.layer, blocks[currentBlockID].position!.row];

            const currentBlock = blocks[currentBlockID].blockModel;
            currentBlock.position.x = (blockColumn - this.numOfColumns / 2) * Block.cellSize;
            currentBlock.position.y = (blockLayer) * (Block.cellHeight);
            currentBlock.position.z = (blockRow - this.numOfRows / 2) * Block.cellSize;

            this.blockModels.push(currentBlock);
        }
    }

    private generateVirtualCenters(screenObjects: { object: Shape, screenPoints: matrix, center: number[]}[], clickableSurfaces: { column: number, layer: number, row: number}[]) {
        const clickableSurfaceCenters: { position: { column: number, layer: number, row: number }, surfaceCenter: number[] }[] = [];

        //if the layer is -1, it just means that it is on the board, which also means that it won't have an id (-1)
        const boardPoints = screenObjects.find(obj => {
            return obj.object.name == "board"
        })!

        //create a grid of [row][column], of board centers,
        const corner1 = boardPoints.screenPoints.getColumn(3);
        const corner2 = boardPoints.screenPoints.getColumn(2);
        const corner3 = boardPoints.screenPoints.getColumn(7);

        const distanceBetween2D = (p1: number[], p2: number[]) => { return Math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2); }
        const width = distanceBetween2D(corner1, corner2);
        const depth = distanceBetween2D(corner1, corner3);

        //interpolate through these values when they come up in the clickable surfaces
        const widthInterpolation = width / this.numOfColumns;
        const depthInterpolation = depth / this.numOfRows;

        for (const surface of clickableSurfaces) {
            if (surface.layer == -1) {
                const boardFaceBottomLeftCorner = { x: widthInterpolation * surface.column, y: depth * surface.row };
                const boardFaceCenter = { x: boardFaceBottomLeftCorner.x + (widthInterpolation / 2), y: boardFaceBottomLeftCorner.y + (depthInterpolation / 2) }
                clickableSurfaceCenters.push( { position: { column: surface.column, layer: surface.layer, row: surface.row }, surfaceCenter: [boardFaceCenter.x, boardFaceCenter.y] } )

            } else {
                const id = this.data[surface.layer][surface.row][surface.column];
                //find top surface of object based on y-position, then just find the center of that face

                const object = screenObjects.find(obj => {
                    return obj.object.name == id
                })!



            }
        }
    }

    findPositionClicked(screenpoints: { object: Shape, screenPoints: matrix, center: number[]}[], clicked: { x: number, y: number }) {
        //first find all clickable surfaces, which is just the tops of any blocks, or the board. Go through each column + row in the board, and keep going down until you hit something
        const clickableSurfaces: { column: number, layer: number, row: number}[] = [];
        const startAtLayer = this.numOfLayers - 1;

        for (let row = 0; row != this.data[startAtLayer].length; row += 1) {
            for (let column = 0; column != this.data[startAtLayer][row].length; column += 1) {

                //repeat until you hit something or you hit the board
                let i = startAtLayer;
                while ( i != -1) {
                    if (this.data[i][row][column] != "-1") {  break;  }
                    i -= 1;
                }
                clickableSurfaces.push( { column: column, layer: i, row: row } );
            }
        }

        //now we generate the virtual faces for the surfaces
        this.generateVirtualCenters(screenObjects, clickableSurfaces);
    }

    constructor() { }
} 