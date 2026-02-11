# Contributing to Agent Factory

We love contributions! Here's how you can help.

## Ways to Contribute

- **Report bugs** — Open an issue with reproduction steps
- **Suggest features** — Open an issue describing the feature
- **Submit PRs** — Fix bugs or implement features
- **Improve docs** — Fix typos, clarify explanations, add examples
- **Share agents** — Contribute example agent specs

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/agent-factory.git
cd agent-factory

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint
```

## Pull Request Process

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit with a clear message
6. Push to your fork
7. Open a PR

## Code Style

- Use 2-space indentation
- Use single quotes for strings
- Add JSDoc comments for functions
- Keep functions small and focused

## Commit Messages

Use conventional commit format:

```
feat: add new action type for HTTP calls
fix: handle empty topics array
docs: improve getting started guide
chore: update dependencies
```

## Testing

Add tests for new features:

```javascript
// tests/generate.test.js
describe('generate', () => {
  it('should generate greeting topic', () => {
    const spec = { name: 'Test', greeting: 'Hello!' };
    const result = generate(spec);
    expect(result).toContain('Greeting');
  });
});
```

## Documentation

When adding features:
- Update the relevant doc in `docs/`
- Add examples to `specs/examples/` if applicable
- Update the README if it's a major feature

## Questions?

Open a discussion or reach out to the maintainers.

Thank you for contributing! 🙏
