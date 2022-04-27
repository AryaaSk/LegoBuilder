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

    private getClickableSurfaces() {
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
        return clickableSurfaces;
    }
    private generateVirtualCenters(screenObjects: { object: Shape, screenPoints: matrix, center: number[]}[], clickableSurfaces: { column: number, layer: number, row: number}[]) {
        const clickableSurfaceCenters: { position: { column: number, layer: number, row: number }, surfaceCenter: number[] }[] = [];

        //find distances between the width, height and depth of board, to interpolate values
        const boardPoints = screenObjects.find(obj => {
            return obj.object.name == "board"
        })!

        const baseCorner = boardPoints.screenPoints.getColumn(0);
        const corner2 = boardPoints.screenPoints.getColumn(1);
        const corner3 = boardPoints.screenPoints.getColumn(3);  
        const corner4 = boardPoints.screenPoints.getColumn(4);

        //interpolate through these values when they come up in the clickable surfaces
        const widthInterpolationVector = [corner2[0] - baseCorner[0], corner2[1] - baseCorner[1]]
        widthInterpolationVector[0] /= this.numOfColumns;
        widthInterpolationVector[1] /= this.numOfColumns;
        
        const heightInterpolationVector = [corner3[0] - baseCorner[0], corner3[1] - baseCorner[1]]
        heightInterpolationVector[0] /= this.numOfLayers;
        heightInterpolationVector[1] /= this.numOfLayers;

        const depthInterpolationVector = [corner4[0] - baseCorner[0], corner4[1] - baseCorner[1]]
        depthInterpolationVector[0] /= this.numOfRows;
        depthInterpolationVector[1] /= this.numOfRows;

        for (const surface of clickableSurfaces) {
            const column = surface.column;
            const layer = surface.layer + 1; //since the first layer (the board) starts at -1
            const row = surface.row;

            const faceCenterPoint = [baseCorner[0], baseCorner[1]];
            faceCenterPoint[0] += (column * widthInterpolationVector[0]) + (widthInterpolationVector[0] * 0.5);
            faceCenterPoint[1] += (column * widthInterpolationVector[1]) + (widthInterpolationVector[1] * 0.5);

            faceCenterPoint[0] += (layer * heightInterpolationVector[0]); //you don't need to center the height
            faceCenterPoint[1] += (layer * heightInterpolationVector[1]);

            faceCenterPoint[0] += (row * depthInterpolationVector[0]) + (depthInterpolationVector[0] * 0.5);
            faceCenterPoint[1] += (row * depthInterpolationVector[1]) + (depthInterpolationVector[1] * 0.5);

            clickableSurfaceCenters.push( { position: { column: column, layer: layer, row: row }, surfaceCenter: faceCenterPoint } );
        }

        return clickableSurfaceCenters;
    }
    private distanceBetween2D = (p1: number[], p2: number[]) => { return Math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2); }

    private findClosestDistance(list: any[], positionKey: string, positionPoint: number[]) {
        let closestSurfaceIndex = 0;
        for (let i = 0; i != list.length; i += 1) {
            if (this.distanceBetween2D(positionPoint, list[i][positionKey]) < this.distanceBetween2D(positionPoint, list[closestSurfaceIndex][positionKey])) {
                closestSurfaceIndex = i;
            }
        }
        return closestSurfaceIndex; //returns index
    }
    getPositionClicked(screenpoints: { object: Shape, screenPoints: matrix, center: number[]}[], clicked: number[] ) {
        const clickableSurfaces = this.getClickableSurfaces();

        //now we generate the virtual faces for the surfaces
        const clickableSurfaceCenters = this.generateVirtualCenters(screenpoints, clickableSurfaces);

        //find the point which is closest to the mouse click
        const closestSurfaceIndex = this.findClosestDistance(clickableSurfaceCenters, "surfaceCenter", clicked);

        if (this.distanceBetween2D(clicked, clickableSurfaceCenters[closestSurfaceIndex].surfaceCenter) > Block.cellSize) { return undefined; }
        else {
            return clickableSurfaceCenters[closestSurfaceIndex].position;
        }
    }

    constructor() { }
} 