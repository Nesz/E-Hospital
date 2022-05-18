#version 300 es

precision highp float;
uniform highp sampler3D u_image;
uniform float ww;
uniform float wc;
uniform float slope;
uniform float intercept;
uniform float currentSlice;
uniform float maxSlice;
uniform int orientation; // 0 - x, 1 - y, 2 - z
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  // color is packed into red channel
  float color;
  if (orientation == 0) {
    color = float(texture(u_image, vec3(currentSlice/maxSlice, v_texCoord.x, v_texCoord.y)).r);
  }
  else if (orientation == 1) {
    color = float(texture(u_image, vec3(v_texCoord.x, currentSlice/maxSlice, v_texCoord.y)).r);
  }
  else if (orientation == 2) {
    color = float(texture(u_image, vec3(v_texCoord.x, v_texCoord.y, currentSlice/maxSlice)).r);
  }
  color = color * slope + intercept;
  color = (color - (wc - 0.5)) / (max(ww, 1.0)) + 0.5;
  color = clamp(color, 0.0, 1.0);

  fragColor = vec4(color, color, color, 1.0);
}
