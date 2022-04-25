//Models
class SingleBlockModel extends Shape {
    constructor () {
        super();

        this.pointMatrix = new matrix();
        const points = [[0,0,0],[100,0,0],[100,0,100],[0,0,100],[0,150,0],[100,150,0],[100,150,100],[0,150,100]];
        for (let i = 0; i != points.length; i += 1)
        { this.pointMatrix.addColumn(points[i]); }

        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{pointIndexes:[0,1,2,3],colour:"#c4c4c4"},{pointIndexes:[0,1,5,4],colour:"#c4c4c4"},{pointIndexes:[1,2,6,5],colour:"#c4c4c4"},{pointIndexes:[4,5,6,7],colour:"#c4c4c4"},{pointIndexes:[0,4,7,3],colour:"#c4c4c4"},{pointIndexes:[2,3,7,6],colour:"#c4c4c4"}];
    }
}






const blocks: { [k: string] : Block } = {};

class Block {
    id: string;

    gridModel: { layer: number, row: number, column: number }[] = []; //a list of vectors from the original point, where the block will fill up
    blockModel: Shape = new Shape(); //when creating the model, make sure it extends into the x - z direction, do not center it on any axis, and also make each cell 100 * 100, and 150 wide, then we can scale

    constructor() {
        this.id = Block.generateID();
    }

    addToBlocks() {
        //before we add, scale the block, in the editor each cell is 100 * 150 * 100
        this.blockModel.scale = (Block.cellSize / 100);
        this.blockModel.updateMatrices();

        blocks[this.id] = this;
    }
    removeBlock(grid: LegoGrid) {
        delete blocks[this.id];
        grid.cleanGrid();
    }

    static cellSize = 10;
    static cellHeightRatio = 1.5; //multiply cellSize by 1.5 to get cellHeight

    static generateID() {
        //generate new identifier
        let newID = 0;
        for (const key in blocks) {
            if (Number(key) >= newID) {
                newID = Number(key) + 1;
            }
        }
        return String(newID);
    }
}

class SingleBlock extends Block {
    constructor () {
        super();

        this.gridModel = [{ layer: 0, row: 0, column: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockModel.showOutline = true;

        this.addToBlocks();
    }
}