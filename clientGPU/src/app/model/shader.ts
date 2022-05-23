import { Uniforms } from "../services/shader.service";

export class Shader {
  public readonly program: WebGLProgram;
  public readonly uniforms: Uniforms;

  constructor(program: WebGLProgram, uniforms: Uniforms) {
    this.program = program;
    this.uniforms = uniforms;
    console.log(uniforms)
  }

  assignUniforms = (gl: WebGL2RenderingContext, data: any) => {
    console.log(this.uniforms)
    for (const key of Object.keys(this.uniforms)) {
      const { type, location } = this.uniforms[key];
      switch (type) {
        case 'BOOL':
          gl.uniform1i(location, data[key]);
          break
        case 'INT':
        case 'SAMPLER_2D':
        case 'INT_SAMPLER_3D':
          gl.uniform1i(location, data[key]);
          break
        case 'FLOAT':
          gl.uniform1f(location, data[key]);
          break
        case 'FLOAT_MAT4':
          gl.uniformMatrix4fv(location, false, data[key]);
          break
        case 'FLOAT_MAT3':
          gl.uniformMatrix3fv(location, false, data[key]);
          break
        case 'FLOAT_VEC2':
          const v2 = data[key];
          gl.uniform2f(location, v2[0], v2[1]);
          break;
        case 'FLOAT_VEC3':
          const v3 = data[key];
          gl.uniform3f(location, v3[0], v3[1], v3[2]);
          break;
        case 'FLOAT_VEC4':
          const v4 = data[key];
          gl.uniform4f(location, v4[0], v4[1], v4[2], v4[3]);
          break;
      }
    }
  }
}
