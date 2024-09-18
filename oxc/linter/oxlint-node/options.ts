import { FixesFlags } from './fixes';
import { PluginsFlags } from './plugins';
import { RulesFlags } from './rules';

export type OxlintFormat = 'default' | 'json' | 'unix' | 'checkstyle' | 'github';

export type OxlintNodeOptions = {
  /**
   * path to oxlint config file to use during linting
   */
  configPath?: string;

  /**
   * path to tsconfig to use during compilation.
   */
  tsconfigPath?: string;

  /**
   * decide the format for the CLI output.
   */
  formats?: OxlintFormat[];

  /**
   * decide the plugins to enable.
   */
  pluginsFlags?: PluginsFlags;

  /**
   * decide the rules / categories to enable.
   */
  rulesFlags?: RulesFlags;

  /**
   * decide the fixes to enable.
   */
  fixesFlags?: FixesFlags;

  /**
   * path to oxlint binary.
   */
  binPath?: any;
};