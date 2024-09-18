// @see https://bit.cloud/teambit/react/react-env?version=1.0.6
import { ReactEnv } from '@teambit/react.react-env';
import { Pipeline } from '@teambit/builder';
import {
  resolveTypes,
  TypescriptTask,
  TypescriptConfigWriter,
} from '@teambit/typescript.typescript-compiler';
import {
  ESLintLinter,
  EslintTask,
  EslintConfigWriter,
} from '@teambit/defender.eslint-linter';
import { JestTask } from '@teambit/defender.jest-tester';
import { PrettierConfigWriter } from '@teambit/defender.prettier-formatter';
import { ConfigWriterList } from '@teambit/workspace-config-files';
import { OxlintLinter, OxlintTask } from '@teambit/oxc.linter.oxlint-linter';

/**
 * Acme's React development environment.
 * Based on the Bit base React env
 * */
export class OxlintEnv extends ReactEnv {
  /* a shorthand name for the env */
  name = 'oxlint-env';

  protected tsconfigPath = require.resolve('./config/tsconfig.json');

  protected jestConfigPath = require.resolve('./config/jest.config');

  protected eslintConfigPath = require.resolve('./config/eslintrc.js');

  /* the linter to use during development */
  linter() {
    /**
     * @see https://bit.dev/reference/eslint/using-eslint
     * */
    return OxlintLinter.from({
      oxlintNodeOptions:{
        tsconfigPath: this.tsconfigPath,
      }
      // extensions: this.eslintExtensions,
    });
  }

  /**
   * a set of processes to be performed before a component is snapped, during its build phase
   * @see https://bit.dev/docs/react-env/build-pipelines
   */
  build() {
    return Pipeline.from([
      TypescriptTask.from({
        tsconfig: this.tsconfigPath,
        types: resolveTypes(__dirname, [this.tsTypesPath]),
      }),
      OxlintTask.from({
        oxlintNodeOptions:{
          tsconfigPath: this.tsconfigPath,
        }
      }),
      JestTask.from({
        config: this.jestConfigPath,
      }),
    ]);
  }

  workspaceConfig(): ConfigWriterList {
    return ConfigWriterList.from([
      TypescriptConfigWriter.from({
        tsconfig: this.tsconfigPath,
        types: resolveTypes(__dirname, [this.tsTypesPath]),
      }),
      EslintConfigWriter.from({
        configPath: this.eslintConfigPath,
        tsconfig: this.tsconfigPath,
      }),
      PrettierConfigWriter.from({
        configPath: this.prettierConfigPath,
      }),
    ]);
  }
}

export default new OxlintEnv();
