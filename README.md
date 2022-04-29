# Lego Builder
### A project to learn about virtual grids, and to test my 3D Engine

URL: [https://aryaask.github.io/LegoBuilder/Source](https://aryaask.github.io/LegoBuilder/Source)

Here are some previews:

![Preview 1](Previews/Preview1.png?raw=true)

![Preview 2](Previews/Preview2.png?raw=true)

## How it works

### Virtual Grid
In this project I used a concept called virtual grid, instead of physically creating the grid through a model, I dynamically create when the grid is initalized, as the user gives the number of colums/layers/rows.

**This dramatically improves performance, since the renderer does not need to calculate the point transformation for every point**, and instead just calculates the 8 points which construct the plane. The only reason I need the grid is to place blocks, so I don't actually need to be able to see it.

To calculate the position on the grid where the the user clicks, I generate virtual face centers, which are just calculated by:
1. Get points on opposite corners of plane on the 2D screen, this will correspond with width/height/depth, and will be a vector
2. Divide by the num of columns/layers/rows, and this will give you the interpolation vector
3. Then just multiply these interpolation vectors by the position on the grid, where you are trying to generate the center for.

You can then use these to find where the user clicks on the grid, by just checking which point (face center) is closest to the click position.


### Blocks
The block models are created in the Shape Builder, and are very basic, literally just rectangular shapes. 

A cell is a 1 * 1 * 1 area of a block, I have set the cellSize (width and depth) to 100, and the cellHeight to 150. You can see this as the Single Block (1 * 1 * 1) has the same dimensions. **When creating the block model in the Shape Builder, make sure to make each cell the same dimensions**

The block attachment is added dynamically when constructing the block model, it just uses the gridModel and adds a block attachment model on top of the basic block model. Here is the Block Attachment model:\
![Block Attachment](Previews/BlockAttachment.png?raw=true)


### The grid
The grid is stored as a 3D array, you specify the width, height and depth when initializing the grid, and then you just use functions on top of the LegoGrid class. The grid will convert the grid position, in format {column, layer, row}, into actual 3D coordinates using the virtual grid, look above.

To render a block:
1. When creating a new block, it gets a unique id, and is added to a dictionary of blocks, called *blocks*. This dictionary contains every block currently placed on the grid.
2. In 3D array in the grid only stores the id of a block, if there is no block then it is set to -1. Then you can just loop through the grid, get the id, then use that id in the blocks dictionary, and that block object will contains it's own position.
3. Once you have the position in the grid, you can convert that to an actual position using the formula above, then just render the block as a model using camera.render();

- To prevent blocks from creating copies of themselves, I have made it so that once you have placed a block you cannot replace it, it must be deleted and a new block must be placed.