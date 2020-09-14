import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BuildBuilderSchema, UserDefinedOptions } from './schema';
import { PurgeCSS } from 'purgecss';
import { Path, join } from '@angular-devkit/core';

function getOptions(
  schema: BuildBuilderSchema,
  path: Path
): UserDefinedOptions {
  const joinPath = (value: string) => join(path, value);

  return {
    ...schema.options,
    content:
      schema.options?.content?.map(joinPath) ||
      ['**/*.html', '**/*.js'].map(joinPath),
    css: schema.options?.css?.map(joinPath) || ['**/*.css'].map(joinPath),
  };
}

export function runBuilder(
  schema: BuildBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return from(
    new PurgeCSS().purge(
      getOptions(schema, join(context.workspaceRoot as Path, schema.outputPath))
    )
  ).pipe(
    map((_) => ({ success: true })),
    catchError((err) => of({ success: false, error: err.toString() }))
  );
}

export default createBuilder(runBuilder);
