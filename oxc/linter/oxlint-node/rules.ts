export type Category = 'correctness'|'suspicious'|'pedantic'|'style'|'nursery'|'restriction'|'all';
export type Severity = 'allow'|'warn'|'deny';
// TODO: add specific rules
export type Rule = string;

export type RuleSeverity = {
  name: Rule | Category;
  severity: Severity;
}
export type RulesFlags = RuleSeverity[];

export class Rules {
  constructor(public flags: RulesFlags) {}

  toCliArgs(): string[] {
    return this.flags.map(({name, severity}) => {
      return(`--${severity}=${name}`);
    });
  }

  static from(flags: RulesFlags): Rules {
    return new Rules(flags);
  }
}
