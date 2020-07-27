# Education Horizons Group Dev Challenge
This project was completed as a part of the Education Horizons interview process.

## Brief 
* The project must display an image containing every permutation of the colours red, green and blue, on the 0->255 colour interval in steps of 8
* The project must display the colours in a way that is aesthetically pleasing or interesting.
* Must not greatly impact browser performance.
* Be implemented in React.

## Usage

In the terminal run:
1. ```npm install```
2. ```npm run start```

## Solution

The entire system is written in JS and React, there is no backend. When the page first loads it creates an array containing all the colours and sorts it by hue. This array is then offset vertically by an amount defined by a symbolic function evaluated using mathjs. When the symbolic function is changed only the offset needs to be recalculated, the base colour matrix does not need to be re-initialised, making the system snappy enough to keep on the frontend.

## Further Development
Given more time I would have liked to have implemented error handling, loading spinners, and added support for asymtompic/imaginary functions.