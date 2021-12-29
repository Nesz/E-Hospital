import { Uniforms } from "../services/shader.service";

export class Program {
  gl: WebGLProgram;
  uniforms: Uniforms;

  constructor(gl: WebGLProgram, uniforms: Uniforms) {
    this.gl = gl;
    this.uniforms = uniforms;
  }

  assignUniforms = (gl: WebGL2RenderingContext, data: any) => {
    for (const key of Object.keys(this.uniforms)) {
      const { type, location } = this.uniforms[key];
      if (type === 'i') {
        gl.uniform1i(location, data[key]);
      } else if (type === 'FLOAT') {
        gl.uniform1f(location, data[key]);
      } else if (type === 'FLOAT_MAT4') {
        gl.uniformMatrix4fv(location, false, data[key]);
      } else if (type === 'FLOAT_MAT3') {
        gl.uniformMatrix3fv(location, false, data[key]);
      } else if (type === 'FLOAT_VEC2') {
        const value = data[key];
        gl.uniform2f(location, value[0], value[1]);
      } else if (type === 'FLOAT_VEC3') {
        const value = data[key];
        gl.uniform3f(location, value[0], value[1], value[2]);
      } else if (type === 'FLOAT_VEC4') {
        const value = data[key];
        gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      }
    }
}

}
