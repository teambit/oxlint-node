import path from 'path';
import { compact } from 'lodash';
import { Linter, LinterContext, LintResults, ComponentLintResult } from '@teambit/linter';
import mapSeries from 'p-map-series';
import { Logger } from '@teambit/logger';
import { EnvContext, EnvHandler } from '@teambit/envs';
import { Capsule } from '@teambit/isolator';
import { BuildContext } from '@teambit/builder';
import { Component } from '@teambit/component';
import { OxlintNode } from '@teambit/oxc.linter.oxlint-node';
import { OxlintOptions } from './oxlint-linter-options';
import { computeOxlintNodeOptions } from './compute-options';

type OxLintJsonLabel = {
  label: string,
  span: {
    offset: number
    length: number
  }
}

type OxLintJsonEntry = {
  message: string,
  code: string,
  severity: string,
  causes: [],
  url: string,
  help: string,
  filename: string,
  labels: OxLintJsonLabel[],
  related: []
}

export class OxlintLinter implements Linter {

  private oxlintNode: OxlintNode;

  constructor(
    readonly id: string = 'oxlint-linter',

    private logger: Logger,

    private options: OxlintOptions,
  ) {
    this.oxlintNode = OxlintNode.create(options.oxlintNodeOptions);
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
      const componentResult = this.computeComponentResultsWithTotals(component, lintResults.json, lintResults.default);
      return componentResult;
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
      if (this.options.extensions && !this.options.extensions?.includes(file.extname)) return undefined;
      if (!capsule) return file.path;
      return path.join(capsule.path, file.relative);
    });
    return compact(files);
  }

  private computeComponentResultsWithTotals(component: Component, results: OxLintJsonEntry[], output: string): ComponentLintResult {
    const files: Record<string, any> = {};
    let totalErrorCount = 0;
    let totalFatalErrorCount = 0;
    let totalFixableErrorCount = 0;
    let totalFixableWarningCount = 0;
    let totalWarningCount = 0;
    results.reduce((acc, result) => {
      totalErrorCount += result.severity === 'error' ? 1 : 0;
      totalWarningCount += result.severity === 'warning' ? 1 : 0;

      if (!files[result.filename]) {
        files[result.filename] = {
          errorCount: 0,
          warningCount: 0,
          messages: [],
          raw: []
        };
      }
      const file = files[result.filename];
      file.errorCount += result.severity === 'error' ? 1 : 0;
      file.warningCount += result.severity === 'warning' ? 1 : 0;
      file.messages.push({
        severity: result.severity,
        message: result.message,
        suggestions: [result.help],
        // TODO: calculate the line and column based on offset and length
      });
      file.raw.push(JSON.parse(JSON.stringify(result)));
      
      return acc;
    }, files);

    const filesResults = Object.entries(files).map(([filePath, fileResults]) => {
      return {
        filePath,
        ...fileResults
      };
    })
    const isClean = totalErrorCount === 0 && totalWarningCount === 0 && totalFatalErrorCount === 0;

    return {
      component, 
      output,
      totalErrorCount,
      totalFatalErrorCount,
      totalFixableErrorCount,
      totalFixableWarningCount,
      totalWarningCount,
      results: filesResults,
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

  static create(options: OxlintOptions, { logger }: { logger: Logger }): Linter {
    const name = options.name || 'oxlint-linter';
    return new OxlintLinter(name, logger, options);
  }

  static from(options: OxlintOptions): EnvHandler<Linter> {
    return (context: EnvContext) => {
      const logger = context.createLogger(options.name || 'oxlint-linter');
      return OxlintLinter.create(options, { logger });
    };
  }
}