"use strict";
const blocks = {}; //the blocks currently on the grid (with their own unique identifier)
const availableBlocks = []; //the blocks which are available to place, to use one you just need to clone a block at a specified index
//red, orange, yellow, light green, dark blue, pink, purple, white, dark grey - used this website for colours: https://brickipedia.fandom.com/wiki/Colour_Palette
const availableColours = ["#e02a29", "#ff6600", "#ffd67f", "#00CC00", "#0055BF", "#EE9DC3", "#2C1577", "#FFFFFF", "#171717"];
//Models - When creating blocks, make each cell the same size as the cellSize (width and depth), and cellHeight found in the Block class. Do not create a top face sicne that will be filled in by the BlockAttachment
class SingleBlockModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [75, 0, 0], [75, 0, 75], [0, 0, 75], [0, 100, 0], [75, 100, 0], [75, 100, 75], [0, 100, 75]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 2, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4", outline: true }, { pointIndexes: [1, 2, 6, 5], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 4, 7, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4", outline: true }];
    }
}
class DoubleBlockModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [150, 0, 0], [150, 0, 75], [0, 0, 75], [0, 100, 0], [150, 100, 0], [150, 100, 75], [0, 100, 75]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 2, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4", outline: true }, { pointIndexes: [1, 2, 6, 5], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 4, 7, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4", outline: true }];
    }
}
class SidewayStairModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [150, 0, 0], [150, 0, 75], [0, 0, 150], [0, 100, 0], [150, 100, 0], [150, 100, 75], [0, 100, 150], [75, 0, 75], [75, 100, 75], [75, 0, 150], [75, 100, 150]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4", outline: true }, { pointIndexes: [5, 6, 2, 1], colour: "#c4c4c4", outline: true }, { pointIndexes: [6, 9, 8, 2], colour: "#c4c4c4", outline: true }, { pointIndexes: [9, 11, 10, 8], colour: "#c4c4c4", outline: true }, { pointIndexes: [11, 7, 3, 10], colour: "#c4c4c4", outline: true }, { pointIndexes: [7, 4, 0, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [1, 2, 8, 10, 3, 0], colour: "#c4c4c4", outline: true }];
    }
}
class TwoByTwoBlockModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [150, 0, 0], [150, 0, 150], [0, 0, 150], [0, 100, 0], [150, 100, 0], [150, 100, 150], [0, 100, 150]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 2, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4", outline: true }, { pointIndexes: [1, 2, 6, 5], colour: "#c4c4c4", outline: true }, { pointIndexes: [0, 4, 7, 3], colour: "#c4c4c4", outline: true }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4", outline: true }];
    }
}
class Block {
    constructor(generateID) {
        this.blockName = "";
        this.position = undefined;
        this.gridModel = []; //a list of vectors from the original point, where the block will fill up
        this.blockModel = new Shape(); //when creating the model, make sure it extends into the x - z direction, do not center it on any axis, and also make each cell 100 * 100, and 150 wide, then we can scale
        if (generateID == false) {
            this.id = "-1";
            return;
        } //used when initializing an available block
        this.id = Block.generateID();
        blocks[this.id] = this;
    }
    configureBlockModel() {
        this.blockModel.name = this.id;
        this.blockModel.showOutline();
        //add the blockAttachment to the block shape, based on the gridModel, basically combining shapes here
        for (const cell of this.gridModel) {
            const blockAttachmentTranslation = Vector((Block.cellSize * cell.column) + (Block.cellSize / 2), (Block.cellHeight) * (cell.layer + 1), (Block.cellSize * cell.row) + (Block.cellSize / 2));
            const points = [[-15, 0, -15], [15, 0, -15], [15, 0, 15], [-15, 0, 15], [-15, 20, -15], [15, 20, -15], [15, 20, 15], [-15, 20, 15], [-37.125, 0, -37.125], [37.125, 0, -37.125], [37.125, 0, 37.125], [-37.125, 0, 37.125]];
            const blockAttachmentFaces = [{ pointIndexes: [4, 5, 1, 0], colour: "#c4c4c4" }, { pointIndexes: [5, 6, 2, 1], colour: "#c4c4c4" }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4" }, { pointIndexes: [0, 3, 7, 4], colour: "#c4c4c4" }, { pointIndexes: [5, 6, 7, 4], colour: "#c4c4c4" }, { pointIndexes: [8, 0, 1, 9], colour: "#c4c4c4" }, { pointIndexes: [9, 1, 2, 10], colour: "#c4c4c4" }, { pointIndexes: [10, 2, 3, 11], colour: "#c4c4c4" }, { pointIndexes: [11, 3, 0, 8], colour: "#c4c4c4" }];
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
    removeBlock(grid) {
        delete blocks[this.id];
        grid.cleanGrid();
    }
    clone() {
        const newBlock = new Block(); //don't need to generate new id since it is already generated in constructor
        newBlock.blockName = this.blockName;
        newBlock.position = undefined;
        newBlock.gridModel = JSON.parse(JSON.stringify(this.gridModel));
        newBlock.blockModel = this.blockModel.clone();
        newBlock.blockModel.name = newBlock.id;
        return newBlock;
    }
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
//Actual lego brick has dimensions - cellSize: 7.2mm, cellHeight: 9.6mm
//After increasing - cellSize: 75mm, cellHeight: 100mm
Block.cellSize = 75; //define the size of each cell here, then make the block models the same size
Block.cellHeight = 100;
//Actual blocks
class SingleBlock extends Block {
    constructor() {
        super(false);
        this.gridModel = [{ column: 0, layer: 0, row: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockName = "Single Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new SingleBlock());
class DoubleBlock extends Block {
    constructor() {
        super(false);
        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }];
        this.blockModel = new DoubleBlockModel();
        this.blockName = "Double Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new DoubleBlock());
class SidewayStairBlock extends Block {
    constructor() {
        super(false);
        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }, { column: 0, layer: 0, row: 1 }];
        this.blockModel = new SidewayStairModel();
        this.blockName = "Sideways Stair Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new SidewayStairBlock());
class TwoByTwoBlock extends Block {
    constructor() {
        super(false);
        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }, { column: 0, layer: 0, row: 1 }, { column: 1, layer: 0, row: 1 }];
        this.blockModel = new TwoByTwoBlockModel();
        this.blockName = "2 X 2 Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new TwoByTwoBlock());
