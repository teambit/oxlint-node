import { resolveBin } from './resolve-bin';
import execa from 'execa';
import { OxlintFormat, OxlintNodeOptions } from './options';
import { Plugins } from './plugins';
import { Rules } from './rules';
import { Fixes } from './fixes';

export type OxlintMultiFormatResult = Partial<Record<OxlintFormat, any>>;

export class OxlintNode {
  constructor(
    public binPath: string,
    public plugins: Plugins,
    public rules: Rules,
    public fixes: Fixes,
    public formats: OxlintFormat[] = ['default'],
    public configPath?: string,
    public tsconfigPath?: string
  ) {}

  async version() {
    const { stdout: version } = await execa(this.binPath, ['--version']);
    return version;
  }

  private getConfigCliArg(): string {
    return this.configPath ? `--config=${this.configPath}` : '';
  }

  private getTsConfigCliArg(): string {
    return this.configPath ? `--tsconfig=${this.configPath}` : '';
  }

  private getFormatCliArg(format: OxlintFormat): string {
    return `--format=${format}`;
  }

  async run(paths: string[] = []): Promise<OxlintMultiFormatResult> {
    const result: OxlintMultiFormatResult = {};
    await Promise.all(
      this.formats.map(async (format) => {
        const { stdout } = await execa(
          this.binPath,
          this.toCliArgs(format, paths)
        );
        result[format] = stdout;
        if (format === 'json') {
          result[format] = JSON.parse(stdout);
        }
      })
    );
    return result;
  }

  toCliArgs(format: OxlintFormat, paths: string[] = []): string[] {
    const args = [
      ...this.plugins.toCliArgs(),
      ...this.rules.toCliArgs(),
      ...this.fixes.toCliArgs(),
      this.getConfigCliArg(),
      this.getTsConfigCliArg(),
      this.getFormatCliArg(format),
      ...paths,
    ];
    return args;
  }

  static create(options: OxlintNodeOptions): OxlintNode {
    const plugins = Plugins.from(options.pluginsFlags || {});
    const rules = Rules.from(options.rulesFlags || []);
    const fixes = Fixes.from(options.fixesFlags || {});
    const binPath =
      options.binPath ||
      resolveBin('oxlint', { executable: 'oxlint', paths: [__dirname] });

    return new OxlintNode(
      binPath,
      plugins,
      rules,
      fixes,
      options.formats,
      options.configPath,
      options.tsconfigPath
    );
  }
}
