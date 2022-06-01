import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from "rxjs";
import { map } from 'rxjs/operators';

export interface Uniforms {
  [key: string]: {
    type: string,
    location: WebGLUniformLocation
  }
}

@Injectable({
  providedIn: 'root',
})
export class ShaderService {
  constructor(private readonly http: HttpClient) {}

  loadFileFromAssets = (path: string) => {
    return this.http.get(`assets/${path}`, { responseType: 'text' });
  };

  createProgramFromAssets =
    (gl: WebGL2RenderingContext,
     vertPath: string,
     fragPath: string
    ) => {
    const vertShaderSrc$ = this.loadFileFromAssets(vertPath);
    const fragShaderSrc$ = this.loadFileFromAssets(fragPath);

    return forkJoin([vertShaderSrc$, fragShaderSrc$]).pipe(
      map(([vertShaderSrc, fragShaderSrc]) => {
        const vertShader = this.compileShader(gl, vertShaderSrc, gl.VERTEX_SHADER);
        const fragShader = this.compileShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
        const program = this.createProgram(gl, vertShader, fragShader);

        const response = [program, this.getUniforms(gl, program)];
        return response as [WebGLProgram, Uniforms];
      })
    );
  };

  getUniforms = (gl: WebGL2RenderingContext, program: WebGLProgram): Uniforms => {
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    const response: Uniforms = {};
    for (let ii = 0; ii < numUniforms; ++ii) {
      const uniformInfo = gl.getActiveUniform(program, ii)!;
      if (!this.isBuiltIn(uniformInfo)) {
        const { name, type } = uniformInfo;
        response[name] = {
          type: this.glEnumToString(gl, type),
          location: gl.getUniformLocation(program, name)!
        };
      }
    }
    return response;
  }

  isBuiltIn = (info: any) => {
    const name = info.name;
    return name.startsWith("gl_") || name.startsWith("webgl_");
  }

  glEnumToString = (gl: WebGL2RenderingContext, value: any) => {
    const keys = [];
    for (const key in gl) {
      // @ts-ignore
      if (gl[key] === value) {
        keys.push(key);
      }
    }
    return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
  }

  compileShader = (gl: WebGL2RenderingContext, shaderSource: string, shaderType: GLenum) => {
    // Create the shader object
    const shader = gl.createShader(shaderType)!;

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success && !gl.isContextLost()) {
      // Something went wrong during compilation; get the error
      const infoLog = gl.getShaderInfoLog(shader);

      console.error(`Could not compile shader:\n${infoLog ?? ''}`);
    }

    return shader;
  };

  createProgram = (
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    // Create a program.
    const program = gl.createProgram()!;

    // Attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program.
    gl.linkProgram(program);

    // Check if it linked.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!success && !gl.isContextLost()) {
      // Something went wrong with the link
      const infoLog = gl.getProgramInfoLog(program);

      console.error(`WebGL program filed to link:\n${infoLog ?? ''}`);
    }

    return program;
  };
}
