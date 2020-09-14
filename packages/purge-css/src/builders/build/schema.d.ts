import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  options?: UserDefinedOptions;
  outputPath: string;
}

export interface UserDefinedOptions {
  content: string[];
  css: string[];
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  whitelist?: string[];
  whitelistPatterns?: RegExp[];
  whitelistPatternsChildren?: RegExp[];
}
