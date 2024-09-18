import { LinterTask, LinterTaskOptions } from '@teambit/defender.linter-task';
import { TaskHandler } from '@teambit/builder';
import { OXLintLinter } from './oxlint-linter';
import { OXLintOptions } from './oxlint-linter-options';

export type OXlintTaskOptions = OXLintOptions &
  Pick<LinterTaskOptions, 'description'>;

/**
 * a task for a jest task.
 */
export const OxlintTask = {
  from: (options: OXlintTaskOptions): TaskHandler => {
    const name = options.name || 'OxlintLint';
    const description =
      options.description || 'linting components using ESlint';
    return LinterTask.from({
      ...options,
      name,
      description,
      linter: OXLintLinter.from(options),
    });
  },
};
