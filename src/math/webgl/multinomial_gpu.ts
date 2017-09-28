/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {GPGPUContext} from './gpgpu_context';
import {GPGPUProgram} from './gpgpu_math';

export class MultinomialProgram implements GPGPUProgram {
  variableNames = ['probs'];
  params: Array<{}>;
  outputShape: number[];
  userCode: string;

  // Caching uniform location for speed.
  seedLoc: WebGLUniformLocation;

  constructor(numOutcomes: number, numSamples: number) {
    this.outputShape = [numSamples];
    this.params = [];

    this.userCode = `
      uniform float seed;

      const vec2 K1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
         2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
      );

      float random(float seed) {
          return fract(cos(dot(resultUV * seed, K1)) * 12345.6789);
      }

      void main() {
        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${numOutcomes}; i++) {
          cdf += getProbs(i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }
        setOutput(float(${numOutcomes - 1}));
      }
    `;
  }

  getCustomSetupFunc(seed: number) {
    return (gpgpu: GPGPUContext, webGLProgram: WebGLProgram) => {
      if (this.seedLoc == null) {
        this.seedLoc = gpgpu.getUniformLocation(webGLProgram, 'seed');
      }
      gpgpu.gl.uniform1f(this.seedLoc, seed);
    };
  }
}
