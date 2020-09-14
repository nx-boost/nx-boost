import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { join } from 'path';
import { BuildBuilderSchema } from './schema';

jest.mock('purgecss');
import { PurgeCSS } from 'purgecss';

const options: BuildBuilderSchema = {
  outputDir: 'test',
};

describe('Command Runner Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost('/root', '/root');
    architect = new Architect(architectHost, registry);
    const purgeMock = jest.fn().mockResolvedValue([]);
    PurgeCSS.prototype.purge = purgeMock;

    await architectHost.addBuilderFromPackage(join(__dirname, '../../..'));
  });

  it('can run', async () => {
    const run = await architect.scheduleBuilder(
      '@nx-boost/purge-css:build',
      options
    );

    const output = await run.result;

    await run.stop();

    expect(output.success).toBe(true);
  });

  it('should fail', async () => {
    const error = new Error('test');
    PurgeCSS.prototype.purge = jest.fn().mockRejectedValueOnce(error);

    const run = await architect.scheduleBuilder(
      '@nx-boost/purge-css:build',
      options
    );

    const output = await run.result;

    await run.stop();

    expect(output.success).toBe(false);
    expect(output.error).toEqual(error.toString());
  });
});
