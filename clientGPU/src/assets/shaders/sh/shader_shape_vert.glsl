#version 300 es

precision mediump float;
uniform mat3 u_matrix;

layout (location=0) in vec2 a_position;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, -1, 1);
}

//void main() {
//    //push the point along its normal by half thickness
//    vec2 p = a_position.xy + vec2(a_position * 3.0/2.0 * 1.5);
//    gl_Position = vec4((u_matrix * vec3(p, 1)).xy, -1, 1);
//}
