const blocks: { [k: string] : Block } = {}; //the blocks currently on the grid (with their own unique identifier)
const availableBlocks: Block[] = []; //the blocks which are available to place, to use one you just need to clone a block at a specified index
const availableColours = ["#C91A09", "#F47B30", "#FED557", "#237841", "#0055BF", "#FC97AC", "#81007B"] //red, orange, yellow, green, blue, pink, purple

//Models - When creating blocks, make each cell 100 * 100 on width and depth, and 150 tall. Do not create a top face sicne that will be filled in by the BlockAttachment
const setColour = (shape: Shape, colour: string) => {
    for (let i = 0; i != shape.faces.length; i += 1) {
        shape.faces[i].colour = colour;
    }
}


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
        this.faces = [{pointIndexes:[0,1,2,3],colour:"#c4c4c4"},{pointIndexes:[0,1,5,4],colour:"#c4c4c4"},{pointIndexes:[1,2,6,5],colour:"#c4c4c4"},{pointIndexes:[0,4,7,3],colour:"#c4c4c4"},{pointIndexes:[2,3,7,6],colour:"#c4c4c4"}];
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
        this.faces = [{pointIndexes:[0,1,2,3],colour:"#c4c4c4"},{pointIndexes:[0,1,5,4],colour:"#c4c4c4"},{pointIndexes:[1,2,6,5],colour:"#c4c4c4"},{pointIndexes:[0,4,7,3],colour:"#c4c4c4"},{pointIndexes:[2,3,7,6],colour:"#c4c4c4"}];
    }
}
class SidewayStairModel extends Shape {
    constructor () {
        super();

        this.pointMatrix = new matrix();
        const points = [[0,0,0],[200,0,0],[200,0,100],[0,0,200],[0,150,0],[200,150,0],[200,150,100],[0,150,200],[100,0,100],[100,150,100],[100,0,200],[100,150,200]];
        for (let i = 0; i != points.length; i += 1)
        { this.pointMatrix.addColumn(points[i]); }

        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{pointIndexes:[0,1,5,4],colour:"#c4c4c4"},{pointIndexes:[5,6,2,1],colour:"#c4c4c4"},{pointIndexes:[6,9,8,2],colour:"#c4c4c4"},{pointIndexes:[9,11,10,8],colour:"#c4c4c4"},{pointIndexes:[11,7,3,10],colour:"#c4c4c4"},{pointIndexes:[7,4,0,3],colour:"#c4c4c4"},{pointIndexes:[1,2,8,10,3,0],colour:"#c4c4c4"}];
    }
}






class BlockIndicator {
    static generateBlockIndicatorModel = (model: Shape) => { //creates a replica of the model with half the height
        const blockIndicatorModel = model.clone();
        /* //No need to make the block indicator shorter since it is already transparant
        for (let i = 0; i != blockIndicatorModel.pointMatrix.width; i += 1) {
            if (blockIndicatorModel.pointMatrix.getColumn(i)[1] >= Block.cellHeight) {
                blockIndicatorModel.pointMatrix.setValue(i, 1, blockIndicatorModel.pointMatrix.getColumn(i)[1] * 0.267);
            }
        }
        */
        blockIndicatorModel.updateMatrices();
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
        const XYZPosition = { x: 0, y: 0, z: 0 };
        XYZPosition.x = (this.position!.column - grid.numOfColumns / 2) * Block.cellSize;
        XYZPosition.y = (this.position!.layer) * (Block.cellHeight);
        XYZPosition.z = (this.position!.row - grid.numOfRows / 2) * Block.cellSize;
        this.blockModel.position = XYZPosition;

        this.blockModel.rotation.y = rotation;
        this.blockModel.updateQuaternion();

        //also need to attach it to a different corner depending on which way it is rotated
        if (rotation == 0) { } //bottom left, do nothing
        else if (rotation == 90) { //top left
            XYZPosition.z += Block.cellSize;
        }
        else if (rotation == 180) { //top right
            XYZPosition.x += Block.cellSize;
            XYZPosition.z += Block.cellSize;
        }
        else if (rotation == 270) { //bottom right
            XYZPosition.x += Block.cellSize;
        }
    }

    constructor () {
        this.blockModel = BlockIndicator.generateBlockIndicatorModel( new SingleBlockModel() );
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
    configureBlockModel () {
        this.blockModel.name = this.id;
        this.blockModel.showOutline = true;

        //add the blockAttachment to the block shape, based on the gridModel, basically combining shapes here
        for (const cell of this.gridModel) {
            const blockAttachmentTranslation = Vector((Block.cellSize * cell.column) + (Block.cellSize / 2), (Block.cellHeight) * (cell.layer + 1), (Block.cellSize * cell.row) + (Block.cellSize / 2));

            const points = [[-20,0,-20],[20,0,-20],[20,0,20],[-20,0,20],[-20,20,-20],[20,20,-20],[20,20,20],[-20,20,20],[-49.5,0,-49.5],[49.5,0,-49.5],[49.5,0,49.5],[-49.5,0,49.5]];
            const blockAttachmentFaces: { pointIndexes: number[], colour: string, outline?: boolean }[] = [{pointIndexes:[4,5,1,0],colour:"#c4c4c4"},{pointIndexes:[5,6,2,1],colour:"#c4c4c4"},{pointIndexes:[2,3,7,6],colour:"#c4c4c4"},{pointIndexes:[0,3,7,4],colour:"#c4c4c4"},{pointIndexes:[5,6,7,4],colour:"#c4c4c4"},{pointIndexes:[8,0,1,9],colour:"#c4c4c4"},{pointIndexes:[9,1,2,10],colour:"#c4c4c4"},{pointIndexes:[10,2,3,11],colour:"#c4c4c4"},{pointIndexes:[11,3,0,8],colour:"#c4c4c4"}];
            blockAttachmentFaces[0].outline = true;
            blockAttachmentFaces[1].outline = true;
            blockAttachmentFaces[2].outline = true;
            blockAttachmentFaces[3].outline = true;
            blockAttachmentFaces[4].outline = true;

            //first attach a singular blockAttachment
            const pointIndexOffset = this.blockModel.pointMatrix.width;
            for (const point of points) {
                point[0] += blockAttachmentTranslation.x;
                point[1] += blockAttachmentTranslation.y;
                point[2] += blockAttachmentTranslation.z;
                this.blockModel.pointMatrix.addColumn(point);
            }
            for (let i = 0; i != blockAttachmentFaces.length; i += 1) {
                for (let a = 0; a != blockAttachmentFaces[i].pointIndexes.length; a += 1) {
                    blockAttachmentFaces[i].pointIndexes[a] += pointIndexOffset;
                }
            }
            this.blockModel.faces = this.blockModel.faces.concat(blockAttachmentFaces);
        }
        this.blockModel.updateMatrices();
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





//Actual blocks
class SingleBlock extends Block {
    constructor () {
        super();

        this.gridModel = [{ column: 0, layer: 0, row: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockName = "Single Block";
        this.configureBlockModel();
    }
}
availableBlocks.push( new SingleBlock() );

class DoubleBlock extends Block {
    constructor () {
        super();

        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }];
        this.blockModel = new DoubleBlockModel();
        this.blockName = "Double Block";
        this.configureBlockModel();
    }
}
availableBlocks.push( new DoubleBlock() );

class SidewayStairBlock extends Block {
    constructor () {
        super();

        this.gridModel = [ { column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }, { column: 0, layer: 0, row: 1 } ];
        this.blockModel = new SidewayStairModel();
        this.blockName = "Sideways Stair Block";
        this.configureBlockModel();
    }
}
availableBlocks.push( new SidewayStairBlock() );