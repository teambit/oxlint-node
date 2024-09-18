import { OxlintNode } from './oxlint-node';

it('renders with the correct version', async () => {
  const oxlintNode = OxlintNode.create({});
  const version = await oxlintNode.version();
  expect(version).toContain('0.9.5');
});

describe('run', () => {
  describe('with default options', () => {
    let oxlintNode: OxlintNode;
    beforeAll(() => {
      oxlintNode = OxlintNode.create({});
    });
    it('runs oxlint successfully with no files', async () => {
      const result = await oxlintNode.run();
      expect(result.default).toContain('Finished');
      expect(result.default).toContain('Found 0 warnings and 0 errors');
    });

    it('runs oxlint successfully on the current file', async () => {
      const result = await oxlintNode.run([__filename]);
      expect(result.default).toContain('Finished');
      expect(result.default).toContain('on 1 file');
      expect(result.default).toContain('Found 0 warnings and 0 errors');
    });
  });
});
