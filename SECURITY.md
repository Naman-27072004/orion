# Security Policy

## Supported Versions

Only the latest stable release of Orion receives security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

The Orion engineering team takes software security seriously. If you discover a security vulnerability in Orion, please follow these reporting procedures:

1. **Do NOT open a public GitHub issue** for undisclosed security vulnerabilities.
2. Email your vulnerability report to `security@orion-intelligence.org` or submit a private security advisory via GitHub Security Advisories.
3. Include detailed steps to reproduce the issue, proof-of-concept code, and the potential impact.

### Our Commitment
- We will acknowledge receipt of your report within **24 hours**.
- We will assess the issue and provide an estimated timeline for a patch within **72 hours**.
- Once a fix is verified, we will issue a patch release and credit your disclosure (unless requested otherwise).

## Cryptographic & Security Architecture
- Password Vault items are encrypted using **AES-256-GCM** with 96-bit random nonces.
- Key derivation uses **Argon2id** (`t=2, m=19456KB, p=1`).
- Random password generation strictly uses system **CSPRNG** (`rand::thread_rng()`).
- Local data is isolated inside protected per-user AppData folders (`%APPDATA%\OrionPlatform\`).
