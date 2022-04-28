//CANVAS UTILITIES
let dpi = window.devicePixelRatio;
let canvas: any = undefined;
let c: any = undefined;
let canvasWidth = 0; 
let canvasHeight = 0;
const linkCanvas = (canvasID: string) => {
    canvas = <HTMLCanvasElement>document.getElementById(canvasID);
    c = canvas.getContext('2d')!;

    canvasHeight = document.getElementById(canvasID)!.getBoundingClientRect().height; //Fix blury lines
    canvasWidth = document.getElementById(canvasID)!.getBoundingClientRect().width;
    canvas.setAttribute('height', String(canvasHeight * dpi));
    canvas.setAttribute('width', String(canvasWidth * dpi));

    window.onresize = () => { linkCanvas(canvasID); } //just calling the function to initialise the canvas again
}

//ACTUAL DRAWING FUNCTIONS
const gridX = (x: number) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    return ((canvasWidth / 2) + x) * dpi;
}
const gridY = (y: number) => {  //on the page y = 0 is at the top, however in an actual grid y = 0 is at the bottom
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    return ((canvasHeight / 2) - y) * dpi;
}
const plotPoint = (p: number[], colour: string, label?: string) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    //point will be in format: [x, y]
    c.fillStyle = colour;
    c.fillRect(gridX(p[0] * dpi), gridY(p[1] * dpi), 10, 10);

    if (label != undefined) {
        c.font = `${20 * dpi}px Arial`;
        c.fillText(label, gridX(p[0] * dpi)! + 10, gridY(p[1] * dpi)! + 10);
    }
}
const drawLine = (p1: number[], p2: number[], colour: string) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    //points will be in format: [x, y]
    //I need to convert the javascript x and y into actual grid x and y
    c.fillStyle = colour;
    c.beginPath()
    c.moveTo(gridX(p1[0] * dpi), gridY(p1[1] * dpi))
    c.lineTo(gridX(p2[0] * dpi), gridY(p2[1] * dpi));
    c.stroke();
}
const drawShape = (points: number[][], colour: string, outline?: boolean) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    if (points.length == 2) { drawLine(points[0], points[1], colour) }
    else if (points.length < 3) { console.error("Cannot draw shape, need at least 3 points to draw a shape"); return; }
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(gridX(points[0][0] * dpi), gridY(points[0][1] * dpi));
    for (let pointsIndex = 1; pointsIndex != points.length; pointsIndex += 1) { 
        c.lineTo(gridX(points[pointsIndex][0] * dpi), gridY(points[pointsIndex][1] * dpi)) 
    }
    c.closePath();
    c.fill();

    if (outline == true) { 
        for (let i = 1; i != points.length; i += 1)
        { drawLine(points[i - 1], points[i], "#000000"); }
        drawLine(points[points.length - 1], points[0], "000000"); //to cover the line from last point to first point
    }
}

const clearCanvas = () => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    c.clearRect(0, 0, canvas.width, canvas.height);
}





 
//MATH UTILITIES - I always try and stay in degrees instead of radians, you can assume that all functions will take in and return in degrees
interface XYZ {
    x: number,
    y: number,
    z: number
};
interface XYZW {
    x: number,
    y: number,
    z: number,
    w: number
}

const Vector = (x: number, y: number, z: number): XYZ => {
    return { x: x, y: y, z: z };
}

class matrix {
    private data: number[][] = [];
    width: number = 0;
    height: number = 0;

    addColumn(nums: number[]) {
        this.data.push(nums);
        this.height = nums.length;
        this.width += 1;
    }
    addRow(nums: number[]) {
        //to add a row you just need to add the given nums to the end of each column, we first need to check that nums == width
        if (nums.length != this.width) { console.error("Unable to add row since length of inputs is not equal to number of columns"); return; }

        for (let i in nums) { this.data[i].push(nums[i]); i += 1; }
        this.height += 1;
    }

    printMatrix() {
        //loop through the rows, and inside of that loop, loop through all the columns
        let finalOutput = "Matrix:";
        let currentRow = 0;
        while (currentRow != this.height) {
            let currentLineOutput = "\n"
            let currentColumn = 0;
            while (currentColumn != this.width) {
                currentLineOutput = currentLineOutput + (this.data[currentColumn][currentRow]) + "      ";
                currentColumn += 1;
            }

            finalOutput = finalOutput + currentLineOutput;
            currentRow += 1;
        }
        console.log(finalOutput);
    }

    getColumn(columnIndex: number) { 
        return this.data[columnIndex]; 
    }
    getRow(rowIndex: number) {
        let returnArray: number[] = [];
        for (let i in this.data) { returnArray.push(this.data[i][rowIndex]); }
        return returnArray;
    }
    setValue(columnIndex: number, rowIndex: number, value: number) { 
        this.data[columnIndex][rowIndex] = value; 
    }
    getValue(columnIndex: number, rowIndex: number) { 
        return this.data[columnIndex][rowIndex]; 
    }
    deleteColumn(columnIndex: number) { 
        this.data.splice(columnIndex, 1); 
        this.width -= 1; 
    }

    scaleUp(factor: number) { 
        for (let i in this.data) { 
            for (let a in this.data[i]) { 
                this.data[i][a] *= factor; 
            } 
        } 
    }
    scaledUp(factor: number) { //returns a scaled up version of the matrix, instead of directly modifying it
        const returnMatrix = new matrix(); //create new matrix object, and scale it up
        for (let i = 0; i != this.width; i += 1 ) { 
            const column = this.getColumn(i)
            const columnCopy = JSON.parse(JSON.stringify(column))
            returnMatrix.addColumn(columnCopy); 
        }
        for (let i in returnMatrix.data) { //scale up
            for (let a in returnMatrix.data[i]) { 
                returnMatrix.data[i][a] *= factor; 
            } 
        }  
        return returnMatrix;
    }

    translateMatrix(x: number, y: number, z: number) {
        for (let i = 0; i != this.width; i += 1 ) { 
            const column = this.getColumn(i)
            this.setValue(i, 0, column[0] + x);
            this.setValue(i, 1, column[1] + y);
            this.setValue(i, 2, column[2] + z);
        }
    }

    copy() {
        const copyMatrix = new matrix();
        for (let i = 0; i != this.width; i += 1 ) { 
            const column = this.getColumn(i)
            const columnCopy = JSON.parse(JSON.stringify(column))
            copyMatrix.addColumn(columnCopy); 
        }
        return copyMatrix;
    }

    constructor() { };
}

const multiplyMatrixs = (m1: matrix, m2: matrix) => {
    //check that m1.width == m2.height, the result matrix will be m1.height x m2.width
    //create result matrix:
    const resultMatrix = new matrix();
    const rMatrixHeight = m1.height;
    const rMatrixWidth = m2.width;

    for (let _ = 0; _ != rMatrixWidth; _ += 1) {
        const newColumn: number[] = [];
        for (let __ = 0; __ != rMatrixHeight; __ += 1) { 
            newColumn.push(0); 
        }
        resultMatrix.addColumn(newColumn);
    }

    //now loop through each element in the result matrix with the rowIndex and columnIndex, and calculate it
    let columnIndex = 0;
    while (columnIndex != resultMatrix.width) {
        let rowIndex = 0;
        while (rowIndex != resultMatrix.height) {
            //these 2 should be the same length
            const currentRow = m1.getRow(rowIndex); 
            const currentColumn = m2.getColumn(columnIndex);

            let value = 0;
            let i = 0;
            while (i != currentRow.length) { 
                value += currentRow[i] * currentColumn[i]; i += 1; 
            }
            resultMatrix.setValue(columnIndex, rowIndex, value);

            rowIndex += 1;
        }
        columnIndex += 1;
    }

    return resultMatrix 
}

const toRadians = (angle: number) => { 
    return angle * (Math.PI / 180); 
}
const toDegrees = ( angle: number ) => {
    return angle * 57.2958;
}
const sin = (num: number) => { 
    return Math.sin(toRadians(num)) 
}
const cos = (num: number) => { 
    return Math.cos(toRadians(num)) 
}

const distanceBetween = (p1: number[], p2: number[]) => {
    //first use pythagoruses thoerm to get the bottom diagonal
    const bottomDiagonal = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[2] - p1[2]) ** 2)
    const distance = Math.sqrt(bottomDiagonal ** 2 + (p2[1] - p1[1]) ** 2);
    return distance;
}

const calculateRotationMatrix = (rotationX: number, rotationY: number, rotationZ: number) => {
    //XYZ Euler rotation, Source: https://support.zemax.com/hc/en-us/articles/1500005576822-Rotation-Matrix-and-Tilt-About-X-Y-Z-in-OpticStudio
    //Just using the rotation matrix formula, look at Research/xyzrotationmatrix.jpeg for more info

    const [rX, rY, rZ] = [(rotationX % 360), (rotationY % 360), (rotationZ % 360)];

    //calculate iHat, jHat and kHat (x, y, z axis)
    const iHat = [cos(rY) * cos(rZ), cos(rX) * sin(rZ) + sin(rX) * sin(rY) * cos(rZ), sin(rX) * sin(rZ) - cos(rX) * sin(rY) * cos(rZ)]; //x-axis (iHat)
    const jHat = [-(cos(rY)) * sin(rZ), cos(rX) * cos(rZ) - sin(rX) * sin(rY) * sin(rZ), sin(rX) * cos(rZ) + cos(rX) * sin(rY) * sin(rZ)]; //y-axis (jHat)
    const kHat = [sin(rY), -(sin(rX)) * cos(rY), cos(rX) * cos(rY)]; //z-axis (kHat)

    //Set the unit vectors onto the singular rotation matrix
    const rotationMatrix = new matrix();
    rotationMatrix.addColumn(iHat);
    rotationMatrix.addColumn(jHat);
    rotationMatrix.addColumn(kHat);

    return rotationMatrix;
}

const eulerToQuaternion = (euler: XYZ ) => {
    //USED THIS FORMULA: https://automaticaddison.com/how-to-convert-euler-angles-to-quaternions-using-python/
    const [eX, eY, eZ] = [toRadians(euler.x), toRadians(euler.y), toRadians(euler.z)];

    const qx = Math.sin(eX/2) * Math.cos(eY/2) * Math.cos(eZ/2) - Math.cos(eX/2) * Math.sin(eY/2) * Math.sin(eZ/2);
    const qy = Math.cos(eX/2) * Math.sin(eY/2) * Math.cos(eZ/2) + Math.sin(eX/2) * Math.cos(eY/2) * Math.sin(eZ/2);
    const qz = Math.cos(eX/2) * Math.cos(eY/2) * Math.sin(eZ/2) - Math.sin(eX/2) * Math.sin(eY/2) * Math.cos(eZ/2);
    const qw = Math.cos(eX/2) * Math.cos(eY/2) * Math.cos(eZ/2) + Math.sin(eX/2) * Math.sin(eY/2) * Math.sin(eZ/2);

    const quaternion: XYZW = { x: qx, y: qy, z: qz, w: qw };
    return quaternion;
}
const quaternionToEuler = ( x: number, y: number, z: number, w: number ) => { //not reliable as there are 2 euler solutions for a quaternion
    //USED THE IMPLEMENTATION HERE (LINE 810): https://github.com/infusion/Quaternion.js/blob/master/quaternion.js
    const euler = { x: 0, y: 0, z: 0 };

    const t = 2 * (w * y - z * x);
    euler.x = toDegrees(Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)));
    euler.y = toDegrees(t >= 1 ? Math.PI / 2 : (t <= -1 ? -Math.PI / 2 : Math.asin(t)));
    euler.z = toDegrees(Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)));

    return euler
}

const multiplyQuaternions = (q1: XYZW, q2: XYZW) : XYZW => {
    const [x1, y1, z1, w1] = [q1.x, q1.y, q1.z, q1.w];
    const [x2, y2, z2, w2] = [q2.x, q2.y, q2.z, q2.w];

    const w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    const x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    const y = w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2;
    const z = w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2;
    
    return { x: x, y: y, z: z, w: w };
}
const multiplyQuaternionVector = (q: XYZW, v: XYZ): XYZ => {
    const qConjugate = { x: -q.x, y: -q.y, z: -q.z, w: q.w };
    const q2 = { x: v.x, y: v.y, z: v.z, w: 0 };
    const resQ =  multiplyQuaternions( multiplyQuaternions(q, q2), qConjugate );
    return { x: resQ.x, y: resQ.y, z: resQ.z };
}





 
//OBJECTS
//All shapes are subclasses of class Shape, because an object is just a collection of it's points
//When the camera renders the object is just needs its Physical Matrix (points relative to the origin), so the subclasses are purely for constructing the shape
class Shape
{
    name?: string = undefined;

    //Construction
    pointMatrix = new matrix(); //pointMatrix is constructed in the subclasses
    
    //Rotation
    rotation: XYZ = { x: 0, y: 0, z: 0 };
    quaternion: XYZW = { x: 0, y: 0, z: 0, w: 1 };

    updateQuaternion() {
        const [rX, rY, rZ] = [(this.rotation.x % 360), (this.rotation.y % 360), (this.rotation.z % 360)]
        this.quaternion = eulerToQuaternion( Vector(rX, rY, rZ) );
        this.updateMatrices();
    }

    //Physical (as if the shape was being rendered around the origin)
    physicalMatrix = new matrix();
    scale = 1;
    updatePhysicalMatrix() {
        //Rotate pointMatrix around origin with quaternion, https://stackoverflow.com/questions/4870393/rotating-coordinate-system-via-a-quaternion
        
        this.physicalMatrix = new matrix();
        for (let i = 0; i != this.pointMatrix.width; i += 1) {
            const point = this.pointMatrix.getColumn(i);
            const pointVector = { x: point[0], y: point[1], z: point[2] };
            const rotatedVector = multiplyQuaternionVector(this.quaternion, pointVector);
            const rotatedPoint = [ rotatedVector.x, rotatedVector.y, rotatedVector.z ];
            this.physicalMatrix.addColumn(rotatedPoint);
        }
        
        this.physicalMatrix.scaleUp(this.scale);
    }

    //Rendering
    position: XYZ = { x: 0, y: 0, z: 0 };
    translateLocal( x: number, y: number, z: number ) { //translates position, based on local rotation
        let movementVector = Vector(x, y, z);
        let translationVector = multiplyQuaternionVector(this.quaternion, movementVector);

        this.position.x += translationVector.x;
        this.position.y += translationVector.y;
        this.position.z += translationVector.z;
    }

    showOutline: boolean = false;
    showPoints: boolean = false;
    faces: { pointIndexes: number[], colour: string }[]  = []; //stores the indexes of the points (columns) in the physicalMatrix
    showFaceIndexes: boolean = false;

    updateMatrices() {
        this.updatePhysicalMatrix();
    }

    clone() {
        const newShape = new Shape();
        newShape.name = this.name;
        newShape.pointMatrix = this.pointMatrix.copy();
        newShape.rotation = JSON.parse(JSON.stringify(this.rotation));  
        newShape.scale = this.scale;
        newShape.physicalMatrix = this.physicalMatrix.copy();
        newShape.position = JSON.parse(JSON.stringify(this.position));
        newShape.showOutline = this.showOutline;
        newShape.showPoints = this.showPoints;
        newShape.faces = JSON.parse(JSON.stringify(this.faces));
        newShape.showFaceIndexes = this.showFaceIndexes;
        
        return newShape;
    }
}

class Box extends Shape
{
    //populate the pointMatrix, once we have done that we just call updateRotationMatrix() and updatePhysicalMatrix()
    //after populating pointMatrix, we need to update the edges, and faceIndexes

    constructor(width: number, height: number, depth: number)
    {
        super();
        
        this.pointMatrix = new matrix();
        this.pointMatrix.addColumn([0, 0, 0]);
        this.pointMatrix.addColumn([width, 0, 0]);
        this.pointMatrix.addColumn([width, height, 0]);
        this.pointMatrix.addColumn([0, height, 0]);
        this.pointMatrix.addColumn([0, 0, depth]);
        this.pointMatrix.addColumn([width, 0, depth]);
        this.pointMatrix.addColumn([width, height, depth]);
        this.pointMatrix.addColumn([0, height, depth]);

        const [centeringX, centeringY, centeringZ] = [-(width / 2), -(height / 2), -(depth / 2)];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    private setFaces()
    {
        //hardcoded values since the points of the shape won't move in relation to each other
        this.faces = [
            { pointIndexes: [0, 1, 2, 3], colour: "#ff0000" },
            { pointIndexes: [1, 2, 6, 5], colour: "#00ff00" },
            { pointIndexes: [2, 3, 7, 6], colour: "#0000ff" },
            
            { pointIndexes: [0, 1, 5, 4], colour: "#ffff00" },
            { pointIndexes: [0, 3, 7, 4], colour: "#00ffff" },
            { pointIndexes: [4, 5, 6, 7], colour: "#ff00ff" },
        ]
    }
}

class SquareBasedPyramid extends Shape
{
    constructor(bottomSideLength: number, height: number)
    {
        super();

        this.pointMatrix = new matrix();
        this.pointMatrix.addColumn([0, 0, 0]);
        this.pointMatrix.addColumn([bottomSideLength, 0, 0]);
        this.pointMatrix.addColumn([bottomSideLength, 0, bottomSideLength]);
        this.pointMatrix.addColumn([0, 0, bottomSideLength]);
        this.pointMatrix.addColumn([bottomSideLength / 2, height, bottomSideLength / 2]);

        const [centeringX, centeringY, centeringZ] = [-(bottomSideLength / 2), -(height / 2), -(bottomSideLength / 2)];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    private setFaces()
    {
        this.faces = [
            { pointIndexes: [0, 1, 2, 3], colour: "#ff0000" },

            { pointIndexes: [0, 1, 4], colour: "#00ff00" },
            { pointIndexes: [1, 2, 4], colour: "#0000ff" },
            { pointIndexes: [2, 3, 4], colour: "#ffff00" },
            { pointIndexes: [0, 3, 4], colour: "#00ffff" },
        ]
    }
}

class TriangularPrism extends Shape
{
    constructor(width: number, height: number, depth: number)
    {
        super();

        this.pointMatrix = new matrix();
        this.pointMatrix.addColumn([0, 0, 0]);
        this.pointMatrix.addColumn([width, 0, 0]);
        this.pointMatrix.addColumn([width / 2, height, 0]);
        this.pointMatrix.addColumn([0, 0, depth]);
        this.pointMatrix.addColumn([width, 0, depth]);
        this.pointMatrix.addColumn([width / 2, height, depth]);
        
        const [centeringX, centeringY, centeringZ] = [-(width / 2), -(height / 2), -(depth / 2)];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    private setFaces()
    {
        this.faces = [
            { pointIndexes: [0, 1, 2], colour: "#ff0000" },

            { pointIndexes: [0, 2, 5, 3], colour: "#00ff00" },
            { pointIndexes: [0, 1, 4, 3], colour: "#0000ff" },
            { pointIndexes: [1, 2, 5, 4], colour: "#ffff00" },

            { pointIndexes: [3, 4, 5], colour: "#00ffff" }
        ]
    }
}

class ElongatedOctahedron extends Shape
{
    constructor (width: number, height: number, depth: number)
    {
        super();
        this.pointMatrix = new matrix();

        this.pointMatrix.addColumn([0, 0, 0]); //bottom point
        this.pointMatrix.addColumn([-width / 2, height / 3, 0]); //first pyramid
        this.pointMatrix.addColumn([0, height / 3, depth / 2]);
        this.pointMatrix.addColumn([width / 2, height / 3, 0]);
        this.pointMatrix.addColumn([0, height / 3, -depth / 2]);
        this.pointMatrix.addColumn([-width / 2, height / 3 * 2, 0]); //cuboid in center
        this.pointMatrix.addColumn([0, height / 3 * 2, depth / 2]);
        this.pointMatrix.addColumn([width / 2, height / 3 * 2, 0]);
        this.pointMatrix.addColumn([0, height / 3 * 2, -depth / 2]);
        this.pointMatrix.addColumn([0, height, 0]); //top point

        const [centeringX, centeringY, centeringZ] = [0, -(height / 2), 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    private setFaces()
    {
        this.faces = [
            { pointIndexes: [0, 1, 2], colour: "#ffffff" },
            { pointIndexes: [0, 2, 3], colour: "#c4c4c4" },
            { pointIndexes: [0, 3, 4], colour: "#ffffff" },
            { pointIndexes: [0, 4, 1], colour: "#c4c4c4" },

            { pointIndexes: [1, 5, 6, 2], colour: "#c4c4c4" },
            { pointIndexes: [2, 6, 7, 3], colour: "#ffffff" },
            { pointIndexes: [3, 7, 8, 4], colour: "#c4c4c4" },
            { pointIndexes: [4, 8, 5, 1], colour: "#ffffff" },

            { pointIndexes: [9, 5, 6], colour: "#ffffff" },
            { pointIndexes: [9, 6, 7], colour: "#c4c4c4" },
            { pointIndexes: [9, 7, 8], colour: "#ffffff" },
            { pointIndexes: [9, 8, 5], colour: "#c4c4c4" }
        ]
    }
}





 
//CAMERA
class Grid extends Shape {
    constructor (length: number) {
        super();
        this.pointMatrix = new matrix();

        this.pointMatrix.addColumn([-length, 0, 0])
        this.pointMatrix.addColumn([length, 0, 0])

        this.pointMatrix.addColumn([0, -length, 0])
        this.pointMatrix.addColumn([0, length, 0])

        this.pointMatrix.addColumn([0, 0, -length])
        this.pointMatrix.addColumn([0, 0, length])

        const [centeringX, centeringY, centeringZ] = [0, 0, 0]
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    private setFaces() {
        this.faces = [
            { pointIndexes: [0, 1], colour: "#ff0000" },
            { pointIndexes: [2, 3], colour: "#00ff00" },
            { pointIndexes: [4, 5], colour: "#0000ff" },
        ]
    }
}

class Camera {
    absPosition: {x: number, y: number} = { x: 0, y: 0 };
    position: XYZ = { x: 0, y: 0, z: 0 };
    zoom = 1;

    worldRotation: XYZ = { x: 0, y: 0, z: 0 };
    worldRotationMatrix = new matrix();

    showScreenOrigin: boolean = false;

    transformMatrix( points: matrix, objectPosition: XYZ ) { //returns the points after applying the transformations to them.
        let cameraObjectMatrix = points.copy();

        cameraObjectMatrix.translateMatrix(objectPosition.x, objectPosition.y, objectPosition.z); //translate for object's position

        cameraObjectMatrix.translateMatrix(-this.position.x, -this.position.y, -this.position.z) //translating relative to camera's position

        cameraObjectMatrix = multiplyMatrixs(this.worldRotationMatrix, cameraObjectMatrix); //rotate for global world rotation

        cameraObjectMatrix.translateMatrix(-this.absPosition.x, -this.absPosition.y, 0); //translate for absolute position

        cameraObjectMatrix.scaleUp(this.zoom); //scale for zoom

        return cameraObjectMatrix;
    }

    render(objects: Shape[]) {  
        const objectData: { object: Shape, screenPoints: matrix, center: number[] }[] = [];
        for (let objectIndex = 0; objectIndex != objects.length; objectIndex += 1) {
            //transform the object's physicalMatrix to how the camera would see it:
            const object = objects[objectIndex];
            
            const cameraObjectMatrix = this.transformMatrix(object.physicalMatrix, { x: object.position.x, y: object.position.y, z: object.position.z });

            //work out center of shape by finding average of all points
            let [totalX, totalY, totalZ] = [0, 0, 0];
            for (let i = 0; i != cameraObjectMatrix.width; i += 1) {
                const point = cameraObjectMatrix.getColumn(i);
                totalX += point[0]; totalY += point[1]; totalZ += point[2];
            }
            const [averageX, averageY, averageZ] = [totalX / cameraObjectMatrix.width, totalY / cameraObjectMatrix.width, totalZ / cameraObjectMatrix.width];
            const center = [averageX, averageY, averageZ];

            objectData.push( { object: object, screenPoints: cameraObjectMatrix, center: center} )
        }

        //sort objects based on distance to the position point:
        const positionPoint = [0, 0, -50000];
        const sortedObjects: { object: Shape, screenPoints: matrix, center: number[] }[] = this.sortFurthestDistanceTo(objectData, "center", positionPoint);

        for (let objectIndex = 0; objectIndex != sortedObjects.length; objectIndex += 1 ) {
            const object = sortedObjects[objectIndex].object;
            const screenPoints = sortedObjects[objectIndex].screenPoints;

            //draw faces of shape in correct order, by finding the center and sorting based on distance to the position point
            let objectFaces: { points: number[][], center: number[], colour: string, faceIndex: number }[] = [];

            //populate the array
            for (let i = 0; i != object.faces.length; i += 1) {
                //if face is transparent then just don't render it
                if (object.faces[i].colour == "") { continue; }

                let points: number[][] = [];
                for (let a = 0; a != object.faces[i].pointIndexes.length; a += 1) { 
                    points.push(screenPoints.getColumn(object.faces[i].pointIndexes[a])); 
                }

                //find center by getting average of all points
                let [totalX, totalY, totalZ] = [0, 0, 0];
                for (let a = 0; a != points.length; a += 1) { 
                    totalX += points[a][0]; totalY += points[a][1]; totalZ += points[a][2]; 
                }
                const [averageX, averageY, averageZ] = [totalX / points.length, totalY / points.length, totalZ / points.length]
                const center = [averageX, averageY, averageZ];
                objectFaces.push( { points: points, center: center, colour: object.faces[i].colour, faceIndex: i } );
            }

            const sortedFaces = this.sortFurthestDistanceTo(objectFaces, "center", positionPoint); //sort based on distance from center to (0, 0, -50000)

            for (let i = 0; i != sortedFaces.length; i += 1) {
                const facePoints = sortedFaces[i].points;
                let colour = sortedFaces[i].colour;
                drawShape(facePoints, colour, object.showOutline);
                
                if (object.showFaceIndexes == true) {
                    plotPoint(sortedFaces[i].center, "#000000", String(sortedFaces[i].faceIndex)); 
                }
            }

            //draw points last so you can see them through the faces
            if (object.showPoints == true) {
                for (let i = 0; i != screenPoints.width; i += 1) {
                    const point = screenPoints.getColumn(i);
                    plotPoint(point, "#000000", String(i));
                }
            }
        }

        if (this.showScreenOrigin == true) {
            plotPoint([-this.absPosition.x, -this.absPosition.y], "#000000"); //a visual marker of where it will zoom into
        }

        return sortedObjects;
    }
    private sortFurthestDistanceTo(list: any[], positionKey: string, positionPoint: number[]) {
        const sortedList: any[] = [];
        const listCopy = list;
        while (listCopy.length != 0) {
            let furthestDistanceIndex = 0;
            for (let i = 0; i != listCopy.length; i += 1) {
                if (distanceBetween(positionPoint, listCopy[i][positionKey]) > distanceBetween(positionPoint, listCopy[furthestDistanceIndex][positionKey])) { furthestDistanceIndex = i; }
            }
            sortedList.push(listCopy[furthestDistanceIndex]);
            listCopy.splice(furthestDistanceIndex, 1);
        }
        return sortedList
    }

    updateRotationMatrix() { //rotate entire world 
        const [rX, rY, rZ] = [(this.worldRotation.x % 360), (this.worldRotation.y % 360), (this.worldRotation.z % 360)]
        this.worldRotationMatrix = calculateRotationMatrix(rX, rY, rZ);
    }

    renderGrid() {
        const gridLength = 50000 * this.zoom;
        const grid = new Grid(gridLength);
        this.render([grid]);
    }

    enableMovementControls(canvasID: string, rotation?: boolean, movement?: boolean, zoom?: boolean, limitRotation?: boolean) {
        if (rotation == undefined) { rotation = true; }
        if (movement == undefined) { movement = true; }
        if (zoom == undefined) { zoom = true; }
        if (limitRotation == undefined) { limitRotation = false; }

        let mouseDown = false;
        let altDown = false;
        let previousX = 0;
        let previousY = 0;
        document.getElementById(canvasID)!.onpointerdown = ($e) => { mouseDown = true; previousX = $e.clientX; previousY = $e.clientY; } //changed these from mousedown to pointerdown, to be more mobile friendly
        document.getElementById(canvasID)!.onpointerup = () => { mouseDown = false; }
        document.getElementById(canvasID)!.onpointermove = ($e) => {
            if (mouseDown == false) { return; }

            let [differenceX, differenceY] = [$e.clientX - previousX, $e.clientY - previousY];
            if (altDown == true && movement == true) {
                this.absPosition.x -= differenceX / this.zoom;
                this.absPosition.y += differenceY / this.zoom;
            }
            else if (rotation == true) {
                const absX = Math.abs(this.worldRotation.x) % 360
                if (absX > 90 && absX < 270)  { differenceX *= -1; }
                this.worldRotation.x -= differenceY / 5;
                this.worldRotation.y -= differenceX / 5;

                if (this.worldRotation.x < -90 && limitRotation == true) { //to limit rotation, user can only rotate around 90 degrees on x axis
                    this.worldRotation.x = -90; 
                } 
                else if (this.worldRotation.x > 0 && limitRotation == true) { 
                    this.worldRotation.x = 0; 
                }

                this.updateRotationMatrix()
            }
            [previousX, previousY] = [$e.clientX, $e.clientY];
        }
        document.addEventListener('keydown', ($e) => { //don't need to use event listeners on the mouse since it is attached to the canvas element
            const key = $e.key.toLowerCase();
            if (key == "alt") { altDown = true; }
        });
        document.addEventListener('keyup', ($e) => {
            const key = $e.key.toLowerCase();
            if (key == "alt") { altDown = false; }
        });

        //Zooming in/out
        document.getElementById(canvasID)!.onwheel = ($e: any) => {
            if (zoom == false) { return; }
            if (this.zoom < 0) { this.zoom = $e.wheelDeltaY / 1000; }
            this.zoom -= $e.wheelDeltaY / 1000;
        }
    }

    constructor() { 
        this.updateRotationMatrix();
    };
}