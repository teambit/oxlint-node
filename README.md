# Oxlint Node.js API

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![NPM Version](https://img.shields.io/npm/v/@teambit/oxc.linter.oxlint-node)](https://www.npmjs.com/package/@teambit/oxc.linter.oxlint-node)

A Node.js API wrapper for the [Oxlint](https://github.com/oxlint/oxlint) project, a fast and reliable Rust-based linter. This repository also includes various examples and Bit components that demonstrate how to integrate and use Oxlint in real-world applications.

## ⚠️ Beta Status

**Note**: This project is currently in **beta**. Users should expect potential breaking changes in future releases due to ongoing redesigns of the Node.js API or changes in the Oxlint project and CLI itself.

## Table of Contents

- [Oxlint Node.js API](#oxlint-nodejs-api)
  - [⚠️ Beta Status](#️-beta-status)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Project Structure](#project-structure)
    - [Detailed Structure:](#detailed-structure)
  - [Installation](#installation)
    - [Using `pnpm`](#using-pnpm)
    - [Using `npm`](#using-npm)
    - [Using `yarn`](#using-yarn)
  - [Usage](#usage)
    - [Simple Usage](#simple-usage)
    - [Advanced Usage](#advanced-usage)
  - [Documentation](#documentation)
    - [Other Related Components:](#other-related-components)
  - [Changelog and Version History](#changelog-and-version-history)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 🚀 **Fast and efficient**: Leverages the performance of the Rust-based Oxlint linter.
- 🛠 **Easy integration**: Simple API for Node.js applications.
- 📦 **Bit Integration**: Examples of integrating Oxlint with Bit for component-driven development.
- ✅ **Cross-platform**: Compatible with major operating systems.
- 💻 **Fully typed**: Provides TypeScript support out-of-the-box, ensuring type safety and better development experience.

## Project Structure

The repository is organized as follows:

```plaintext
oxc/
  ├── linter/
  │   ├── oxlint-node/        # Main folder of the project - the Node.js wrapper
  │   └── oxlint-linter/      # A Bit linter that utilizes oxlint-node to build a Bit linter (also serves as a consumer example)
  └── examples/
      └── envs/
          └── oxlint-env/     # A Bit environment that uses oxlint-linter, enabling linting on Bit components
testing-components/           # Simple (local only) Bit components that use the oxlint-env, 
                              # demonstrating linting through the `bit lint` or `bit build` command
```

### Detailed Structure:

- **`oxc/linter/oxlint-node/`**:
  - This is the core of the project, containing the Node.js wrapper for Oxlint, allowing Node.js applications to leverage Oxlint's linting capabilities.

- **`oxc/linter/oxlint-linter/`**:
  - This folder includes a Bit linter built on top of `oxlint-node`. It serves as both a utility and an example for how to integrate Oxlint with Bit for component-based development.

- **`oxc/examples/envs/oxlint-env/`**:
  - An environment setup that uses `oxlint-linter`, allowing developers to run linting on Bit components within their projects.

- **`testing-components/`**:
  - A collection of simple Bit components intended for local testing. These components use the `oxlint-env`, providing practical examples of running the linter via `bit lint` or `bit build`.

## Installation

To install the Oxlint Node.js API, you can use `pnpm`, `npm`, or `yarn`.

### Using `pnpm`

```bash
pnpm add @teambit/oxc.linter.oxlint-node
```

### Using `npm`

```bash
npm install @teambit/oxc.linter.oxlint-node
```

### Using `yarn`

```bash
yarn add @teambit/oxc.linter.oxlint-node
```

## Usage

### Simple Usage

```javascript
import { OxlintNode } from '@teambit/oxc.linter.oxlint-node';

const oxlintNode = OxlintNode.create({});
const result = await oxlintNode.run(['paths']);
console.log(result);
```

### Advanced Usage

```javascript
const oxlintNode = OxlintNode.create({
  binPath: 'path to oxlint binary',
  formats: ['json', 'default'],
  configPath: 'path to oxlint config file',
  tsconfigPath: 'path to tsconfig',
  pluginsFlags: {
    'plugin-name': true,
  },
  rulesFlags: [{
    name: 'rule-name',
    severity: 'warn',
  }],
  fixesFlags: {
    all: true,
  }
});
```

## Documentation

For more comprehensive documentation, including the full API reference, please visit the component page on Bit Cloud:

- **Oxlint Node.js API Component**: [bit.cloud/teambit/oxc/linter/oxlint-node](https://bit.cloud/teambit/oxc/linter/oxlint-node)
- **Full API Reference**: [bit.cloud/teambit/oxc/linter/oxlint-node/~api-reference](https://bit.cloud/teambit/oxc/linter/oxlint-node/~api-reference)

### Other Related Components:

- **Oxlint Env Example**: [bit.cloud/teambit/oxc/examples/envs/oxlint-env](https://bit.cloud/teambit/oxc/examples/envs/oxlint-env)
- **Oxlint Linter**: [bit.cloud/teambit/oxc/linter/oxlint-linter](https://bit.cloud/teambit/oxc/linter/oxlint-linter)

## Changelog and Version History

Changelog and version history for this project are managed through the `oxlint-node` component's version history on Bit Cloud. You can view the full changelog at the following URL:

- **Changelog**: [bit.cloud/teambit/oxc/linter/oxlint-node/~changelog](https://bit.cloud/teambit/oxc/linter/oxlint-node/~changelog)

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
