import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { resolve } from 'path';
import { PublishBuilderSchema } from './schema';

function getLocalPackage(
  packageJsonPath: string
): { name: string; version: string } {
  const packageSource = fs.readFileSync(packageJsonPath).toString();
  return JSON.parse(packageSource);
}

function publishPackage(path: string): void {
  childProcess.execSync(`npm publish ${path}`);
}

function versionAlreadyExists(packageName: string, version: string): boolean {
  try {
    const output = childProcess.execSync(
      `npm show ${packageName}@${version} version`
    );
    const registryVersion = output.toString().trim();

    return registryVersion === version;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function runBuilder(
  options: PublishBuilderSchema,
  context: BuilderContext
): Promise<BuilderOutput> {
  const target = targetFromTargetString(options.buildTarget);

  const targetOptions = await context.getTargetOptions(target);

  await (await context.scheduleTarget(target)).result;

  const outputPath = targetOptions.outputPath as string;

  const packageJsonPath = resolve(outputPath, 'package.json');

  const localPackage = getLocalPackage(packageJsonPath);

  if (versionAlreadyExists(localPackage.name, localPackage.version)) {
    context.logger.warn(
      `Did not publish package ${localPackage.name}@${localPackage.version}. It already exists in the selected registry.`
    );
    return { success: !options.failOnDuplicate };
  }

  try {
    publishPackage(outputPath);

    context.logger.info(
      `Successfully published ${localPackage.name}@${localPackage.version}.`
    );

    return { success: true };
  } catch (_) {
    context.logger.error(
      `Couldn't publish ${localPackage.name}@${localPackage.version}.`
    );

    return { success: false };
  }
}

export default createBuilder(runBuilder);
