import WebGPUFragmentShaderElement from './src/element.js'


//
// define the custom element if the import url has a 'define' query param
//

const url = new URL( '', import.meta.url )
if ( url.searchParams.has( 'define' ) ) {
    const tagName = url.searchParams.get( 'define' ) || 'webgpu-frgament-shader'
    WebGPUFragmentShaderElement.define( tagName )
}

export default WebGPUFragmentShaderElement