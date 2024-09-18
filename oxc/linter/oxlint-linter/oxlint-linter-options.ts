import type { OxlintNodeOptions } from '@teambit/oxc.linter.oxlint-node';

export type OxlintOptions = {
  name?: string;

  oxlintNodeOptions: OxlintNodeOptions;

  /**
   * file types to lint.
   */
  extensions?: string[];
};
