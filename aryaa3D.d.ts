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
    c.fillRect(gridX(p[0]), gridY(p[1]), 10, 10);

    if (label != undefined) {
        c.font = `${20 * dpi}px Arial`;
        c.fillText(label, gridX(p[0])! + 10, gridY(p[1])! + 10);
    }
}
const drawLine = (p1: number[], p2: number[], colour: string) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    //points will be in format: [x, y]
    //I need to convert the javascript x and y into actual grid x and y
    c.strokeStyle = colour;
    c.beginPath()
    c.moveTo(gridX(p1[0]), gridY(p1[1]))
    c.lineTo(gridX(p2[0]), gridY(p2[1]));
    c.stroke();
}
const drawShape = (points: number[][], colour: string, outline?: boolean, outlineColour?: string) => {
    if (c == undefined) { console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes"); return; }
    if (points.length == 2) { drawLine(points[0], points[1], colour); return; }
    else if (points.length < 3) { console.error("Cannot draw shape, need at least 3 points to draw a shape"); return; }
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(gridX(points[0][0]), gridY(points[0][1]));
    for (let pointsIndex = 1; pointsIndex != points.length; pointsIndex += 1) { 
        c.lineTo(gridX(points[pointsIndex][0]), gridY(points[pointsIndex][1])) 
    }
    c.closePath();
    c.fill();

    if (outline == true) { 
        const lineColour = (outlineColour == undefined) ? "#000000" : outlineColour;
        if (outlineColour != undefined) {  }
        for (let i = 1; i != points.length; i += 1)
        { drawLine(points[i - 1], points[i], lineColour); }
        drawLine(points[points.length - 1], points[0], lineColour); //to cover the line from last point to first point
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
const Euler = (x: number, y: number, z: number): XYZ => { //same thing, but different name
    return Vector(x, y, z);
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

    constructor( data?: number[][] ) {
        if (data != undefined) {
            this.data = data;
            this.width = data.length;
            try { this.height = data[0].length; }
            catch { this.height = 0; }
        }
    };
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

    showOutline() {
        for (let i = 0; i != this.faces.length; i += 1) {
            this.faces[i].outline = true;
        }
    }
    hideOutline() {
        for (let i = 0; i != this.faces.length; i += 1) {
            this.faces[i].outline = false;
        }
    }
    setColour = (colour: string) => {
        for (let i = 0; i != this.faces.length; i += 1) {
            this.faces[i].colour = colour;
        }
    }

    showPoints: boolean = false;
    faces: { pointIndexes: number[], colour: string, outline?: boolean }[]  = []; //stores the indexes of the points (columns) in the physicalMatrix
    showFaceIndexes: boolean = false;

    updateMatrices() {
        this.updatePhysicalMatrix();
    }

    clone() {
        const newShape = new Shape();
        newShape.name = this.name;

        newShape.pointMatrix = this.pointMatrix.copy();
        newShape.rotation = JSON.parse(JSON.stringify(this.rotation));  
        newShape.quaternion = JSON.parse(JSON.stringify(this.quaternion));
        newShape.physicalMatrix = this.physicalMatrix.copy();
        newShape.scale = this.scale;

        newShape.position = JSON.parse(JSON.stringify(this.position));
        newShape.faces = JSON.parse(JSON.stringify(this.faces));
        newShape.showPoints = this.showPoints;
        newShape.showFaceIndexes = this.showFaceIndexes;

        return newShape;
    }
}
const mergeShapes = (shape1: Shape, shape2: Shape) => { //copies the shapes from their physical matrices, so how they look on the screen
    const newShape = new Shape();
    newShape.pointMatrix = shape1.physicalMatrix.copy();
    newShape.faces = JSON.parse(JSON.stringify(shape1.faces));

    //Combining second shape
    const pointIndexOffset = newShape.pointMatrix.width; //first need to get the width of the current point matrix, we will offset the new shape's face's point indexes using this 

    for (let i = 0; i != shape2.physicalMatrix.width; i += 1) { //combine the 2 physical matrices
        const point = shape2.physicalMatrix.getColumn(i);
        newShape.pointMatrix.addColumn(point);
    }

    const faces = JSON.parse(JSON.stringify(shape2.faces)); //offsetting shape2's pointIndexes so that the faces are still linked to the same point
    for (let i = 0; i != faces.length; i += 1) {
        for (let a = 0; a != faces[i].pointIndexes.length; a += 1) {
            faces[i].pointIndexes[a] += pointIndexOffset;
        }
    }

    newShape.faces = newShape.faces.concat(faces);

    newShape.updateMatrices();
    return newShape;
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
//not a proper sphere, I just tried to create it using the Shape Builder.
class Sphere extends Shape {
    constructor (radius: number) {
        super();

        this.pointMatrix = new matrix();
        const points = [[-60,-82.5,20],[-20,-82.5,60],[20,-82.5,60],[60,-82.5,20],[60,-82.5,-20],[20,-82.5,-60],[-20,-82.5,-60],[-60,-82.5,-20],[-84,-49.50000000000001,28],[-28,-49.50000000000001,84],[28,-49.50000000000001,84],[84,-49.50000000000001,28],[84,-49.50000000000001,-28],[28,-49.50000000000001,-84],[-28,-49.50000000000001,-84],[-84,-49.50000000000001,-28],[-100,-16.5,33.6],[-33.6,-16.5,100],[33.6,-16.5,100],[100,-16.5,33.6],[100,-16.5,-33.6],[33.6,-16.5,-100],[-33.6,-16.5,-100],[-100,-16.5,-33.6],[-84,49.50000000000001,28],[-28,49.50000000000001,84],[28,49.50000000000001,84],[84,49.50000000000001,28],[84,49.50000000000001,-28],[28,49.50000000000001,-84],[-28,49.50000000000001,-84],[-84,49.50000000000001,-28],[-60,82.5,20],[-20,82.5,60],[20,82.5,60],[60,82.5,20],[60,82.5,-20],[20,82.5,-60],[-20,82.5,-60],[-60,82.5,-20],[-100,16.5,33.6],[-33.6,16.5,100],[33.6,16.5,100],[100,16.5,33.6],[100,16.5,-33.6],[33.6,16.5,-100],[-33.6,16.5,-100],[-100,16.5,-33.6],[0,-104.50000000000001,0],[0,104.50000000000001,0]];
        for (let i = 0; i != points.length; i += 1)
        { this.pointMatrix.addColumn(points[i]); }

        const [centeringX, centeringY, centeringZ] = [0, 0, 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();

        this.pointMatrix.scaleUp( radius / 104.5 ); //The model has a radius of 104.5
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{pointIndexes:[0,8,15,7],colour:"#c4c4c4"},{pointIndexes:[7,6,14,15],colour:"#c4c4c4"},{pointIndexes:[6,5,13,14],colour:"#c4c4c4"},{pointIndexes:[5,4,12,13],colour:"#c4c4c4"},{pointIndexes:[4,3,11,12],colour:"#c4c4c4"},{pointIndexes:[3,2,10,11],colour:"#c4c4c4"},{pointIndexes:[2,1,9,10],colour:"#c4c4c4"},{pointIndexes:[1,0,8,9],colour:"#c4c4c4"},{pointIndexes:[9,8,16,17],colour:"#c4c4c4"},{pointIndexes:[8,15,23,16],colour:"#c4c4c4"},{pointIndexes:[15,14,22,23],colour:"#c4c4c4"},{pointIndexes:[14,13,21,22],colour:"#c4c4c4"},{pointIndexes:[13,12,20,21],colour:"#c4c4c4"},{pointIndexes:[12,11,19,20],colour:"#c4c4c4"},{pointIndexes:[11,10,18,19],colour:"#c4c4c4"},{pointIndexes:[10,9,17,18],colour:"#c4c4c4"},{pointIndexes:[18,17,41,42],colour:"#c4c4c4"},{pointIndexes:[17,16,40,41],colour:"#c4c4c4"},{pointIndexes:[16,23,47,40],colour:"#c4c4c4"},{pointIndexes:[23,22,46,47],colour:"#c4c4c4"},{pointIndexes:[22,21,45,46],colour:"#c4c4c4"},{pointIndexes:[21,20,44,45],colour:"#c4c4c4"},{pointIndexes:[20,19,43,44],colour:"#c4c4c4"},{pointIndexes:[19,18,42,43],colour:"#c4c4c4"},{pointIndexes:[44,28,27,43],colour:"#c4c4c4"},{pointIndexes:[43,27,26,42],colour:"#c4c4c4"},{pointIndexes:[42,26,25,41],colour:"#c4c4c4"},{pointIndexes:[41,25,24,40],colour:"#c4c4c4"},{pointIndexes:[40,24,31,47],colour:"#c4c4c4"},{pointIndexes:[47,31,30,46],colour:"#c4c4c4"},{pointIndexes:[46,30,29,45],colour:"#c4c4c4"},{pointIndexes:[45,29,28,44],colour:"#c4c4c4"},{pointIndexes:[30,29,37,38],colour:"#c4c4c4"},{pointIndexes:[29,28,36,37],colour:"#c4c4c4"},{pointIndexes:[28,27,35,36],colour:"#c4c4c4"},{pointIndexes:[27,26,34,35],colour:"#c4c4c4"},{pointIndexes:[26,25,33,34],colour:"#c4c4c4"},{pointIndexes:[25,24,32,33],colour:"#c4c4c4"},{pointIndexes:[24,31,39,32],colour:"#c4c4c4"},{pointIndexes:[31,30,38,39],colour:"#c4c4c4"},{pointIndexes:[7,48,6],colour:"#c4c4c4"},{pointIndexes:[6,48,5],colour:"#c4c4c4"},{pointIndexes:[5,48,4],colour:"#c4c4c4"},{pointIndexes:[4,48,3],colour:"#c4c4c4"},{pointIndexes:[3,48,2],colour:"#c4c4c4"},{pointIndexes:[2,48,1],colour:"#c4c4c4"},{pointIndexes:[1,48,0],colour:"#c4c4c4"},{pointIndexes:[0,48,7],colour:"#c4c4c4"},{pointIndexes:[38,49,39],colour:"#c4c4c4"},{pointIndexes:[49,38,37],colour:"#c4c4c4"},{pointIndexes:[37,49,36],colour:"#c4c4c4"},{pointIndexes:[36,49,35],colour:"#c4c4c4"},{pointIndexes:[35,49,34],colour:"#c4c4c4"},{pointIndexes:[34,49,33],colour:"#c4c4c4"},{pointIndexes:[33,49,32],colour:"#c4c4c4"},{pointIndexes:[49,32,39],colour:"#c4c4c4"}];
    }
}
//not a proper cylinder, it's actually just an octagonal prism
class Cylinder extends Shape {
    constructor (radius: number, height: number) {
        super();

        this.pointMatrix = new matrix();
        const points = [[-100,0,33.6],[-33.6,0,100],[33.6,0,100],[100,0,33.6],[100,0,-33.6],[33.6,0,-100],[-33.6,0,-100],[-100,0,-33.6],[-100,height,33.6],[-33.6,height,100],[33.6,height,100],[100,height,33.6],[100,height,-33.6],[33.6,height,-100],[-33.6,height,-100],[-100,height,-33.6]];
        for (let i = 0; i != points.length; i += 1) { //scale the x and z coordinates of each point by (radius / 100) to give it the correct radius
            const point = points[i];
            point[0] *= (radius / 100);
            point[2] *= (radius / 100);
            this.pointMatrix.addColumn(point); 
        }

        const [centeringX, centeringY, centeringZ] = [0, -(height / 2), 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{pointIndexes:[9,8,15,14,13,12,11,10],colour:"#c4c4c4",outline:true},{pointIndexes:[4,5,6,7,0,1,2,3],colour:"#c4c4c4",outline:true},{pointIndexes:[9,1,0,8],colour:"#c4c4c4",outline:true},{pointIndexes:[8,0,7,15],colour:"#c4c4c4",outline:true},{pointIndexes:[15,7,6,14],colour:"#c4c4c4",outline:true},{pointIndexes:[14,6,5,13],colour:"#c4c4c4",outline:true},{pointIndexes:[13,5,4,12],colour:"#c4c4c4",outline:true},{pointIndexes:[12,4,3,11],colour:"#c4c4c4",outline:true},{pointIndexes:[11,3,2,10],colour:"#c4c4c4",outline:true},{pointIndexes:[10,2,1,9],colour:"#c4c4c4",outline:true}];
    }
}
//again, not a proper cone, it's actually just an octagonal pyramid
class Cone extends Shape {
    constructor ( radius: number, height: number ) {
        super();

        this.pointMatrix = new matrix();
        const points = [[-100,0,33.6],[-33.6,0,100],[33.6,0,100],[100,0,33.6],[100,0,-33.6],[33.6,0,-100],[-33.6,0,-100],[-100,0,-33.6],[0,height,0],[0,0,0]];
        for (let i = 0; i != points.length; i += 1) { //scale the x and z coordinates of each point by (radius / 100) to give it the correct radius
            const point = points[i];
            point[0] *= (radius / 100);
            point[2] *= (radius / 100);
            this.pointMatrix.addColumn(point); 
        }

        const [centeringX, centeringY, centeringZ] = [0, -(height / 2), 0];
        this.pointMatrix.translateMatrix(centeringX, centeringY, centeringZ);

        this.setFaces();
        this.updateMatrices();
    }
    setFaces() {
        this.faces = [{pointIndexes:[0,1,2,3,4,5,6,7],colour:"#c4c4c4",outline:true},{pointIndexes:[8,3,2],colour:"#c4c4c4",outline:true},{pointIndexes:[8,2,1],colour:"#c4c4c4",outline:true},{pointIndexes:[8,1,0],colour:"#c4c4c4",outline:true},{pointIndexes:[8,0,7],colour:"#c4c4c4",outline:true},{pointIndexes:[8,7,6],colour:"#c4c4c4",outline:true},{pointIndexes:[8,6,5],colour:"#c4c4c4",outline:true},{pointIndexes:[8,5,4],colour:"#c4c4c4",outline:true},{pointIndexes:[8,4,3],colour:"#c4c4c4",outline:true}];
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
    position: XYZ = { x: 0, y: 0, z: 0 };
    zoom = 1;

    absPosition: {x: number, y: number} = { x: 0, y: 0 };
    showScreenOrigin: boolean = false;

    renderObjectData( objectData: { object: Shape, screenPoints: matrix, center: number[]; }[], positionPoint: number[] ) {
        //sort objects based on distance to the position point
        const sortedObjects: { object: Shape, screenPoints: matrix, center: number[] }[] = this.sortFurthestDistanceTo(objectData, "center", positionPoint);

        for (const data of sortedObjects) {
            const object = data.object;
            const screenPoints = data.screenPoints;

            //draw faces of shape in correct order, by finding the center and sorting based on distance to the position point
            let objectFaces: { points: number[][], center: number[], colour: string, faceIndex: number, outline?: boolean }[] = [];

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
                objectFaces.push( { points: points, center: center, colour: object.faces[i].colour, faceIndex: i, outline: object.faces[i].outline} );
            }

            const sortedFaces = this.sortFurthestDistanceTo(objectFaces, "center", positionPoint); //sort based on distance from center to (0, 0, -50000)

            for (let i = 0; i != sortedFaces.length; i += 1) {
                const facePoints = sortedFaces[i].points;
                let colour = sortedFaces[i].colour;

                //find if the face has outline == true, or if it is false / undefined.
                drawShape(facePoints, colour, sortedFaces[i].outline );
                
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
            plotPoint([0, 0], "#000000"); //a visual marker of where it will zoom into
        }
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

    constructor () { }
}


class AbsoluteCamera extends Camera {
    worldRotation: XYZ = Euler(0, 0, 0);
    worldRotationMatrix = new matrix();
    updateRotationMatrix() { //rotate entire world 
        const [rX, rY, rZ] = [(this.worldRotation.x % 360), (this.worldRotation.y % 360), (this.worldRotation.z % 360)]
        this.worldRotationMatrix = calculateRotationMatrix(rX, rY, rZ);
    }

    //RENDERING PIPLINE FOR ABSOLUTE MODE
    //generate 3D world, applies position and world rotation
    //translate by camera's position
    //translate by absPosition and scale points
    //sort objects/faces based on the cameraPoints
    transformPoints( points: matrix ) { //returns 2d coordinate of points, but keep z axis to sort faces
        let cameraPoints = points.copy();

        cameraPoints.translateMatrix(-this.position.x, -this.position.y, -this.position.z) //translating relative to camera's position

        cameraPoints = multiplyMatrixs(this.worldRotationMatrix, cameraPoints); //rotate for global world rotation

        cameraPoints.translateMatrix(-this.absPosition.x, -this.absPosition.y, 0); //translate for absolute position

        cameraPoints.scaleUp(this.zoom); //scale for zoom

        return cameraPoints;
    }

    render(objects: Shape[]) {
        const objectData: { object: Shape, screenPoints: matrix, center: number[] }[] = [];
        for (const object of objects) {

            let cameraPoints = object.physicalMatrix.copy(); //position of points in actual world
            cameraPoints.translateMatrix( object.position.x, object.position.y, object.position.z );
            cameraPoints = this.transformPoints( cameraPoints );

            //find center using cameraPoints
            let [totalx, totaly, totalz] = [0, 0, 0];
			for (let i = 0; i != cameraPoints.width; i += 1) {
                const point = cameraPoints.getColumn(i)
				totalx += point[0]; totaly += point[1]; totalz += point[2];
			}
			const pointTotal = cameraPoints.width
			const [averagex, averagey, averagez] = [ totalx / pointTotal, totaly / pointTotal, totalz / pointTotal ];
			const center = [ averagex, averagey, averagez ]
			
			//push to objectData
			objectData.push( { object: object, screenPoints: cameraPoints, center: center } )
        }

        //create a copy of object data before it gets wiped
        const objectDataCopy: { object: Shape, screenPoints: matrix, center: number[] }[] = [];
        for (const data of objectData) {
            objectDataCopy.push( { object: data.object.clone(), screenPoints: data.screenPoints.copy(), center: JSON.parse(JSON.stringify(data.center)) } );
        }

        this.renderObjectData( objectData, [0, 0, -50000] );

        return objectDataCopy;
    }

    renderGrid(colour?: boolean) {
        const gridLength = 50000 * this.zoom;
        const grid = new Grid(gridLength);
        if (colour != true) { grid.setColour("#000000"); }
        this.render([grid]);
    }

    enableMovementControls(canvasID: string, options?: { rotation?: boolean, movement?: boolean, zoom?: boolean, limitRotation?: boolean, limitRotationMin?: number, limitRotationMax?: number} ) {
        let [rotation, movement, zoom, limitRotation] = [true, true, true, false];
        let [limitRotationMin, limitRotationMax] = [0, -90];
        if (options?.rotation == false ) { rotation = false; }
        if (options?.movement == false ) { movement = false; }
        if (options?.zoom == false ) { zoom = false; }
        if (options?.limitRotation == true) { limitRotation = true; }
        if (options?.limitRotationMin != undefined) { limitRotationMin = options!.limitRotationMin; }
        if (options?.limitRotationMax != undefined) { limitRotationMax = options!.limitRotationMax; }

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

                if (this.worldRotation.x < limitRotationMax && limitRotation == true) { //to limit rotation, user can only rotate around 90 degrees on x axis
                    this.worldRotation.x = limitRotationMax;
                } 
                else if (this.worldRotation.x > limitRotationMin && limitRotation == true) { 
                    this.worldRotation.x = limitRotationMin; 
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
        super();
        this.updateRotationMatrix();
    };
}

class PerspectiveCamera extends Camera {
    nearDistance: number = 1000; //distance from camera to near plane, can also be used like a makeshift FOV value
    
    rotation: XYZ = Euler(0, 0, 0);
    rotationMatrix = new matrix();
    updateRotationMatrix() { //rotation matrix should be inverse of rotation, since the object's rotate around the camera
        const [rX, rY, rZ] = [-(this.rotation.x % 360), -(this.rotation.y % 360), -(this.rotation.z % 360)]
        this.rotationMatrix = calculateRotationMatrix(rX, rY, rZ);
    }

    //RENDERING PIPELINE FOR PERSPECTIVE MODE
    //generate 3D world, applies position and rotates points around camera
    //prepare verteces, check if the object is behind the camera (if so then don't render), and if some are behind then clip the vertece to the near plane
    //find vector from camera -> (each vertex of object)
    //find where the vector intersects the viewport, by scaling the vector with ( nearDistance / vector.z ), find coordinate in world with: (camera.position) + (scaled vector)
    //Then translate it by the camera's x and y position to negate the scaling difference since the viewport is not in the same position as the camera.
    //Attach the point's original z coordinate so it can be sorted by distance to camera later
    //Then sort objects/faces based on cameraPoints

    transformPoints( points: matrix ) {
        const cameraPoint = [this.position.x, this.position.y, this.position.z];
        let cameraPoints = points.copy();

        //prepare the points
        let pointsInFrontOfCamera = false;
        for (let i = 0; i != cameraPoints.width; i += 1) {
            const vertex = cameraPoints.getColumn(i);
            if ( vertex[2] > cameraPoint[2] ) { pointsInFrontOfCamera = true; }

            if (vertex[2] <= cameraPoint[2]) {
                cameraPoints.setValue( i, 2, cameraPoint[2] + 1 ); //clip point to the camera'z so it doesn't get inverted
            }
        }
        if ( pointsInFrontOfCamera == false ) { return new matrix(); } //no point rendering if all the points are behind the camera

        const intersectionPoints = new matrix();
        for (let i = 0; i != cameraPoints.width; i += 1) {
            const vertex = cameraPoints.getColumn(i);
    
            //calculate intersection, normalize z-axis to (camera.position.z + nearDistance), the position of the viewport
            const vector = [ vertex[0] - cameraPoint[0], vertex[1] - cameraPoint[1], vertex[2] - cameraPoint[2] ];
            const zScaleFactor = this.nearDistance / vector[2];
            const intersectionVector = [  vector[0] * zScaleFactor, vector[1] * zScaleFactor, vector[2] * zScaleFactor ];
            const intersectionPoint = [ cameraPoint[0] + intersectionVector[0], cameraPoint[1] + intersectionVector[1], cameraPoint[2] + intersectionVector[2]]; //z coordinate will be normalized, and will be changed later
            
            intersectionPoint[0] -= cameraPoint[0];
            intersectionPoint[1] -= cameraPoint[1];

            intersectionPoints.addColumn( intersectionPoint );
        }
        cameraPoints = intersectionPoints;

        cameraPoints.translateMatrix(-this.absPosition.x, -this.absPosition.y, 0); //translate for absolute position
        cameraPoints.scaleUp(this.zoom); //scale for zoom

        return cameraPoints;
    }

    render(objects: Shape[]) {
        const cameraPoint = [this.position.x, this.position.y, this.position.z];

        const objectData: { object: Shape, screenPoints: matrix, center: number[] }[] = [];
        for (const object of objects) {

            const worldPoints = object.physicalMatrix.copy();
            worldPoints.translateMatrix(object.position.x, object.position.y, object.position.z);
            //rotate points around camera
            for (let i = 0; i != worldPoints.width; i += 1) {
                const vertex = worldPoints.getColumn(i);
                let cameraVertexVector = new matrix([ [ vertex[0] - cameraPoint[0], vertex[1] - cameraPoint[1], vertex[2] - cameraPoint[2] ] ]); //find vector from camera -> vertex
                cameraVertexVector = multiplyMatrixs( this.rotationMatrix, cameraVertexVector ); //rotate using our rotation matrix
                const rotatedVector = cameraVertexVector.getColumn(0);
                worldPoints.setValue( i, 0, cameraPoint[0] + rotatedVector[0] ); //translate the object relative to the camera
                worldPoints.setValue( i, 1, cameraPoint[1] + rotatedVector[1] );
                worldPoints.setValue( i, 2, cameraPoint[2] + rotatedVector[2] );
            }

            const cameraPoints = this.transformPoints( worldPoints );

            //find center using cameraPoints
            let [totalx, totaly, totalz] = [0, 0, 0];
			for (let i = 0; i != cameraPoints.width; i += 1) {
                cameraPoints.setValue( i, 2, worldPoints.getColumn(i)[2] ); //attach original z-coordinate

                const point = cameraPoints.getColumn(i)
				totalx += point[0]; totaly += point[1]; totalz += point[2];
			}
			const pointTotal = cameraPoints.width
			const [averagex, averagey, averagez] = [ totalx / pointTotal, totaly / pointTotal, totalz / pointTotal ];
			const center = [ averagex, averagey, averagez ]
			
			//push to objectData
			objectData.push( { object: object, screenPoints: cameraPoints, center: center } )
        }


        //create a copy of object data before it gets wiped
        const objectDataCopy: { object: Shape, screenPoints: matrix, center: number[] }[] = [];
        for (const data of objectData) {
            objectDataCopy.push( { object: data.object.clone(), screenPoints: data.screenPoints.copy(), center: JSON.parse(JSON.stringify(data.center)) } );
        }

        const positionPoint = [ cameraPoint[0], cameraPoint[1], cameraPoint[2] - this.nearDistance ]; //this seems to work the best
        this.renderObjectData( objectData, positionPoint );

        return objectDataCopy;
    }



    enableMovementControls(canvasID: string, options?: { rotation?: boolean, zoom?: boolean, limitRotation?: boolean, limitRotationMin?: number, limitRotationMax?: number} ) {
        let [rotation, zoom, limitRotation] = [true, true, false];
        let [limitRotationMin, limitRotationMax] = [0, -90];
        if (options?.rotation == false ) { rotation = false; }
        if (options?.zoom == false ) { zoom = false; }
        if (options?.limitRotation == true ) { limitRotation = true; }
        if (options?.limitRotationMin != undefined) { limitRotationMin = options!.limitRotationMin; }
        if (options?.limitRotationMax != undefined) { limitRotationMax = options!.limitRotationMax; }

        let mouseDown = false;
        let previousX = 0;
        let previousY = 0;
        document.getElementById(canvasID)!.onpointerdown = ($e) => { mouseDown = true; previousX = $e.clientX; previousY = $e.clientY; } //changed these from mousedown to pointerdown, to be more mobile friendly
        document.getElementById(canvasID)!.onpointerup = () => { mouseDown = false; }
        document.getElementById(canvasID)!.onpointermove = ($e) => {
            if (mouseDown == false || rotation == false) { return; }

            let [differenceX, differenceY] = [$e.clientX - previousX, $e.clientY - previousY];
            const absX = Math.abs(this.rotation.x) % 360
            if (absX > 90 && absX < 270)  { differenceX *= -1; }
            this.rotation.x -= differenceY / 20;
            this.rotation.y -= differenceX / 20;

            if (this.rotation.x < limitRotationMax && limitRotation == true) { //to limit rotation, user can only rotate around 90 degrees on x axis
                this.rotation.x = limitRotationMax;
            } 
            else if (this.rotation.x > limitRotationMin && limitRotation == true) { 
                this.rotation.x = limitRotationMin; 
            }
            this.updateRotationMatrix();
            [previousX, previousY] = [$e.clientX, $e.clientY];
        }

        //Zooming in/out
        document.getElementById(canvasID)!.onwheel = ($e: any) => {
            if (zoom == false) { return; }
            if (this.zoom < 0) { this.zoom = $e.wheelDeltaY / 1000; }
            this.zoom -= $e.wheelDeltaY / 1000;
        }
    }



    constructor () {
        super();
        this.updateRotationMatrix();
    }

}