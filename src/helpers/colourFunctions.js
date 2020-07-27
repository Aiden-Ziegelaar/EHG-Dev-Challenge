import { parse } from "mathjs"

// Creates a matrix containing all RGB colours consisting of 
//   all colour combinations that can be made out of the RGB
//   values 0 -> 255 stepping by 8 places each time.
async function buildColourMatrix() {
    let totalSize = 32*32*32;
    // create an array containing steps
    let stepArr = new Array(32)
    for(let i = 0; i < 32; i++){
        stepArr[i] = ((i+1)<<3) - 1;
    }

    // We create the colours in a 4D space of size 3x32x32x32, 
    //    iterating red along x, green along y, and blue along z. 
    //    This is flattened along (3)x(32x32x32) to a 2D array
    console.log("Creating colour array")
    let rgbArr = new Array(totalSize);
    for(let i = 0; i < totalSize; i+=1) {
        rgbArr[i] = new Array(3);
        // iterate red every item
        rgbArr[i][0] = stepArr[i % 32]; // bitwise & for fast modulo power of 2
        // iterate green every row
        rgbArr[i][1] = stepArr[(i>>5) % 32];
        // iterate blue every plane
        rgbArr[i][2] = stepArr[i>>10]; // no & modulo as bitshift never reaches >32
        // set alpha to 255
    }
    return rgbArr
}

// Gets the hue*6*255 from an RGB colour array, because this is being 
//    used for comparison we can omit the divide by 255 and 6
//    to increase performance.
function rgbToHue(rgbColour) {
    let r = rgbColour[0]
    let g = rgbColour[1]
    let b = rgbColour[2]
    let max = Math.max(r,g,b);
    let min = Math.min(r,g,b);
    if(min === max) return 0;
    let delta = max - min;
    let h=0;
    switch(max) {
        case r : h = (g - b) / delta + (g < b ? 1530 : 0); break;
        case g : h = (b - r) / delta + 510; break;
        case b : h = (r - g) / delta + 1020; break;
        default : h = 0;
    }
    return h;
}

// Compares the hue of two RGB colours provided as Array(3).
function hueCompare(a, b) {
    let a_h = rgbToHue(a);
    let b_h = rgbToHue(b);
    return a_h-b_h;
}

// Creates an RGB array that takes the hue and luminescence of each 
//   colour created in the function buildColourMatrix and sorts them
//   into a 128 by 256 point 1D matrix arranged horizontally by
//   luminescence and vertically by hue. To cheat a little we'll 
//   combine four similar hues to create one row before sorting
//   for luminescence.
async function hueSorter() {
    console.log("Building Colours")
    let colourMatrix = await buildColourMatrix();
    console.log("Hue Sorting")
    colourMatrix = colourMatrix.sort(hueCompare);
    console.log("Done")
    return colourMatrix;
}

// Takes a curve and a colour matrix and shifts the coloums of the 
//    colour matrix to match the map.
async function applyOffset(offsetMap, colourMatrix) {
    // Find max and min
    let max = Math.max(...offsetMap);
    let min = Math.min(...offsetMap);
    // prevent Div/0 errors
    if(max === min) return colourMatrix;
    // iterate over columns of a 256x128 image 
    for(let i = 0; i < 256; i++) {
        let offset = Math.round((offsetMap[i]-min)/(max-min)*128);
        if (offset !== 0 && offset !== 255) {
            // fill temp array with contents of column
            let tempArr= new Array(128);
            for(let j = 0; j < 128; j++){
                tempArr[j] = colourMatrix[j*256+i];
            }
            tempArr = tempArr.slice(offset, 255).concat(tempArr.slice(0,offset));
            // fill colour matrix column back in
            for(let j = 0; j < 128; j++){
                colourMatrix[j*256+i] = tempArr[j];
            }
        }

    }
    return colourMatrix
}

// Takes a symblic string and returns an evaluation of the function over
//     -1 to 1 in 256 steps.
function generateOffset(symbolicString) {
    let symbolicFunction = parse(symbolicString);
    let outputArr = new Array(256);
    for(let i = 0; i < 256; i++) {
        let out = symbolicFunction.evaluate({"x": (i/128)-1})
        outputArr[i] = out;
    }
    return outputArr;
}

// Flattens an RGB matrix into a format acceptable to 
//    canvas image data. canvasData is the .getImageData
//    of the canvas to be modified to prevent reallocation.
async function flattenToRGBA(canvasData, colourMatrix) {
    for(var i = 0; i < 32*32*32; i++) {
        let s = 4 * i;  // calculate the index in the array
        let x = colourMatrix[i];  // the RGB values
        canvasData[s] = x[0];
        canvasData[s + 1] = x[1];
        canvasData[s + 2] = x[2];
        canvasData[s + 3] = 255;  // fully opaque
    }
    return canvasData;
}

export {
    hueSorter,
    buildColourMatrix,
    flattenToRGBA,
    generateOffset,
    applyOffset
}