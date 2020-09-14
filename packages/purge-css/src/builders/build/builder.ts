import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BuildBuilderSchema } from './schema';
import { PurgeCSS } from 'purgecss';

export function runBuilder(
  _: BuildBuilderSchema,
  __: BuilderContext
): Observable<BuilderOutput> {
  return from(new PurgeCSS().purge(undefined)).pipe(
    map((_) => ({ success: true })),
    catchError((err) => of({ success: false, error: err?.toString() }))
  );
}

export default createBuilder(runBuilder);
