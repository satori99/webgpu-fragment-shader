import WebGPUFragmentShaderElement from './src/element.js'


//
// define the custom element if the import url has a 'define' query param
//

const url = new URL( '', import.meta.url )
if ( url.searchParams.has( 'define' ) ) {
    WebGPUFragmentShaderElement.define( url.searchParams.get( 'define' ) )
}

export default WebGPUFragmentShaderElement
