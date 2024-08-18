import { ESLint as ESLintLib } from 'eslint';
import type { CompilerOptions as TsCompilerOptions } from 'typescript';

export type OXLintOptions = {
  name?: string;

  /**
   * path to oxlint config file to use during linting
   */
  configPath?: string;

  /**
   * linter config for eslint.
   */
  config?: ESLintLib.Options;

  /**
   * decide the formatter for the CLI output.
   */
  formatter?: 'default|json|unix|checkstyle|github';

  /**
   * file types to lint.
   */
  extensions?: string[];

  // TODO: improve type
  /**
   * typescript config for oxlint.
   * If you pass this, bit will auto generate a temp config file in `node_modules/.cache` and pass it to eslint.
   * In case you have include/exclude props in the tsconfig, they will be changed to handle the fact that they are inside the node_modules/.cache folder.
   * a `../../` will be added to the beginning of the path.
   */
  /**
   * path to tsconfig to use during compilation.
   */
  tsconfig?: string;

  /**
   * a compiler options object.
   */
  compilerOptions?: TsCompilerOptions;

  /**
   * path to oxlint binary.
   */
  binPath?: any;
};