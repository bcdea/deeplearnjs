/* Copyright 2017 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import {GPGPUProgram} from './gpgpu_math';

export class MinMaxProgram implements GPGPUProgram {
  variableNames = ['A'];
  params: Array<{}>;
  outputShape: number[] = [];
  userCode: string;

  constructor(aSize: number, opType: 'min'|'max') {
    this.params = [opType];
    this.userCode = `
      void main() {
        float value = getAFlat(0);
        for (int i = 0; i < ${aSize}; i++) {
          float candidate = getAFlat(i);
          if (isNaN(candidate)) {
            setOutput(candidate);
            return;
          }
          value = ${opType}(value, candidate);
        }
        setOutput(value);
      }
    `;
  }
}