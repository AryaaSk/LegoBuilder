"use strict";
//Models
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
const blocks = {};
class Block {
    constructor() {
        this.position = undefined;
        this.gridModel = []; //a list of vectors from the original point, where the block will fill up
        this.blockModel = new Shape(); //when creating the model, make sure it extends into the x - z direction, do not center it on any axis, and also make each cell 100 * 100, and 150 wide, then we can scale
        this.id = Block.generateID();
        blocks[this.id] = this;
    }
    removeBlock(grid) {
        delete blocks[this.id];
        grid.cleanGrid();
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
Block.cellSize = 100;
Block.cellHeight = 150;
class SingleBlock extends Block {
    constructor() {
        super();
        this.gridModel = [{ layer: 0, row: 0, column: 0 }];
        this.blockModel = new SingleBlockModel();
        this.blockModel.showOutline = true;
    }
}
class DoubleBlock extends Block {
    constructor() {
        super();
        this.gridModel = [{ layer: 0, row: 0, column: 0 }, { layer: 0, row: 0, column: 1 }];
        this.blockModel = new DoubleBlockModel();
        this.blockModel.showOutline = true;
    }
}
