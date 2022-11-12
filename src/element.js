/* src/element.js */

import vertexCode from './vertex-shader.wgsl' assert { type: 'text' }

export default class WebGPUFragmentShaderElement extends HTMLCanvasElement {

    // private state

    #init = null    // Promise
    #adapter = null // GPUAdapter
    #device = null  // GPUDevice
    #context = null // GPUCanvasContext

    // Custom Elements API

    static observedAttributes = [ 'width', 'height', 'entry' ]

    attributeChangedCallback ( name, oldValue, newValue ) {

        console.debug( 'attribute %s changed:', name, oldValue, newValue )

    }

    // Properties

    get autoinit () {
        return this.hasAttribute( 'autoinit' )
    }

    set autoinit ( value ) {
        if ( value ) {
            this.setAttribute( 'autoinit', '' )
        } else {
            this.removeAttribute( 'autoinit' )
        }
    }

    get entry () {
        return this.getAttribute( 'entry' ) || 'main'
    }

    set entry ( value ) {
        this.setAttribute( 'entry', value )
    }

    //

    async init () {

        return this.#init ??= ( async () => {

            if ( ! WebGPUFragmentShaderElement.supported ) {
                throw new Error( 'WebGPU is not supported' )
            }

            this.#adapter ??= await navigator.gpu.requestAdapter()
            if ( ! this.#adapter ) {
                throw new Error( 'No GPU adapter found' )
            }

            this.#device = await this.#adapter.requestDevice()
            if ( ! this.#device ) {
                // adapter was lost before device was available
                this.#init = null
                this.#adapter = null
                return this.init()
            }

            this.#context = this.getContext( 'webgpu' )

            this.#context.configure( {
                alphaMode: 'opaque',
                device: this.#device,
                format: navigator.gpu.getPreferredCanvasFormat(),
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            } )

            this.#device.lost.then( ( { reason } ) => {
                if ( reason === 'destroyed' ) {
                    this.#context.unconfigure()
                    this.dispatchEvent( new Event( 'destroyed' ) )
                } else {
                    this.init()
                }
            } )

            this.dispatchEvent( new Event( 'initialized' ) )

        } )

    }

    destroy () {

        this.#device?.destroy()

        this.#init = null
        this.#adapter = null
        this.#device = null
        this.#context = null

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
