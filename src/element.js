/* src/element.js */

import vertexCode from './vertex-shader.wgsl' assert { type: 'text' }

export default class WebGPUFragmentShaderElement extends HTMLCanvasElement {

    // private state

    #init = null           // Promise
    #fragmentCode = null   // string
    #adapter = null        // GPUAdapter
    #device = null         // GPUDevice
    #context = null        // GPUCanvasContext
    #uniforms = null       // object
    #uniformsBuffer = null // GPUBuffer
    #uniformsBindGroup = null // GPUBindGroup
    #pipelineLayout = null // GPURenderPipelineLayout
    #pipeline = null       // GPURenderPipeline


    // Custom Elements API

    static observedAttributes = [ 'width', 'height', 'entry' ]

    attributeChangedCallback ( name, oldValue, newValue ) {

        console.debug( 'attribute %s changed:', name, oldValue, newValue )

        switch ( name ) {
            case 'width':
            case 'height':
                this.#uniforms?.viewportSize.set( [ this.width, this.height ] )
                break;
           case 'entry':
                if ( this.#init ) {
                    this.#init = null
                    this.destroy()
                    this.init()
                }
                break;
        }

    }

    connectedCallback () {

        console.debug( 'connected' )

        if ( ! this.autoinit || this.#init !== null ) return

        this.init().then( () => {

            this.render()

            console.debug( 'autoinit success' )

        } ).catch( err => {

            console.error( 'autoinit failed:', err )

        } )

    }

    disconnectedCallback () {

        console.debug( 'disconnected' )

        this.destroy()

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

    get uniforms () {

        return this.#uniforms

    }

    //

    async init () {

        return this.#init ??= ( async () => {

            this.classList.remove( 'initialized' )
            this.classList.remove( 'error' )

            if ( ! WebGPUFragmentShaderElement.supported ) {
                throw new Error( 'WebGPU is not supported' )
            }

            this.#fragmentCode ??= await WebGPUFragmentShaderElement.getFragmentShaderSource( this )
            if ( ! this.#fragmentCode ) {
                throw new Error( 'No fragment shader source' )
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

            this.#device.pushErrorScope( 'validation' )

            // create render pipeline ...

            // builtin uniforms buffer

            this.#uniforms = new class {

                buffer = new ArrayBuffer( 12 )

                #viewportSize = new Float32Array( this.buffer, 0, 2 )

                #time = new Float32Array( this.buffer, 8, 1 )

                get viewportSize () {
                    return this.#viewportSize
                }

                get time () {
                    return this.#time[ 0 ]
                }

                set time ( value ) {
                    this.#time[ 0 ] = value
                }

            }

            this.#uniforms.viewportSize.set( [ this.width, this.height ] )

            this.#uniformsBuffer = this.#device.createBuffer( {
                size: this.#uniforms.buffer.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            } )

            const uniformsBindGroupLayout = this.#device.createBindGroupLayout( {
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: {
                            type: 'uniform',
                            hasDynamicOffset: false,
                            minBindingSize: 0
                        },
                    }
                ]
            } )

            this.#uniformsBindGroup = this.#device.createBindGroup( {
                layout: uniformsBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: this.#uniformsBuffer },
                    }
                ]
            } )

            // user uniforms ...

            // user buffer ...

            // shaders

            const vertexShader = this.#device.createShaderModule( { code: vertexCode } )

            const fragmentShader = this.#device.createShaderModule( { code: this.#fragmentCode } )

            // pipeline

            this.#pipelineLayout = this.#device.createPipelineLayout( {
                bindGroupLayouts: [ uniformsBindGroupLayout ]
            } )

            this.#pipeline = this.#device.createRenderPipeline( {
                layout: this.#pipelineLayout,
                vertex: {
                    module: vertexShader,
                    entryPoint: 'main',
                },
                fragment: {
                    module: fragmentShader,
                    entryPoint: this.entry,
                    targets: [ { format: navigator.gpu.getPreferredCanvasFormat() } ],
                },
                primitive: { topology: 'triangle-strip' },
            } )

            const err = await this.#device.popErrorScope()

            if ( err ) throw err

            this.#context ??= this.getContext( 'webgpu' )

            this.#context.configure( {
                alphaMode: 'opaque',
                device: this.#device,
                format: navigator.gpu.getPreferredCanvasFormat(),
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            } )

            this.#device.lost.then( ( { reason } ) => {
                if ( reason === 'destroyed' ) {
                    this.#context?.unconfigure()
                    this.dispatchEvent( new Event( 'destroyed' ) )
                } else {
                    this.#init = null
                    this.init()
                }
            } )

            this.classList.add( 'initialized' )

            this.dispatchEvent( new Event( 'initialized' ) )

            console.debug( 'initialized' )

        } )().catch( err => {

            this.classList.add( 'error' )

            this.destroy()

            throw err

        } )


    }

    destroy () {

        this.#uniformsBuffer?.destroy()
        this.#device?.destroy()
        this.#context?.unconfigure()

        this.#init = null
        this.#fragmentCode = null
        this.#adapter = null
        this.#device = null
        this.#context = null
        this.#uniforms = null
        this.#uniformsBuffer = null
        this.#uniformsBindGroup = null
        this.#pipelineLayout = null
        this.#pipeline = null

        this.classList.remove( 'initialized' )

    }

    async render () {

        this.#device.queue.writeBuffer(
                this.#uniformsBuffer, 0,
                this.#uniforms.buffer, 0,
                this.#uniforms.buffer.byteLength )

        const encoder = this.#device.createCommandEncoder()

        const texture = this.#context.getCurrentTexture()

        const pass = encoder.beginRenderPass( { colorAttachments: [ {
            view: texture.createView(),
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
        } ] } )

        pass.setPipeline( this.#pipeline )
        pass.setBindGroup( 0, this.#uniformsBindGroup )
        pass.setViewport( 0, 0, this.width, this.height, 0, 1 )
        pass.setScissorRect( 0, 0, this.width, this.height )
        pass.draw( 4 )
        pass.end()

        this.#device.queue.submit( [ encoder.finish() ] )

        return this.#device.queue.onSubmittedWorkDone()

    }

    // static

    static supported = 'gpu' in navigator

    static defineElement ( name = 'webgpu-fragment-shader' ) {

        console.debug( 'defining custom element:', name )

        customElements.define( name, WebGPUFragmentShaderElement, { extends: 'canvas' } )
        
        customElements.whenDefined( name ).then( () => {
        
            console.debug( 'webgpu-fragment-shader is deifned' )
        
        } )

    }

    static async getFragmentShaderSource ( el ) {

        const scripts = el.querySelectorAll( 'script[type="x-shader/x-wgsl"]' )

        const sources = await Promise.all( [ ...scripts ].map( script => {

            if ( script.src ) {

                return fetch( script.src ).then( res => {

                    if ( ! res.ok ) throw new Error( 'Failed to fetch fragment shader source: ' + script.src )

                    return res.text()

                } )

            } else {

                return Promise.resolve( script.textContent )

            }


        } ) )

        return sources.join( '\n' )

    }

}

/* EOF */
