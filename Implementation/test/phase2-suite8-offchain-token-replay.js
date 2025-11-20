/**
 * Phase 2: Security Testing - Suite 2.8
 * Test: Off-Chain Token Replay & Stale Authorization
 *
 * Goal:
 *  - Model a typical OAuth-style flow where an RS issues a short-lived
 *    "access token" after checking on-chain consent once.
 *  - Show that if the RS does NOT re-check the smart contract before
 *    serving data, a previously-issued token can be replayed after
 *    consent revocation.
 *
 * This test demonstrates that:
 *  - The smart contract does the right thing, but
 *  - Off-chain components can still violate GDPR if they don't
 *    continuously validate on-chain state.
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 2.8: Off-Chain Token Replay & Stale Authorization", accounts => {
  const dataSubject = accounts[0];
  const dataController = accounts[1];
  const processor = accounts[2];

  // Simulated in-memory "resource server" that caches a token based
  // on a one-time on-chain check. In a real system, this might be a
  // JWT or session token.
  class MockResourceServer {
    constructor(consentContract) {
      this.consent = consentContract;
      this.issuedTokens = new Map(); // address -> boolean
    }

    // Called when DP first requests access.
    async issueTokenIfAllowed(dp) {
      const valid = await this.consent.verify();
      if (valid) {
        this.issuedTokens.set(dp, true);
        return { token: `TOKEN_FOR_${dp}`, granted: true };
      }
      return { token: null, granted: false };
    }

    // Subsequent API calls: RS *only* checks its cached token,
    // not the on-chain contract again. This is the vulnerability.
    async apiCall(dp, token) {
      const expected = this.issuedTokens.get(dp) ? `TOKEN_FOR_${dp}` : null;
      if (token && token === expected) {
        return { allowed: true, reason: "cached-token-accepted" };
      }
      return { allowed: false, reason: "no-or-invalid-token" };
    }
  }

  describe("Test 2.8.1: Token Replay After Revocation", () => {
    it("Should show off-chain RS still accepting a stale token", async () => {
      console.log("\n🧪 Test 2.8.1: Token Replay After Revocation");
      console.log("=".repeat(70));

      const consent = await CollectionConsent.new(
        dataController,
        [processor],
        0xffffffff,
        1000000,
        [0, 1],
        { from: dataSubject }
      );

      // Grant both consents
      await consent.grantConsent({ from: dataSubject });
      await consent.grantConsent({ from: dataController });

      const isValidOnChain = await consent.verify();
      console.log("Initial on-chain valid state:", isValidOnChain);
      assert.equal(isValidOnChain, true, "Consent should be valid initially");

      const rs = new MockResourceServer(consent);

      // Step 1: Processor gets a token while consent is valid
      const firstTokenResponse = await rs.issueTokenIfAllowed(processor);
      console.log("Token issued while consent valid:", firstTokenResponse);

      assert.equal(firstTokenResponse.granted, true, "RS should issue token when consent is valid");
      const token = firstTokenResponse.token;

      // Step 2: DS revokes consent on-chain
      await consent.revokeConsent({ from: dataSubject });
      const isValidAfterRevoke = await consent.verify();
      console.log("On-chain valid after revoke:", isValidAfterRevoke);
      assert.equal(isValidAfterRevoke, false, "Consent should be invalid after revoke");

      // Step 3: Processor reuses old token; RS naively trusts cached data
      const replayResult = await rs.apiCall(processor, token);
      console.log("RS decision when replaying old token:", replayResult);

      // Assertions:
      //  - Smart contract correctly reports invalid
      //  - But RS (as coded) still allows access with stale token
      assert.equal(replayResult.allowed, true, "Mock RS still accepts stale token (vulnerability)");

      console.log("\n✅ Test 2.8.1: Demonstrated that off-chain systems can violate GDPR\n   by trusting cached tokens without re-checking on-chain consent.");
      console.log("   This is not a smart contract bug but an architectural pitfall.\n");
    });
  });
});
