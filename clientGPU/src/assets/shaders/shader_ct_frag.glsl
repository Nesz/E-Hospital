#version 300 es

precision highp float;
precision highp sampler3D;
precision highp sampler2D;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler3D u_image;
uniform sampler2D u_lut;
uniform float u_ww;
uniform float u_wc;
uniform float u_slope;
uniform float u_intercept;
uniform float u_currentSlice;
uniform float u_maxSlice;
uniform int u_plane;
uniform bool u_inverted;

void main() {
  // color is packed into red channel
  float color;
  vec3 coords, lut_color;

  switch (u_plane) {
    case 0: coords = vec3(v_texCoord.x, v_texCoord.y, u_currentSlice/u_maxSlice); break;
    case 1: coords = vec3(u_currentSlice/u_maxSlice, v_texCoord.x, v_texCoord.y); break;
    case 2: coords = vec3(v_texCoord.x, u_currentSlice/u_maxSlice, v_texCoord.y); break;
  }

  color = texture(u_image, coords).r;
  color = color * u_slope + u_intercept;
  color = (color - (u_wc - 0.5)) / (max(u_ww, 1.0)) + 0.5;
  color = clamp(color, 0.0, 1.0);

  lut_color = vec3(texture(u_lut, vec2(color, color)).rgb);

  if (u_inverted)
    fragColor = vec4(1.0 - lut_color.rgb, 1.0);
  else
    fragColor = vec4(lut_color.rgb, 1.0);
}

//D:\DICOM\manifest-1569606386674\CPTAC-CCRCC\C3L-00610\1.3.6.1.4.1.14519.5.2.1.6450.2626.644816927153083296275502824499\1.3.6.1.4.1.14519.5.2.1.6450.2626.240157728412440477938968449870
// 0 - top
// 1 - left
// 2 - right
// 3 - bottom
// 4 - front
// 5 - back
//[
//    "1.000000",
//    "0.000000",
//    "0.000000",
//    "0.000000",
//    "0.000000",
//    "-1.000000"
//]
