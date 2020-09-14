import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BuildBuilderSchema, UserDefinedOptions } from './schema';
import { PurgeCSS } from 'purgecss';
import { Path, join } from '@angular-devkit/core';
import { promisify } from 'util';
import * as fs from 'fs';

const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);

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

async function writeFile(result: { css: string; file?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const file = result.file!;
  const statsBefore = await statAsync(file);
  await writeFileAsync(file, result.css);
  const statsAfter = await statAsync(file);
  return { ...result, stats: { statsBefore, statsAfter } };
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
    switchMap((results) =>
      forkJoin(results.map((result) => from(writeFile(result))))
    ),
    map((_) => ({ success: true })),
    catchError((err) => of({ success: false, error: err.toString() }))
  );
}

export default createBuilder(runBuilder);
