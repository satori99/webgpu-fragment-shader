/* src/element.js */

class WebGPUFragmentShaderElement extends HTMLCanvasElement {

    // Custom Elements API

    static observedAttributes = [ 'width', 'height', 'entry-point' ]

    attributeChangedCallback ( name, oldValue, newValue ) {

        console.debug( 'attribute %s changed:', name, oldValue, newValue );

    }

    // Properties

    get entryPoint () {

        return this.getAttribute( 'entry-point' ) || 'main'

    }

    set entryPoint ( value ) {

        this.setAttribute( 'entry-point', value );

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

        customElements.define( name, WebGPUFragmentShaderElement, { extends: 'canvas' } );

    }

}

/* EOF */

//
// define the custom element if the import url has a 'define' query param
//

const url = new URL( '', import.meta.url );
if ( url.searchParams.has( 'define' ) ) {
    const tagName = url.searchParams.get( 'define' ) || 'webgpu-frgament-shader';
    WebGPUFragmentShaderElement.define( tagName );
}

export { WebGPUFragmentShaderElement as default };
