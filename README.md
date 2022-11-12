# webgpu-fragment-shader

This is an experimental WebGPU fragment shader custom canvas element.

It only uses native browser APIs and has no run-time or bundled dependencies.

## Use

First, add a script tag to your HTML page.

```html
<script type="module" src="https://github.satori99.com/webgpu-fragment-shader/webgpu-fragment-shader.js?define"></script>
```

Then add custom canvas elements to the page.

```html
<canvas is="webgpu-fragment-shader" autoinit>
  <script type="x-shader-x-wgsl">
  @fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    return vec4(uv, 0, 1);
  }
  </script>
</canvas>
```

Adding an `is="webgpu-fragment-shader"` attribute to a regular canvas tag turn it into a custom fragment shader element.
<figure>
  <canvas is="webgpu-fragment-shader" autoinit>
    <script type="x-shader-x-wgsl">
      @fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
        return vec4(uv, 0, 1);
      }
    </script>
  </canvas>
  <script type="module" src="https://github.satori99.com/webgpu-fragment-shader/webgpu-fragment-shader.js?define"></script>
  <figcaption>Fig1. Basic example</figcaption>
</figure>
