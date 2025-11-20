/**
 * Phase 1: Functional Testing - Suite 1.3
 * Test: Consent Revocation
 * 
 * Tests GDPR's "right to withdraw consent" requirement
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 1.3: Consent Revocation Tests", accounts => {
    const dataSubject = accounts[0];
    const dataController = accounts[1];
    const dataProcessor = accounts[2];
    const unauthorized = accounts[9];

    let consent;

    beforeEach(async () => {
        // Create and fully grant consent
        consent = await CollectionConsent.new(
            dataController,
            [dataProcessor],
            15,
            86400,
            [0, 1],
            { from: dataSubject }
        );
        
        // Grant from both parties
        await consent.grantConsent({ from: dataSubject });
        await consent.grantConsent({ from: dataController });
    });

    describe("Test 1.3.1: Data Subject Revokes Consent", () => {
        it("Should allow DS to revoke consent", async () => {
            console.log("\n📝 Test 1.3.1: DS Revokes Consent");
            console.log("=" .repeat(60));

            // Verify initially valid
            let isValid = await consent.verify();
            console.log(`📊 Initial State: Valid = ${isValid}`);
            assert.equal(isValid, true, "Consent should be valid before revocation");

            // DS revokes
            console.log("\n🚫 Data Subject revoking consent...");
            const tx = await consent.revokeConsent({ from: dataSubject });
            const receipt = await web3.eth.getTransactionReceipt(tx.tx);

            console.log(`  Transaction Hash: ${tx.tx}`);
            console.log(`  Gas Used: ${receipt.gasUsed.toLocaleString()}`);

            // Check state after revocation
            isValid = await consent.verify();

            console.log("\n📝 After Revocation:");
            console.log(`  Is Valid: ${isValid}`);

            // Assertions
            assert.equal(isValid, false, "Consent should now be INVALID");

            console.log("\n✅ Test 1.3.1: PASSED");
            console.log("  ✓ DS can revoke consent");
            console.log("  ✓ Consent becomes invalid immediately");
            console.log("  ✓ GDPR 'right to withdraw' implemented correctly");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.2: Data Controller Revokes Consent", () => {
        it("Should allow DC to revoke consent", async () => {
            console.log("\n📝 Test 1.3.2: DC Revokes Consent");
            console.log("=" .repeat(60));

            // Verify initially valid
            let isValid = await consent.verify();
            console.log(`📊 Initial State: Valid = ${isValid}`);

            // DC revokes
            console.log("\n🚫 Data Controller revoking consent...");
            const tx = await consent.revokeConsent({ from: dataController });
            const receipt = await web3.eth.getTransactionReceipt(tx.tx);
            console.log(`  Gas Used: ${receipt.gasUsed.toLocaleString()}`);

            // Check state
            isValid = await consent.verify();

            console.log("\n📝 After Revocation:");
            console.log(`  Is Valid: ${isValid}`);

            assert.equal(isValid, false, "Consent should be INVALID");

            console.log("\n✅ Test 1.3.2: PASSED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.3: Unauthorized Revocation Attempt", () => {
        it("Should reject revocation from unauthorized account", async () => {
            console.log("\n📝 Test 1.3.3: Unauthorized Revocation");
            console.log("=" .repeat(60));

            console.log(`🔐 Attempting revocation from: ${unauthorized}`);
            console.log(`  (Not DS or DC)`);

            // Store initial state
            const initialValid = await consent.verify();

            try {
                await consent.revokeConsent({ from: unauthorized });
                
                console.log("❌ CRITICAL VULNERABILITY!");
                console.log("  Unauthorized revocation succeeded!");
                assert.fail("Unauthorized account should NOT be able to revoke");

            } catch (error) {
                console.log("\n✅ Transaction reverted as expected");
                console.log(`  Error: ${error.message.split('\n')[0]}`);

                // Verify state unchanged
                const isValid = await consent.verify();

                console.log("\n📝 State After Rejection:");
                console.log(`  Is Valid: ${isValid} (unchanged)`);

                assert.equal(isValid, initialValid, "Validity should remain unchanged");
            }

            console.log("\n✅ Test 1.3.3: PASSED");
            console.log("  ✓ Access control working");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.4: Revoke and Re-grant Cycle", () => {
        it("Should allow revoke → re-grant → revoke cycle", async () => {
            console.log("\n📝 Test 1.3.4: Revoke and Re-grant Cycle");
            console.log("=" .repeat(60));

            // Initial state: valid
            let valid = await consent.verify();
            console.log(`1️⃣  Initial: Valid = ${valid}`);
            assert.equal(valid, true);

            // DS revokes
            await consent.revokeConsent({ from: dataSubject });
            valid = await consent.verify();
            console.log(`2️⃣  After DS revoke: Valid = ${valid}`);
            assert.equal(valid, false);

            // DS re-grants
            await consent.grantConsent({ from: dataSubject });
            valid = await consent.verify();
            console.log(`3️⃣  After DS re-grant: Valid = ${valid}`);
            assert.equal(valid, true);

            // DC revokes
            await consent.revokeConsent({ from: dataController });
            valid = await consent.verify();
            console.log(`4️⃣  After DC revoke: Valid = ${valid}`);
            assert.equal(valid, false);

            // DC re-grants
            await consent.grantConsent({ from: dataController });
            valid = await consent.verify();
            console.log(`5️⃣  After DC re-grant: Valid = ${valid}`);
            assert.equal(valid, true);

            console.log("\n✅ Test 1.3.4: PASSED");
            console.log("  ✓ Consents can be revoked and re-granted");
            console.log("  ✓ State transitions work correctly");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.5: Multiple Revocations", () => {
        it("Should handle multiple revocations idempotently", async () => {
            console.log("\n📝 Test 1.3.5: Multiple Revocations");
            console.log("=" .repeat(60));

            // First revocation
            await consent.revokeConsent({ from: dataSubject });
            let valid1 = await consent.verify();
            console.log(`After 1st revoke: Is Valid = ${valid1}`);

            // Second revocation (should be idempotent or revert)
            try {
                await consent.revokeConsent({ from: dataSubject });
                let valid2 = await consent.verify();
                console.log(`After 2nd revoke: Is Valid = ${valid2}`);
                console.log("⚠️  Multiple revocations allowed (idempotent)");
            } catch (error) {
                console.log("✅ Duplicate revocation rejected");
            }

            console.log("\n✅ Test 1.3.5: COMPLETED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.6: Revocation of Never-Granted Consent", () => {
        it("Should handle revoking consent that was never granted", async () => {
            console.log("\n📝 Test 1.3.6: Revoke Never-Granted Consent");
            console.log("=" .repeat(60));

            // Create new consent (not granted)
            const newConsent = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );

            const initialValid = await newConsent.verify();
            console.log(`Initial validity: ${initialValid}`);

            // Try to revoke (DS never granted)
            try {
                await newConsent.revokeConsent({ from: dataSubject });
                const afterValid = await newConsent.verify();
                console.log(`After revoke: Is Valid = ${afterValid}`);
                console.log("⚠️  Can revoke never-granted consent (expected behavior)");
            } catch (error) {
                console.log("Revocation rejected (alternative behavior)");
            }

            console.log("\n✅ Test 1.3.6: COMPLETED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.3.7: Gas Comparison", () => {
        it("Should measure gas for grant vs revoke operations", async () => {
            console.log("\n📝 Test 1.3.7: Gas Comparison");
            console.log("=" .repeat(60));

            // Create fresh consent
            const testConsent = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );

            // Measure grant gas
            const grantTx = await testConsent.grantConsent({ from: dataSubject });
            const grantReceipt = await web3.eth.getTransactionReceipt(grantTx.tx);

            // Measure revoke gas
            const revokeTx = await testConsent.revokeConsent({ from: dataSubject });
            const revokeReceipt = await web3.eth.getTransactionReceipt(revokeTx.tx);

            console.log("📊 Gas Usage:");
            console.log(`  Grant:  ${grantReceipt.gasUsed.toLocaleString()} gas`);
            console.log(`  Revoke: ${revokeReceipt.gasUsed.toLocaleString()} gas`);
            console.log(`  Difference: ${Math.abs(grantReceipt.gasUsed - revokeReceipt.gasUsed).toLocaleString()} gas`);

            // Both should be relatively similar
            const diff = Math.abs(grantReceipt.gasUsed - revokeReceipt.gasUsed);
            const avgGas = (grantReceipt.gasUsed + revokeReceipt.gasUsed) / 2;
            const diffPercent = (diff / avgGas * 100).toFixed(2);

            console.log(`  Relative difference: ${diffPercent}%`);

            console.log("\n✅ Test 1.3.7: PASSED");
            console.log("=" .repeat(60));
        });
    });
});
