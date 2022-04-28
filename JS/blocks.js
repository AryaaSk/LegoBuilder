"use strict";
const blocks = {}; //the blocks currently on the grid (with their own unique identifier)
const availableBlocks = []; //the blocks which are available to place, to use one you just need to clone a block at a specified index
//Models
const setColour = (shape, colour) => {
    for (let i = 0; i != shape.faces.length; i += 1) {
        shape.faces[i].colour = colour;
    }
};
class SingleBlockModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [100, 0, 0], [100, 0, 100], [0, 0, 100], [0, 150, 0], [100, 150, 0], [100, 150, 100], [0, 150, 100]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 2, 3], colour: "#c4c4c4" }, { pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4" }, { pointIndexes: [1, 2, 6, 5], colour: "#c4c4c4" }, { pointIndexes: [4, 5, 6, 7], colour: "#c4c4c4" }, { pointIndexes: [0, 4, 7, 3], colour: "#c4c4c4" }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4" }];
    }
}
class DoubleBlockModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [200, 0, 0], [200, 0, 100], [0, 0, 100], [0, 150, 0], [200, 150, 0], [200, 150, 100], [0, 150, 100]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 2, 3], colour: "#c4c4c4" }, { pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4" }, { pointIndexes: [1, 2, 6, 5], colour: "#c4c4c4" }, { pointIndexes: [4, 5, 6, 7], colour: "#c4c4c4" }, { pointIndexes: [0, 4, 7, 3], colour: "#c4c4c4" }, { pointIndexes: [2, 3, 7, 6], colour: "#c4c4c4" }];
    }
}
class SidewayStairModel extends Shape {
    constructor() {
        super();
        this.pointMatrix = new matrix();
        const points = [[0, 0, 0], [200, 0, 0], [200, 0, 100], [0, 0, 200], [0, 150, 0], [200, 150, 0], [200, 150, 100], [0, 150, 200], [100, 0, 100], [100, 150, 100], [100, 0, 200], [100, 150, 200]];
        for (let i = 0; i != points.length; i += 1) {
            this.pointMatrix.addColumn(points[i]);
        }
        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);
        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{ pointIndexes: [0, 1, 5, 4], colour: "#c4c4c4" }, { pointIndexes: [5, 6, 2, 1], colour: "#c4c4c4" }, { pointIndexes: [6, 9, 8, 2], colour: "#c4c4c4" }, { pointIndexes: [9, 11, 10, 8], colour: "#c4c4c4" }, { pointIndexes: [11, 7, 3, 10], colour: "#c4c4c4" }, { pointIndexes: [7, 4, 0, 3], colour: "#c4c4c4" }, { pointIndexes: [5, 4, 7, 11, 9, 6], colour: "#c4c4c4" }, { pointIndexes: [1, 2, 8, 10, 3, 0], colour: "#c4c4c4" }];
    }
}
class Block {
    constructor() {
        this.blockName = "";
        this.position = undefined;
        this.gridModel = []; //a list of vectors from the original point, where the block will fill up
        this.blockModel = new Shape(); //when creating the model, make sure it extends into the x - z direction, do not center it on any axis, and also make each cell 100 * 100, and 150 wide, then we can scale
        this.id = Block.generateID();
        blocks[this.id] = this;
    }
    configureBlockModel() {
        this.blockModel.showOutline = true;
        this.blockModel.name = this.id;
    }
    removeBlock(grid) {
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
Block.cellSize = 100; //define the size of each cell here, then make the block models the same size
Block.cellHeight = 150;
class BlockIndicator {
    constructor() {
        this.position = { column: 0, layer: 0, row: 0 };
        this.blockModel = BlockIndicator.generateBlockIndicatorModel(new SingleBlockModel());
    }
    syncPosition(grid) {
        if (this.position == undefined) {
            console.error("Block position is undefined, cannont sync");
            return;
        }
        //need to convert to xyz
        const XYZPosition = { x: 0, y: 0, z: 0 };
        XYZPosition.x = (this.position.column - grid.numOfColumns / 2) * Block.cellSize;
        XYZPosition.y = (this.position.layer) * (Block.cellHeight);
        XYZPosition.z = (this.position.row - grid.numOfRows / 2) * Block.cellSize;
        this.blockModel.position = XYZPosition;
    }
}
BlockIndicator.generateBlockIndicatorModel = (model) => {
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
};
//Actual blocks
class SingleBlock extends Block {
    constructor() {
        super();
        this.gridModel = [{ column: 0, layer: 0, row: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockName = "Single Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new SingleBlock());
class DoubleBlock extends Block {
    constructor() {
        super();
        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }];
        this.blockModel = new DoubleBlockModel();
        this.blockName = "Double Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new DoubleBlock());
class SidewayStairBlock extends Block {
    constructor() {
        super();
        this.gridModel = [{ column: 0, layer: 0, row: 0 }, { column: 1, layer: 0, row: 0 }, { column: 0, layer: 0, row: 1 }];
        this.blockModel = new SidewayStairModel();
        this.blockName = "Sideways Stair Block";
        this.configureBlockModel();
    }
}
availableBlocks.push(new SidewayStairBlock());
