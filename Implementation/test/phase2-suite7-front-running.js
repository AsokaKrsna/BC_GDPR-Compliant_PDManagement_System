/**
 * Phase 2: Security Testing - Suite 2.7
 * Test: Front-Running & Transaction Ordering Around Revocation
 *
 * Goal:
 *  - Model a realistic race where the Data Subject (DS) submits a revoke
 *    at the same time as a Processor tries to use the consent.
 *  - Show that final outcome depends on transaction ordering, which is a
 *    blockchain-level property outside the contract’s control.
 *
 * This directly supports your analysis about:
 *  - Side-channel / MITM-like timing issues
 *  - The limitation of the on-chain model in preventing "just-in-time" misuse
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 2.7: Front-Running & Revocation Races", accounts => {
  const dataSubject = accounts[0];
  const dataController = accounts[1];
  const processor = accounts[2];

  // We treat this function as "processing data" by checking verify()
  // and logging success/failure. In a full system this would be part of
  // an off-chain RS API that first checks on-chain consent.
  async function simulateProcessing(consent) {
    const valid = await consent.verify();
    return valid;
  }

  describe("Test 2.7.1: Process Before Revoke (Attacker Wins Race)", () => {
    it("Should allow processing if TX mines before revocation", async () => {
      console.log("\n🧪 Test 2.7.1: Process Before Revoke (Attacker Wins Race)");
      console.log("=".repeat(70));

      const consent = await CollectionConsent.new(
        dataController,
        [processor],
        0xffffffff,
        1000000,
        [0, 1],
        { from: dataSubject }
      );

      // Grant both consents so verify() returns true initially
      await consent.grantConsent({ from: dataSubject });
      await consent.grantConsent({ from: dataController });

      let isValid = await consent.verify();
      console.log("Initial valid state:", isValid);
      assert.equal(isValid, true, "Consent should start as valid");

      // --- Race scenario (simulated by manual ordering) ---
      // Attacker/processor "processes" first, before revoke is mined.
      const processedBeforeRevoke = await simulateProcessing(consent);
      console.log("Processing result BEFORE revoke:", processedBeforeRevoke);

      // DS submits revoke after processing TX is mined.
      await consent.revokeConsent({ from: dataSubject });
      const isValidAfterRevoke = await consent.verify();

      console.log("Valid state AFTER revoke:", isValidAfterRevoke);

      // Assertions
      assert.equal(processedBeforeRevoke, true, "Processing succeeded before revoke was applied");
      assert.equal(isValidAfterRevoke, false, "Consent must be invalid after revoke");

      console.log("\n✅ Test 2.7.1: Demonstrated that if processing TX is mined first,\n   it can legally use consent before revocation takes effect.");
      console.log("   This is an inherent blockchain ordering limitation, not a bug in the contract.\n");
    });
  });

  describe("Test 2.7.2: Process After Revoke (DS Wins Race)", () => {
    it("Should block processing if revoke TX is mined first", async () => {
      console.log("\n🧪 Test 2.7.2: Process After Revoke (DS Wins Race)");
      console.log("=".repeat(70));

      const consent = await CollectionConsent.new(
        dataController,
        [processor],
        0xffffffff,
        1000000,
        [0, 1],
        { from: dataSubject }
      );

      // Grant both consents so verify() returns true initially
      await consent.grantConsent({ from: dataSubject });
      await consent.grantConsent({ from: dataController });

      let isValid = await consent.verify();
      console.log("Initial valid state:", isValid);
      assert.equal(isValid, true, "Consent should start as valid");

      // DS submits revoke and it is mined BEFORE processing attempt.
      await consent.revokeConsent({ from: dataSubject });
      const isValidAfterRevoke = await consent.verify();
      console.log("Valid state AFTER revoke (before processing):", isValidAfterRevoke);

      // Now processor tries to process using on-chain check.
      const processedAfterRevoke = await simulateProcessing(consent);
      console.log("Processing result AFTER revoke:", processedAfterRevoke);

      // Assertions
      assert.equal(isValidAfterRevoke, false, "Consent must be invalid after revoke");
      assert.equal(processedAfterRevoke, false, "Processing must not proceed after revoke");

      console.log("\n✅ Test 2.7.2: Demonstrated that if revoke TX is mined first,\n   subsequent processing attempts correctly fail.");
      console.log("   This shows the system behaviour depends on TX ordering.\n");
    });
  });
});
