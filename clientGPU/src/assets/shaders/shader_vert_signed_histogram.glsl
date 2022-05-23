#version 300 es

layout (location=0) in vec2 a_position;
layout (location=1) in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  gl_Position = vec4((vec3(a_position, 1)).xy, 0, 1);
  v_texCoord = a_texCoord;
}
