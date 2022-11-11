/* src/vertex-shader.wgsl */

var<private> pos : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
);

var<private> uvs : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(0.0, 1.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0)
);

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) frag_coord: vec2<f32>,
};

@vertex fn main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    return VertexOutput(
        vec4(pos[vertex_index], 1.0, 1.0),
        vec2(uvs[vertex_index])
    );
}

/* EOF */