export type PluginsFlags = Partial<{
  react: boolean;
  unicorn: boolean;
  oxc: boolean;
  typescript: boolean;
  import: boolean;
  jsdoc: boolean;
  jest: boolean;
  vitest: boolean;
  'jsx-a11y': boolean;
  nextjs: boolean;
  'react-perf': boolean;
  promise: boolean;
}>;

export type PluginsNames = keyof PluginsFlags;

export class Plugins {
  pluginsEnabledByDefault: PluginsNames[] = ['react', 'unicorn', 'oxc', 'typescript'];
  constructor(public flags: PluginsFlags) {}

  toCliArgs(): string[] {
    return Object.keys(this.flags).reduce((acc, key) => {
      const enabledByDefault = this.pluginsEnabledByDefault.includes(key as PluginsNames);
      if (this.flags[key as PluginsNames] && !enabledByDefault) {
        acc.push(`--${key}-plugin`);
      }
      if (!this.flags[key as PluginsNames] && enabledByDefault) {
        acc.push(`--disable-${key}-plugin`);
      }
      return acc;
    }, [] as string[]);
  }

  static from(flags: PluginsFlags): Plugins {
    return new Plugins(flags);
  }
}
