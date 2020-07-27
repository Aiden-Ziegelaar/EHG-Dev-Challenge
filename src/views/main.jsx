import React from 'react';

import { Header } from "../components/header"
import { FunctionGenerator } from "../components/funcGen"
import { Footer } from "../components/footer"
import { flattenToRGBA, hueSorter } from "../helpers/colourFunctions"

// Ties all the components together into a main view

function Main() {
    hueSorter().then((value) => {
        console.log(value);
        flattenToRGBA(new Uint8ClampedArray(32*32*32*4), value
        ).then((value)=>{console.log(value)})});
    return (
        <div>
            <Header></Header>
            <FunctionGenerator></FunctionGenerator>
            <Footer></Footer>
        </div>
    );
}

export {
    Main
}