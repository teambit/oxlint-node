# Contribution Guide

Thank you for considering contributing to the Oxlint Node.js API project! This project is developed using [Bit](https://bit.dev/docs), a powerful tool for component-driven development. To get started with contributing, please follow the guidelines below.

## Getting Started

### 1. Install Bit

To run or test this project locally, you'll first need to install Bit. You can do this using the Bit Version Manager (BVM) with the following command:

```bash
npx @teambit/bvm install
```

### 2. Running Tests

To run tests specifically for the `oxlint-node` component, use the following command:

```bash
bit test teambit.oxc/linter/oxlint-node
```

> **Note**: If the component is not modified, you should add the `--unmodified` flag to the command:

```bash
bit test teambit.oxc/linter/oxlint-node --unmodified
```

### 3. Linting Example Components

You can run the lint on the example components using the command:

```bash
bit lint "org.scope-name/**"
```

### 4. Building the Project

To perform a full build of the project in isolation on your local machine, use:

```bash
bit build
```

## Suggesting Changes

There are two ways to contribute changes to this project:

### 1. Contributing Through Bit

Bit offers a streamlined contribution process using [Bit Lanes](https://bit.dev/reference/change-requests/building-lanes) and Bit Change Requests. Contributions made through Bit will be given higher priority during the review process and are more likely to be accepted faster.

To get started with Bit Lanes and Change Requests, please refer to the official Bit documentation [here](https://bit.dev/reference/change-requests/building-lanes).

### 2. Contributing Through GitHub

If you prefer, you can also contribute by creating a regular GitHub pull request. Please ensure all tests pass before submitting your pull request.

> **Note**: A continuous integration (CI) pipeline is not set up yet, so it is crucial that you manually run tests to ensure everything works as expected before submitting.

## Issues

Issues for this project are managed on GitHub. If you encounter any bugs or have suggestions for improvements, please open an issue [here](https://github.com/yourusername/oxlint-nodejs-api/issues).

---

We appreciate your interest in contributing to the Oxlint Node.js API project. Your contributions help make the project better for everyone! Thank you!

