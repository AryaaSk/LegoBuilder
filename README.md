# Lego Builder

## Another project to test my 3D Engine
URL: [Lego Builder](https://aryaask.github.io/LegoBuilder/Source)

Here are some previews:

![Preview 1](Previews/Preview1.png?raw=true)

![Preview 2](Previews/Preview2.png?raw=true)

## How it works
### Block Models
The block models are created in the Shape Builder, and are very basic, literally just rectangular shapes. A cell is a 1 * 1 * 1 area of a block, I have set the cellSize (width and depth) to 100, and the cellHeight to 150. You can see this as the Single Block (1 * 1 * 1) has the same dimensions.

They do not include the block attachment piece, that is added dynamically based on how many cells there are in the block. This is what the block attachment piece looks like:\
![Block Attachment](Previews/BlockAttachment.png?raw=true)

**When creating new block, you must specifiy how many cells it will take up, and input them as vectors from the starting cell, which will be at *{ column: 0, layer: 0, row: 0 }***

### The grid
The grid is stored as a 3D array, you specify the width, height and depth when initializing the grid, and then you just use functions on top of the LegoGrid class. The grid will convert the grid position, in format {column, layer, row}, into actual 3D coordinates by calculating the distance between 2 corners of the board, and interpolating based on the number of columns / layers / rows.

To render a block:
1. When creating a new block, it gets a unique id, and is added to a dictionary of blocks, called *blocks*. This dictionary contains every block currently placed on the grid.
2. In 3D array in the grid only stores the id of a block, if there is no block then it is set to -1. Then you can just loop through the grid, get the id, then use that id in the blocks dictionary, and that block object will contains it's own position.
3. Once you have the position in the grid, you can convert that to an actual position using the formula above, then just render the block as a model using camera.render();

- To prevent blocks from creating copies of themselves, I have made it so that once you have placed a block you cannot replace it, it must be deleted and a new block must be placed.

### *This is quite confusing to explain, so some of the explanations may be quite unclear*

## TODO:
- Add delete block option, I actally already have the function, but I'm not 100% sure how to implement it in a user-friendly way.