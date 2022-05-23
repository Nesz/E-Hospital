#version 300 es

precision highp float;
precision highp isampler3D;
precision highp isampler2D;

in vec2 v_texCoord;
out int fragColor;

uniform isampler3D u_image;
uniform float u_currentSlice;
uniform float u_maxSlice;
uniform int u_plane;

void main() {
  vec3 coords;

  switch (u_plane) {
    case 0: coords = vec3(v_texCoord.x, v_texCoord.y, u_currentSlice/u_maxSlice); break;
    case 1: coords = vec3(u_currentSlice/u_maxSlice, v_texCoord.x, v_texCoord.y); break;
    case 2: coords = vec3(v_texCoord.x, u_currentSlice/u_maxSlice, v_texCoord.y); break;
  }

  fragColor = texture(u_image, coords).r;
  //fragColor = vec4(texture(u_image, coords).rgba);
  //fragColor = vec4(1.0, 1.0, 0.0, 1.0);
}
