# Contributing to Orion

Thank you for your interest in contributing to **Orion**! We welcome bug reports, feature requests, documentation improvements, and pull requests.

---

## Development Setup

1. **Fork & Clone**: Fork the repository on GitHub and clone your fork locally.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   ```bash
   npm run tauri dev
   ```

---

## Pull Request Guidelines

Before submitting a Pull Request (PR), please follow these conventions:

1. **Branch Naming**: Use descriptive branch names (e.g., `feature/vault-export`, `fix/vpn-reconnect-bug`).
2. **Code Style & Formatting**:
   - Ensure TypeScript code passes formatting (`npm run build`).
   - Format Rust code using `cargo fmt` and ensure `cargo clippy` emits zero warnings.
3. **Automated Tests**:
   - Add unit tests for new React components or Rust modules where applicable.
   - Run `npm run test` and `cargo test --manifest-path src-tauri/Cargo.toml` to ensure all tests pass.
4. **Commit Messages**: Write clear, imperative commit messages (e.g., `feat(vault): add export functionality`, `fix(telemetry): correct RAM usage calculation`).

---

## Code of Conduct

All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and professionalism.
