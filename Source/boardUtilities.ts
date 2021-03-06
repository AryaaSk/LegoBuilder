const distanceBetween2D = (p1: number[], p2: number[]) => { return Math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2); }

const generateXYZ = ( position: { column: number, layer: number, row: number }, rotation: 0 | 90 | 180 | 270, numOfColumns: number, numOfRows: number ) => {
    const returnXYZ = { x: 0, y: 0, z: 0 };
    returnXYZ.x = (position.column - numOfColumns / 2) * Block.cellSize;
    returnXYZ.y = (position.layer) * (Block.cellHeight);
    returnXYZ.z = (position.row - numOfRows / 2) * Block.cellSize;    

    //need to attach it to a different corner depending on which way it is rotated
    if (rotation == 0) { } //bottom left, do nothing
    else if (rotation == 90) { //top left
        returnXYZ.z += Block.cellSize;
    }
    else if (rotation == 180) { //top right
        returnXYZ.x += Block.cellSize;
        returnXYZ.z += Block.cellSize;
    }
    else if (rotation == 270) { //bottom right
        returnXYZ.x += Block.cellSize;
    }
    return returnXYZ;
}

class LegoGrid {

    data: string[][][] = [];
    numOfLayers: number = 0;
    numOfRows: number = 0;
    numOfColumns: number = 0;

    generateGrid = (width: number, height: number, depth: number) => {
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
                        //need to find and remove it from this.blockModels
                        try {
                            let i = 0;
                            while (i != this.blockModels.length) {
                                if (this.blockModels[i].name == this.data[layer][row][column]) {
                                    this.blockModels.splice(i, 1);
                                }
                                else { i += 1; }
                            }
                        }
                        catch {}
                        
                        //remove from grid
                        this.data[layer][row][column] = "-1";
                    }
                }
            }
        }
    }

    blockModels: Shape[] = [];
    placeBlock = (block: Block , position: { column: number, layer: number, row: number }, rotation: 0 | 90 | 180 | 270, speed: number) => {
        if (block.position != undefined) { console.error("Cannot replace block, once you have placed it must be removed and recreated"); return; }
        block.position = position;

        //need to generate a new block.gridModel, to account for the rotation
        let rotatedGridModel: { layer: number, row: number, column: number }[] = [];
        rotatedGridModel = JSON.parse(JSON.stringify(block.gridModel));
        if (rotation == 0) { }
        else if (rotation == 90) {
            //column = row, row = column * -1
            for (let i = 0; i != rotatedGridModel.length; i += 1) {
                const tempColumn = rotatedGridModel[i].column;
                rotatedGridModel[i].column = rotatedGridModel[i].row;
                rotatedGridModel[i].row = tempColumn * -1;
            }
        }
        else if (rotation == 180) {
            //column = column * -1, row = row * -1
            for (let i = 0; i != rotatedGridModel.length; i += 1) {
                rotatedGridModel[i].column = rotatedGridModel[i].column * -1;
                rotatedGridModel[i].row = rotatedGridModel[i].row * -1;
            }
        }
        else if (rotation == 270) {
            //column = row * -1, row = column
            for (let i = 0; i != rotatedGridModel.length; i += 1) {
                const tempColumn = rotatedGridModel[i].column;
                rotatedGridModel[i].column = rotatedGridModel[i].row * -1;
                rotatedGridModel[i].row = tempColumn;
            }
        }
        
        for (let i = 0; i != rotatedGridModel.length; i += 1) {
            if (rotatedGridModel[i].column == -0) { rotatedGridModel[i].column = 0 }
            if (rotatedGridModel[i].row == -0) { rotatedGridModel[i].row = 0 }
        }
        
        //before actually placing anything, check if the new block will intersect with any existing blocks, or if it is out of bounds (the grid), if so then cancel the process
        for (let vector of rotatedGridModel) {
            const layerPos = position.layer + vector.layer;
            const rowPos = position.row + vector.row;
            const columnPos = position.column + vector.column;
    
            try {
                if (this.data[layerPos][rowPos][columnPos] == undefined) { throw("Triggering try-catch"); } //just accessing it to trigger the try-catch
            }
            catch {
                throw("CANNOT PLACE BLOCK: Out of bounds");
            }
            if (this.data[layerPos][rowPos][columnPos] != "-1") {
                throw("CANNOT PLACE BLOCK: Intersecting with another block");
            }
        }

        //go to that position in the grid, then go through the block.gridModel, and place blocks down
        for (let vector of rotatedGridModel) {
            const layerPos = position.layer + vector.layer;
            const rowPos = position.row + vector.row;
            const columnPos = position.column + vector.column;
    
            this.data[layerPos][rowPos][columnPos] = block.id;
        }

        //we need to animate it to it's position from [column][numOfLayers - 1][row] -> [column][layer][row]
        const blockPosition = generateXYZ( { column: position.column, layer: position.layer, row: position.row }, rotation, this.numOfColumns, this.numOfRows );
        block.blockModel.position = JSON.parse(JSON.stringify(blockPosition));
        block.blockModel.position.y = this.numOfLayers * Block.cellHeight; //start falling from top of world

        //block.blockModel.position = { x: blockPosition.x, y: this.numOfLayers * Block.cellHeight, z: blockPosition.z };
        block.blockModel.rotation.y = rotation;
        block.blockModel.updateQuaternion();
        this.blockModels.push( block.blockModel );

        const blockIndex = this.blockModels.length - 1;
        const repeat = (1 / speed) * 2500;
        const yDistance = (this.numOfLayers * Block.cellHeight) - (blockPosition.y);
        const yInterpolation = yDistance / repeat;
        let counter = 0;
        const interval = setInterval(() => {
            this.blockModels[blockIndex].position.y -= yInterpolation;

            if (counter >= repeat - 1) {  clearInterval(interval); }
            counter += 1;
        }, 1);
    }

    private getClickableSurfaces() {
        //first find all clickable surfaces, which is just the tops of any blocks, or the board. Go through each column + row in the board, and keep going down until you hit something
        const clickableSurfaces: { column: number, layer: number, row: number}[] = [];
        const topLayer = this.numOfLayers - 1;

        for (let row = 0; row != this.data[topLayer].length; row += 1) {
            for (let column = 0; column != this.data[topLayer][row].length; column += 1) {

                //repeat until you hit something or you hit the board
                let i = topLayer;
                while ( i != -1) {
                    if (this.data[i][row][column] != "-1") {  break;  }
                    i -= 1;
                }
                clickableSurfaces.push( { column: column, layer: i, row: row } );
            }
        }
        return clickableSurfaces;
    }
    private generateVirtualCenters(boardPoints: matrix, clickableSurfaces: { column: number, layer: number, row: number}[]) {
        const clickableSurfaceCenters: { position: { column: number, layer: number, row: number }, surfaceCenter: number[] }[] = [];

        //find distances between the width, height and depth of board, to interpolate values
        const baseCorner = boardPoints.getColumn(0);
        const corner2 = boardPoints.getColumn(1);
        const corner3 = boardPoints.getColumn(3);  
        const corner4 = boardPoints.getColumn(4);

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

    private findClosestDistance(list: any[], positionKey: string, positionPoint: number[]) {
        let closestSurfaceIndex = 0;
        for (let i = 0; i != list.length; i += 1) {
            if (distanceBetween2D(positionPoint, list[i][positionKey]) < distanceBetween2D(positionPoint, list[closestSurfaceIndex][positionKey])) {
                closestSurfaceIndex = i;
            }
        }
        return closestSurfaceIndex; //returns index
    }
    getPositionClicked(boardPoints: matrix, clicked: number[] ) {
        const clickableSurfaces = this.getClickableSurfaces();

        //now we generate the virtual faces for the surfaces
        const clickableSurfaceCenters = this.generateVirtualCenters(boardPoints, clickableSurfaces);

        //find the point which is closest to the mouse click
        const closestSurfaceIndex = this.findClosestDistance(clickableSurfaceCenters, "surfaceCenter", clicked);

        if (distanceBetween2D(clicked, clickableSurfaceCenters[closestSurfaceIndex].surfaceCenter) > Block.cellSize) { return undefined; }
        else {
            return clickableSurfaceCenters[closestSurfaceIndex].position;
        }
    }

    generateGridLines (board: Shape) {
        const increments = Block.cellSize;
        const baseCorner = board.pointMatrix.getColumn(0);
        const gridLinesStart = new matrix();
        for (let i = 1; i != this.numOfColumns; i += 1) {
            gridLinesStart.addColumn( [ baseCorner[0] + increments * i, 0, baseCorner[2] ] )
        }
        for (let i = 1; i != this.numOfRows; i += 1) {
            gridLinesStart.addColumn( [ baseCorner[0], 0, baseCorner[2] + increments * i ] )
        }

        const furthestCorner = board.pointMatrix.getColumn(5);
        const gridLinesEnd = new matrix();
        for (let i = 1; i != this.numOfColumns; i += 1) {
            gridLinesEnd.addColumn( [ furthestCorner[0] - ((this.numOfColumns * Block.cellSize) - increments * i), 0, furthestCorner[2] ] )
        }
        for (let i = 1; i != this.numOfRows; i += 1) {
            gridLinesEnd.addColumn( [ furthestCorner[0], 0, furthestCorner[2] - ((this.numOfRows * Block.cellSize) - increments * i) ] )
        }

        return [gridLinesStart, gridLinesEnd];
    }

    constructor() { }
} 