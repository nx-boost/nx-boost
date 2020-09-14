import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { PurgeCssSchematicSchema } from './schema';

describe('purge-css schematic', () => {
  let appTree: Tree;
  const options: PurgeCssSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-boost/purge-css',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('purge-css', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
