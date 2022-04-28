const blocks: { [k: string] : Block } = {}; //the blocks currently on the grid (with their own unique identifier)
const availableBlocks: Block[] = [];

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
class DoubleBlockModel extends Shape {
    constructor () {
        super();

        this.pointMatrix = new matrix();
        const points = [[0,0,0],[200,0,0],[200,0,100],[0,0,100],[0,150,0],[200,150,0],[200,150,100],[0,150,100]];
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





class Block {
    id: string;
    blockName: string = "";

    position?: { layer: number, row: number, column: number } = undefined;
    gridModel: { layer: number, row: number, column: number }[] = []; //a list of vectors from the original point, where the block will fill up
    blockModel: Shape = new Shape(); //when creating the model, make sure it extends into the x - z direction, do not center it on any axis, and also make each cell 100 * 100, and 150 wide, then we can scale

    constructor() {
        this.id = Block.generateID();
        blocks[this.id] = this;
    }

    removeBlock(grid: LegoGrid) {
        delete blocks[this.id];
        grid.cleanGrid();
    }

    clone() {
        const newBlock = new Block();
        newBlock.id = Block.generateID();
        newBlock.blockName = this.blockName;
        newBlock.position = undefined;
        newBlock.gridModel = JSON.parse(JSON.stringify(this.gridModel));
        newBlock.blockModel = this.blockModel.clone();
        newBlock.blockModel.name = newBlock.id;
        return newBlock
    }

    static cellSize = 100; //define the size of each cell here, then make the block models the same size
    static cellHeight = 150;

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

class BlockIndicator {
    static generateBlockIndicatorModel = (model: Shape) => { //creates a replica of the model with half the height
        const newModel = new Shape();
        newModel.faces = model.faces;
        newModel.pointMatrix = model.pointMatrix.copy();
        for (let i = 0; i != newModel.pointMatrix.width; i += 1) {
            if (newModel.pointMatrix.getColumn(i)[1] == Block.cellHeight) {
                newModel.pointMatrix.setValue(i, 1, Block.cellHeight * 0.267);
            }
        }
        newModel.updateMatrices();
        setColour(newModel, "#87ceeb");
        newModel.showOutline = true;
        return newModel;
    }

    position? = { column: 0, layer: 0, row: 0 };
    blockModel: Shape;

    syncPosition(grid: LegoGrid) {
        if (this.position == undefined) {
            console.error("Block position is undefined, cannont sync");
            return;
        }

        //need to convert to xyz
        const XYZPosition = { x: 0, y: 0, z: 0 };
        XYZPosition.x = (this.position!.column - grid.numOfColumns / 2) * Block.cellSize;
        XYZPosition.y = (this.position!.layer) * (Block.cellHeight);
        XYZPosition.z = (this.position!.row - grid.numOfRows / 2) * Block.cellSize;
        this.blockModel.position = XYZPosition;
    }

    constructor () {
        this.blockModel = BlockIndicator.generateBlockIndicatorModel( new SingleBlockModel() );
    }
}










//Actual blocks
class SingleBlock extends Block {
    constructor () {
        super();

        this.gridModel = [{ layer: 0, row: 0, column: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockName = "Single Block";
        this.blockModel.showOutline = true;
        this.blockModel.name = this.id;
    }
}
availableBlocks.push( new SingleBlock() );
class DoubleBlock extends Block {
    constructor () {
        super();

        this.gridModel = [{ layer: 0, row: 0, column: 0 }, { layer: 0, row: 0, column: 1 }];
        this.blockModel = new DoubleBlockModel();
        this.blockName = "Double Block";
        this.blockModel.showOutline = true;
        this.blockModel.name = this.id;
    }
}
availableBlocks.push( new DoubleBlock() );