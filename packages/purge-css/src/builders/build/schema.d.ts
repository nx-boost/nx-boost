import { JsonObject } from '@angular-devkit/core';
import { UserDefinedOptions } from 'purgecss';

export interface BuildBuilderSchema extends JsonObject {
  options?: UserDefinedOptions;
  outputDir: string;
}
