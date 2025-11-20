# Test Suite Overview

This document summarizes the Truffle test suites in `test/`.
It is meant as a support document when writing the final report.

> NOTE: Replace the placeholder "Status"/"Key Numbers" with your
> actual run outputs (gas, timings) after executing `truffle test`.

---

## Quick System Test (`test/quick-test.js`)

- **Purpose:** Smoke test of the overall GDPR consent flow.
- **Covers:**
  - Collection consent deployment.
  - Two-party granting (DS + DC) and `verify()`.
  - DS revocation and invalidation of consent.
  - Creation of a `ProcessingConsent` and basic purpose verification.
  - Unauthorized caller trying to revoke consent.
- **GDPR Link:** Valid consent creation, right to withdraw, access control.
- **Status (example):** All tests passed locally.

---

## Phase 1 – Functional Behaviour

### 1.1 Consent Creation (`phase1-suite1-consent-creation.js`)

- **Purpose:** Validate basic `CollectionConsent` construction and inputs.
- **Main checks:**
  - Successful deployment with typical parameters.
  - Multiple recipients support.
  - Input validation for:
    - Empty recipients.
    - Zero duration.
    - Zero `data` flags (edge case).
    - Empty purposes (edge case).
  - Gas cost comparison for minimal/medium/maximum configurations.
  - Initial contract state (`getData()`, `verify()` false before grants).
- **GDPR Link:** Correct modelling of who can be a recipient and what data is in scope.
- **Status:** Document if any edge cases are currently accepted but considered risky.

### 1.2 Consent Granting (`phase1-suite2-consent-granting.js`)

- **Purpose:** Exercise the two-party granting mechanism for collection consent.
- **Main checks:**
  - DS-only grant: consent remains invalid.
  - DC-only grant: observed behaviour vs expected two-party requirement.
  - Both DS and DC grant: consent becomes valid.
  - Unauthorized account calling `grantConsent` is rejected.
  - Duplicate grants and multiple grant attempts (idempotency).
  - Grant-order independence (DS→DC vs DC→DS).
- **GDPR Link:** Ensuring explicit approval from the data subject and controller.
- **Key Observation:** Test 1.2.2 documents a potential logic issue where DC-only grant may be sufficient – important for the “assumption testing” part of your report.

### 1.3 Consent Revocation (`phase1-suite3-consent-revocation.js`)

- **Purpose:** Validate revocation flows for DS and DC.
- **Main checks:**
  - DS revokes consent → `verify()` becomes false.
  - DC revokes consent → `verify()` becomes false.
  - Unauthorized revocation attempts fail.
  - Revoke + re-grant cycles and multiple revocations.
  - Gas analysis for revocation vs granting.
- **GDPR Link:** Right to withdraw consent and auditability of state changes.

### 1.4 Authorization (`phase1-suite4-authorization.js`)

- **Purpose:** Model authorization decisions for data access.
- **Main checks:**
  - Authorized recipients can access while consent is valid.
  - Unauthorized addresses are rejected.
  - Data-type restrictions enforced via `data` flags.
  - Behaviour when consent is invalid or expired.
  - Gas analysis for authorization operations.
- **GDPR Link:** Enforcing purpose limitation and access control.
 - **Status:** Conceptual. Assumes an on-chain `authorize()` API that the current prototype does not implement; used to express the richer interface proposed in the paper.

### 1.5 Processing Consent (`phase1-suite5-processing-consent.js`)

- **Purpose:** Verify `ProcessingConsent` behaviour for DP processing.
- **Main checks:**
  - Creation of processing consent from collection consent.
  - Validation of processing purposes.
  - Unauthorized processors being blocked.
  - Multiple purposes per processor.
  - Revocation by purpose and revocation of all for a processor.
- **GDPR Link:** Fine-grained control over processing operations and recipients.
 - **Status:** Conceptual. Tests rely on a `createProcessingConsent()` helper with stronger invariants than the prototype’s `newPurpose()` + `getProcessingConsentSC()` interface; highlights desired second-layer consent semantics.

### 1.6 Time-Based Expiration (`phase1-suite6-time-expiration.js`)

- **Purpose:** Test time-dependent validity windows.
- **Main checks:**
  - Short-duration consents (seconds).
  - Authorization attempts after expiration.
  - Comparison across different durations.
  - Re-granting after expiration.
  - Edge cases around boundary timestamps.
  - Gas cost trends over time.
- **GDPR Link:** Storage limitation and time-bound consent.

---

## Phase 2 – Assumption & Attack Testing

### 2.1 Malicious Registration Service (`phase2-suite1-malicious-rs.js`)

- **Purpose:** Stress the assumption that the registration / identity service is honest.
- **Main scenarios:**
  - Sybil attacks (multiple fake identities).
  - Identity impersonation.
  - RS-denial-of-service against users.
  - Certificate duplication and RS–DC collusion.
  - RS data harvesting attempts.
- **GDPR Link:** Trust model for identity/registration services and potential failures.

### 2.2 Key Compromise (`phase2-suite2-key-compromise.js`)

- **Purpose:** Explore consequences of DS/DC key theft and replay.
- **Main scenarios:**
  - Stolen DS key → attacker fully controls victim’s consents.
  - Stolen DC key → mass compromise of many data subjects.
  - Replay of grant/revoke transactions.
  - Lack of key rotation and identity continuity.
  - Multi-signature bypass (can single key activate consent?).
  - On-chain leakage / storage inspection.
- **GDPR Link:** How fragile the system is when cryptographic assumptions fail.

### 2.3 Consensus Attacks (`phase2-suite3-consensus-attacks.js`)

- **Purpose:** Relate blockchain consensus assumptions to consent correctness.
- **Main scenarios:**
  - 51% attacks reversing revocations.
  - Transaction censorship (revokes never mined).
  - Chain reorgs invalidating revocation history.
  - MEV/front‑running of revocation vs access.
  - Network partition attacks with inconsistent consent views.
- **GDPR Link:** Limits of using blockchain as authoritative evidence for consent.

### 2.4 Smart Contract Vulnerabilities (`phase2-suite4-smart-contract-vulnerabilities.js`)

- **Purpose:** Check for classic solidity security issues.
- **Scenarios:**
  - Reentrancy attempts.
  - Integer overflow/underflow.
  - Timestamp manipulation for expiry.
  - Gas limit / DoS via heavy operations.
  - Access‑control bypass patterns.
- **GDPR Link:** Ensuring the enforcement mechanism (contracts) is itself robust.

### 2.5 Edge Cases & Boundary Conditions (`phase2-suite5-edge-cases.js`)

- **Purpose:** Explore unusual but technically allowed inputs and sequences.
- **Main scenarios:**
  - Zero/very short/negative durations.
  - Empty or malformed recipient lists.
  - Self‑referential/circular consents.
  - Rapid grant/revoke cycles.
  - Data flag extremes (0 and max values).
  - Purpose array corner cases.
  - Transaction ordering dependencies.
  - Gas limit stress with many recipients/purposes.
- **GDPR Link:** Identifying where contract behaviour may be GDPR‑nonsensical even if technically valid.

### 2.6 Metadata Privacy (`phase2-suite6-metadata-privacy.js`)

- **Purpose:** Treat consent metadata itself as personal data.
- **Scenarios (high level):**
  - Whether consent metadata can identify or profile users.
  - Immutability vs true erasure (“right to be forgotten”).
  - Transaction history enabling behavioural profiling.
- **GDPR Link:** Data minimisation, purpose limitation, and erasure in the presence of immutable logs.

### 2.7 Front‑Running & Revocation Races (`phase2-suite7-front-running.js`)

- **Purpose:** Demonstrate timing races between processing and revocation.
- **Main scenarios:**
  - Test 2.7.1: Processing (using `verify()`) before revoke is mined → allowed.
  - Test 2.7.2: Revoke mined before processing → blocked.
- **GDPR Link:** Shows that BC transaction ordering, not just contract logic, determines whether last‑moment access succeeds.

### 2.8 Off‑Chain Token Replay (`phase2-suite8-offchain-token-replay.js`)

- **Purpose:** Model an OAuth‑like RS issuing access tokens based on one‑time on‑chain checks.
- **Main scenario:**
  - RS issues a token when consent is valid.
  - DS revokes consent on-chain.
  - RS still accepts the cached token without re‑checking the contract.
- **GDPR Link:** Demonstrates that off‑chain components can violate withdrawal even if the contract is correct.

### 2.9 Scalability Microbenchmark (`phase2-suite9-scalability-microbenchmark.js`)

- **Purpose:** Provide empirical numbers for scalability and cost.
- **Main actions:**
  - Deploy `NUM_CONSENTS` collection consents (default 20).
  - For each, grant DS and DC consents.
  - Measure:
    - Gas per creation, DS grant, DC grant.
    - Total time and average time per consent.
- **GDPR Link:** Helps evaluate whether the approach scales in practice and cost trade‑offs.

---

## How to Run the Tests

From `BC_GDPR-Compliant_PDManagement_System/`:

```powershell
# 1. Start Ganache (already done in your environment)
# ganache --port 8545

# 2. Run full suite
truffle test

# 3. Or run a single suite
truffle test test/phase2-suite9-scalability-microbenchmark.js
```

After running, update this file with:
- Actual pass/fail status for each suite.
- Interesting metrics (gas, timings) from console output.
- Any unexpected behaviours or bugs you want to highlight in the report.
