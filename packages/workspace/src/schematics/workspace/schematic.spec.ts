import { join } from 'path';

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';

import { WorkspaceSchematicSchema } from './schema';

describe('workspace schematic', () => {
  let appTree: Tree;
  const options: WorkspaceSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nx-boost/workspace',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('workspace', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
