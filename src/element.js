/* src/element.js */

import vertexCode from './vertex-shader.wgsl' assert { type: 'text' }

export default class WebGPUFragmentShaderElement extends HTMLCanvasElement {

    // Custom Elements API

    static observedAttributes = [ 'width', 'height', 'entry-point' ]

    attributeChangedCallback ( name, oldValue, newValue ) {

        console.debug( 'attribute %s changed:', name, oldValue, newValue )

    }

    // Properties

    get entryPoint () {

        return this.getAttribute( 'entry-point' ) || 'main'

    }

    set entryPoint ( value ) {

        this.setAttribute( 'entry-point', value )

    }

    //

    async init () {
        
    }

    async destroy () {
        
    }

    async render () {
        
    }

    // static

    static supported = 'gpu' in navigator

    static define ( name = 'webgpu-fragment-shader' ) {

        customElements.define( name, WebGPUFragmentShaderElement, { extends: 'canvas' } )

    }

}

/* EOF */
