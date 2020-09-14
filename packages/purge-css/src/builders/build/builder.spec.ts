import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { join } from 'path';
import { BuildBuilderSchema, UserDefinedOptions } from './schema';

jest.mock('purgecss');
import { PurgeCSS } from 'purgecss';

const options: BuildBuilderSchema = {
  outputPath: 'test',
};

const root = '/root';

describe('Command Runner Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let purgeMock: jest.Mock<
    ReturnType<typeof PurgeCSS.prototype.purge>,
    Parameters<typeof PurgeCSS.prototype.purge>
  >;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost(root, root);
    architect = new Architect(architectHost, registry);
    purgeMock = jest.fn().mockResolvedValue([]);
    PurgeCSS.prototype.purge = purgeMock;

    await architectHost.addBuilderFromPackage(join(__dirname, '../../..'));
  });

  it('should use the default options', async () => {
    const run = await architect.scheduleBuilder(
      '@nx-boost/purge-css:build',
      options
    );

    const output = await run.result;

    await run.stop();

    expect(output.success).toBe(true);
    expect(purgeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        css: expect.arrayContaining([
          join(root, options.outputPath, '**/*.css'),
        ]),
        content: expect.arrayContaining([
          join(root, options.outputPath, '**/*.html'),
          join(root, options.outputPath, '**/*.js'),
        ]),
      })
    );
  });

  it('should use the custom options', async () => {
    const customOptions: UserDefinedOptions = {
      css: ['a.css', 'b.css'],
      content: ['**/*.vue'],
      variables: true,
    };
    const run = await architect.scheduleBuilder('@nx-boost/purge-css:build', {
      ...options,
      options: customOptions,
    } as BuildBuilderSchema);

    const output = await run.result;

    await run.stop();

    const joinFn = (value: string) => join(root, options.outputPath, value);

    expect(output.success).toBe(true);
    expect(purgeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ...customOptions,
        css: expect.arrayContaining(customOptions.css.map(joinFn)),
        content: expect.arrayContaining(customOptions.content.map(joinFn)),
      })
    );
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
