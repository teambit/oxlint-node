import resolveBin from 'resolve-bin';
import fs from 'fs-extra';
import path from 'path';
import { flatten, compact } from 'lodash';
import { Linter, LinterContext, LintResults, ComponentLintResult } from '@teambit/linter';
import { ESLint as ESLintLib } from 'eslint';
import mapSeries from 'p-map-series';
import objectHash from 'object-hash';
import { Logger } from '@teambit/logger';
import { EnvContext, EnvHandler } from '@teambit/envs';
import { computeTsConfig } from '@teambit/typescript.typescript-compiler';
import { BuildContext } from '@teambit/builder';
import { Component, ComponentMap } from '@teambit/component';
import { OXLintOptions } from './oxlint-linter-options';
import { computeEslintConfig, computeRuntimeEslintConfig } from './get-eslint-config';

function getCacheDir(rootDir: string): string {
  return path.join(rootDir, 'node_modules', '.cache');
}

export class OXLintLinter implements Linter {
  constructor(
    readonly id: string = 'oxlint-linter',

    private logger: Logger,

    private options: OXLintOptions,

    private rawEslintConfig: ESLintLib.Options,

    private rawTsConfig: Record<string, any>,

    /**
     * path to oxlint binary.
     */
    private binPath: string = resolveBin('oxlint')
  ) {}

  // eslint-disable-next-line react/static-property-placement
  displayName = 'OXlint';

  displayConfig() {
    return JSON.stringify(this.options, null, 2);
  }

  async lint(context: LinterContext, buildContext?: BuildContext): Promise<LintResults> {
    const longProcessLogger = this.logger.createLongProcessLogger('linting components', context.components.length);
    let tsConfigPath;
    if (this.rawTsConfig && context.rootDir) {
      tsConfigPath = this.createTempTsConfigFile(
        context.rootDir,
        context.componentsDirMap,
        context.envRuntime.id,
        this.rawTsConfig
      );
    }
    const runtimeConfig = computeRuntimeEslintConfig(this.rawEslintConfig, context, tsConfigPath);
    const eslint = this.createEslint(runtimeConfig, this.ESLint);

    const resultsP = mapSeries(context.componentsDirMap.components, async (component) => {
      longProcessLogger.logProgress(
        `component: ${component.id.toString()}, # of files: ${component.filesystem.files.length}`
      );
      const files = this.getFilesPaths(component, buildContext);
      const lintResults = await eslint.lintFiles(files);

      if (eslint && runtimeConfig.fix && lintResults) {
        await ESLintLib.outputFixes(lintResults);
      }

      const results: ESLintLib.LintResult[] = compact(flatten(lintResults));
      const formatter = await eslint.loadFormatter(this.options.formatter || 'stylish');
      const output = formatter.format(results);
      const {
        totalErrorCount,
        totalFatalErrorCount,
        totalFixableErrorCount,
        totalFixableWarningCount,
        totalWarningCount,
        componentsResults,
        isClean
      } = this.computeComponentResultsWithTotals(results);

      return {
        component,
        output,
        totalErrorCount,
        totalFatalErrorCount,
        totalFixableErrorCount,
        totalFixableWarningCount,
        totalWarningCount,
        isClean,
        results: componentsResults,
      };
    });

    const results = (await resultsP) as any as ComponentLintResult[];
    const {
      totalErrorCount,
      totalFatalErrorCount,
      totalFixableErrorCount,
      totalFixableWarningCount,
      totalWarningCount,
      totalComponentsWithErrorCount,
      totalComponentsWithFatalErrorCount,
      totalComponentsWithFixableErrorCount,
      totalComponentsWithFixableWarningCount,
      totalComponentsWithWarningCount,
      isClean
    } = this.computeManyComponentsTotals(results);

    return {
      totalErrorCount,
      totalFatalErrorCount,
      totalFixableErrorCount,
      totalFixableWarningCount,
      totalWarningCount,
      totalComponentsWithErrorCount,
      totalComponentsWithFatalErrorCount,
      totalComponentsWithFixableErrorCount,
      totalComponentsWithFixableWarningCount,
      totalComponentsWithWarningCount,
      results,
      isClean,
      errors: [],
    };
  }

  private getFilesPaths(component: Component, buildContext?: BuildContext): string[] {
    let capsule;
    if (buildContext) {
      capsule = buildContext.capsuleNetwork.graphCapsules.getCapsule(component.id);
    }
    const files = component.filesystem.files.map((file) => {
      // TODO: now that we moved to lint files, maybe it's not required anymore
      // The eslint api will not ignore extensions by default when using lintText, so we do it manually
      if (!this.options.extensions?.includes(file.extname)) return undefined;
      if (!capsule) return file.path;
      return path.join(capsule.path, file.relative);
    });
    // const files = await Promise.all(filesP);
    return compact(files);
  }

  private createTempTsConfigFile(
    rootDir: string,
    componentDirMap: ComponentMap<string>,
    envId: string,
    tsConfig: Record<string, any>
  ): string {
    const newTsConfig = {
      ...tsConfig,
    };
    const compDirs: string[] = componentDirMap.toArray().map(([, compDir]) => compDir);

    if (tsConfig.include) {
      newTsConfig.include = flatten(
        tsConfig.include.map((includedPath) => {
          return compDirs.map((compDir) => `../../${compDir}/${includedPath}`);
        })
      );
    }
    if (tsConfig.exclude) {
      newTsConfig.exclude = flatten(
        tsConfig.exclude.map((excludedPath) => {
          return compDirs.map((compDir) => `../../${compDir}/${excludedPath}`);
        })
      );
    }
    const cacheDir = getCacheDir(rootDir);
    const hash = objectHash(newTsConfig);
    // We save the tsconfig with hash here to avoid creating unnecessary tsconfig files
    // this is very important as eslint will be able to cache the tsconfig file and will not need to create another program
    // this affects performance dramatically
    const tempTsConfigPath = path.join(cacheDir, `bit.tsconfig.eslint.${hash}.json`);
    if (!fs.existsSync(tempTsConfigPath)) {
      fs.outputJSONSync(tempTsConfigPath, newTsConfig, { spaces: 2 });
    }
    return tempTsConfigPath;
  }

  private computeComponentResultsWithTotals(results: ESLintLib.LintResult[]) {
    let totalErrorCount = 0;
    let totalFatalErrorCount = 0;
    let totalFixableErrorCount = 0;
    let totalFixableWarningCount = 0;
    let totalWarningCount = 0;
    const componentsResults = results.map((result) => {
      totalErrorCount += result.errorCount ?? 0;
      // @ts-ignore - missing from the @types/eslint lib
      totalFatalErrorCount += result.fatalErrorCount ?? 0;
      totalFixableErrorCount += result.fixableErrorCount ?? 0;
      totalFixableWarningCount += result.fixableWarningCount ?? 0;
      totalWarningCount += result.warningCount ?? 0;
      return {
        filePath: result.filePath,
        errorCount: result.errorCount,
        // @ts-ignore - missing from the @types/eslint lib
        fatalErrorCount: result.fatalErrorCount,
        fixableErrorCount: result.fixableErrorCount,
        fixableWarningCount: result.fixableWarningCount,
        warningCount: result.warningCount,
        messages: result.messages,
        raw: result,
      };
    });
    const isClean = totalErrorCount === 0 && totalWarningCount === 0 && totalFatalErrorCount === 0;

    return {
      totalErrorCount,
      totalFatalErrorCount,
      totalFixableErrorCount,
      totalFixableWarningCount,
      totalWarningCount,
      componentsResults,
      isClean
    };
  }

  private computeManyComponentsTotals(componentsResults: ComponentLintResult[]) {
    let totalErrorCount = 0;
    let totalFatalErrorCount = 0;
    let totalFixableErrorCount = 0;
    let totalFixableWarningCount = 0;
    let totalWarningCount = 0;
    let totalComponentsWithErrorCount = 0;
    let totalComponentsWithFatalErrorCount = 0;
    let totalComponentsWithFixableErrorCount = 0;
    let totalComponentsWithFixableWarningCount = 0;
    let totalComponentsWithWarningCount = 0;
    let isClean = true;

    componentsResults.forEach((result) => {
      if (result.totalErrorCount) {
        totalErrorCount += result.totalErrorCount;
        totalComponentsWithErrorCount += 1;
        isClean = false;
      }
      // @ts-ignore - missing from the @types/eslint lib
      if (result.totalFatalErrorCount) {
        totalFatalErrorCount += result.totalFatalErrorCount;
        totalComponentsWithFatalErrorCount += 1;
        isClean = false;
      }
      if (result.totalFixableErrorCount) {
        totalFixableErrorCount += result.totalFixableErrorCount;
        totalComponentsWithFixableErrorCount += 1;
      }
      if (result.totalFixableWarningCount) {
        totalFixableWarningCount += result.totalFixableWarningCount;
        totalComponentsWithFixableWarningCount += 1;
      }
      if (result.totalWarningCount) {
        totalWarningCount += result.totalWarningCount;
        totalComponentsWithWarningCount += 1;
        isClean = false;
      }
    });
    return {
      totalErrorCount,
      totalFatalErrorCount,
      totalFixableErrorCount,
      totalFixableWarningCount,
      totalWarningCount,
      componentsResults,
      totalComponentsWithErrorCount,
      totalComponentsWithFatalErrorCount,
      totalComponentsWithFixableErrorCount,
      totalComponentsWithFixableWarningCount,
      totalComponentsWithWarningCount,
      isClean
    };
  }

  version() {
    if (this.ESLint) return this.ESLint.version;
    return ESLintLib.version;
  }

  static create(options: OXLintOptions, { logger }: { logger: Logger }): Linter {
    const name = options.name || 'oxlint-linter';
    const rawTsConfig = computeTsConfig({
      tsconfig: options.tsconfig,
      compilerOptions: options.compilerOptions,
    });

    const eslintConfig = computeEslintConfig(options);

    return new OXLintLinter(name, logger, options, eslintConfig, rawTsConfig, options.eslint || ESLintLib);
  }

  static from(options: OXLintOptions): EnvHandler<Linter> {
    return (context: EnvContext) => {
      const logger = context.createLogger(options.name || 'oxlint-linter');
      return OXLintLinter.create(options, { logger });
    };
  }
}