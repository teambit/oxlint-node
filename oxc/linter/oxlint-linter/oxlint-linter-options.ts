import type { OXLintNodeOptions } from '@teambit/oxc.linter.oxlint-node';

export type OXLintOptions = {
  name?: string;

  oxlintNodeOptions: OXLintNodeOptions;
};