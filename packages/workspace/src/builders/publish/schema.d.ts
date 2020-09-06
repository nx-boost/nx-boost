import { JsonObject } from '@angular-devkit/core';

export interface PublishBuilderSchema extends JsonObject {
  buildTarget: string;
  failOnDuplicate?: boolean;
}
