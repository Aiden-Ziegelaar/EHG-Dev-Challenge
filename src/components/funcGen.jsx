import React from 'react';
import { hueSorter, generateOffset, applyOffset, flattenToRGBA } from '../helpers/colourFunctions';

// creates the function generator component where all the magic happens

class FunctionGenerator extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            baseColourMatrix: null,
            modifiedColourMatrix: null,
            canvasRef: React.createRef(),
            canvasContext: null,
            symbolicFunction:  "sin(10x)",
            offsets: null
        }
    }

    // render override
    render () {
        return (
            <div className="horizontal-center">
                <div>
                    <canvas width="256" height="128" ref={this.state.canvasRef}/>
                </div>
                <br></br>
                <div className="function-gen">
                    <form className="pure-form-stacked">
                        <fieldset>
                            <legend>Enter Function</legend>
                            <input type="text" value={this.state.symbolicFunction} onChange={(e) => this.setState({symbolicFunction: e.target.value})}></input>
                            <div className="horizontal-center">
                                <button className="pure-button pure-button-primary horizontal-center" disabled={this.state.isLoading} onClick={(e) => {this.generateHandler(e)}}>Generate</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <p>Accepts a function that takes x as a parameter. Function must be real and exist on the interval -1 to 1.</p>
                <p>Some good examples include; x^2, x^3, abs(x), e^x and sin(10x) </p>
            </div>
        )
    }

    // handles the generate button being pressed
    generateHandler(e) {
        e.preventDefault()
        this.setState({isLoading: true})
        this.updateImage()
    }

    // Function to update the current image with a new symbolic equation
    async updateImage() {
        await this.setState({offsets: generateOffset(this.state.symbolicFunction)})
        applyOffset(this.state.offsets, Array.from(this.state.baseColourMatrix)).then( (value) => {
            this.setState({modifiedColourMatrix: value});
            flattenToRGBA(new Uint8ClampedArray(32*32*32*4), value).then((value)=>{
                let imgData = this.state.canvasContext.getImageData(0,0,256,128)
                for(let i = 0; i < 32*32*32*4; i++) {
                    imgData.data[i] = value[i];
                }
                this.state.canvasContext.putImageData(imgData, 0, 0);
                this.setState({isLoading: false})
            })
        })
    }

    // Make our first image load and create a ref to the base sorted image so we 
    //    don't need to regen it each time.
    async componentDidMount() {
        console.log(this.state.canvasRef)
        await this.setState({canvasContext: this.state.canvasRef.current.getContext('2d')})
        hueSorter().then((value) => {
            this.setState({baseColourMatrix: value})
        }).then((value)=> {
            this.updateImage()
        });
    }
}

export {
    FunctionGenerator
}