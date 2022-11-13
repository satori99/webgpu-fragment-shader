import WebGPUFragmentShaderElement from './src/element.js'


//
// define the custom element if the import url has a 'define' query param
//

const url = new URL( '', import.meta.url )

if ( url.searchParams.has( 'define' ) ) {

    const tagName = url.searchParams.get( 'define' ) || 'webgpu-fragment-shader'

    WebGPUFragmentShaderElement.defineElement( tagName )

    customElements.whenDefined( tagName ).then( () => {

        console.debug( 'defined custom element:', tagName )

    } )

}

export default WebGPUFragmentShaderElement