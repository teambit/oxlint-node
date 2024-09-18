import { LinterContext } from '@teambit/linter';
import { OxlintNodeOptions } from "@teambit/oxc.linter.oxlint-node";

export function computeOxlintNodeOptions(options: OxlintNodeOptions, context: LinterContext): OxlintNodeOptions {
  // Make sure json is included in the formats as we need it for parsing the results
  const formatsWithJson = [...(options?.formats || []), 'json'];
  // Make it unique
  const formats = Array.from(new Set(formatsWithJson));
  if (formats.length === 1) formats.push('default');
  const fixFlags: OxlintNodeOptions['fixesFlags'] = context.fixTypes?.reduce((acc, fixType) => {
    // @ts-ignore
    acc[fixType] = true;
    return acc;
  }, {} as OxlintNodeOptions['fixesFlags']);
  return {
    ...options,
    // @ts-ignore - remove once https://github.com/teambit/bit/pull/9129 is merged
    formats,
    fixFlags
  };
}