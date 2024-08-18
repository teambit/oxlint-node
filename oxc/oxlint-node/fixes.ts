export type FixesFlags = Partial<{
  all: boolean;
  suggestions: boolean;
  dangerously: boolean;
}>;

export type FixType = keyof FixesFlags;

export class Fixes {
  constructor(public flags: FixesFlags) {}

  toCliArgs(): string[] {
    return Object.keys(this.flags).reduce((acc, key) => {
      if (this.flags[key as FixType]) {
        if (key === 'all') {
          acc.push('--fix');
        } else {
          acc.push(`--fix-${key}`);
        }
      }
      return acc;
    }, [] as string[]);
  }

  static from(flags: FixesFlags): Fixes {
    return new Fixes(flags);
  }
}
