import fs from 'fs-extra';
import path from 'path';
import { flatten, compact } from 'lodash';
import { Linter, LinterContext, LintResults, ComponentLintResult } from '@teambit/linter';
// import { ESLint as ESLintLib } from 'eslint';
import mapSeries from 'p-map-series';
import { Logger } from '@teambit/logger';
import { EnvContext, EnvHandler } from '@teambit/envs';
import { Capsule } from '@teambit/isolator';
import { computeTsConfig } from '@teambit/typescript.typescript-compiler';
import { BuildContext } from '@teambit/builder';
import { Component, ComponentMap } from '@teambit/component';
import { OxlintNode } from '@teambit/oxc.linter.oxlint-node';
import { OXLintOptions } from './oxlint-linter-options';
import { computeOxlintNodeOptions } from './compute-options';

function getCacheDir(rootDir: string): string {
  return path.join(rootDir, 'node_modules', '.cache');
}

export class OXLintLinter implements Linter {

  private oxlintNode: OxlintNode;

  constructor(
    readonly id: string = 'oxlint-linter',

    private logger: Logger,

    private options: OXLintOptions,
  ) {
    
  }

  // eslint-disable-next-line react/static-property-placement
  displayName = 'OXlint';

  displayConfig() {
    return JSON.stringify(this.options, null, 2);
  }

  version() {
    return this.oxlintNode.version();
  }

  async lint(context: LinterContext, buildContext?: BuildContext): Promise<LintResults> {
    const longProcessLogger = this.logger.createLongProcessLogger('linting components', context.components.length);
    const computedOptions = computeOxlintNodeOptions(this.options.oxlintNodeOptions, context);
    this.oxlintNode = OxlintNode.create(computedOptions);

    const resultsP = mapSeries(context.componentsDirMap.components, async (component) => {
      longProcessLogger.logProgress(
        `component: ${component.id.toString()}, # of files: ${component.filesystem.files.length}`
      );
      const files = this.getFilesPaths(component, buildContext);
      const lintResults = await this.oxlintNode.run(files);
      console.log("🚀 ~ file: oxlint-linter.ts:60 ~ OXLintLinter ~ resultsP ~ lintResults:", lintResults)
      throw new Error('gilad')
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
    let capsule: Capsule | undefined;
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
    return compact(files);
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

  static create(options: OXLintOptions, { logger }: { logger: Logger }): Linter {
    const name = options.name || 'oxlint-linter';
    return new OXLintLinter(name, logger, options);
  }

  static from(options: OXLintOptions): EnvHandler<Linter> {
    return (context: EnvContext) => {
      const logger = context.createLogger(options.name || 'oxlint-linter');
      return OXLintLinter.create(options, { logger });
    };
  }
}