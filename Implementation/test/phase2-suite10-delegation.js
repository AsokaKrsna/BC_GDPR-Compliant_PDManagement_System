/**
 * Phase 2: Research Goal - Suite 2.10
 * Test: Delegation of Power (Scalability & UX)
 * 
 * Goal:
 *  - Verify that a Data Subject can delegate consent management to a third party.
 *  - This addresses the "Scalability" and "UX" issues mentioned in the research goals.
 *  - Allows a "User Agent" or "Wallet Provider" to manage consents without
 *    requiring the user to sign every single transaction personally.
 */

const DelegatedCollectionConsent = artifacts.require("DelegatedCollectionConsent");

contract("Phase 2.10: Delegation of Power", accounts => {
    const dataSubject = accounts[0];
    const dataController = accounts[1];
    const recipient = accounts[2];
    const delegate = accounts[3];
    const unauthorized = accounts[4];

    let consent;

    beforeEach(async () => {
        // Deploy the DELEGATED consent contract
        consent = await DelegatedCollectionConsent.new(
            dataController,
            [recipient],
            15,
            86400,
            [0],
            { from: dataSubject }
        );
    });

    describe("Test 2.10.1: Delegate Management", () => {
        it("Should allow DS to add and remove a delegate", async () => {
            console.log("\n🧪 Test 2.10.1: Delegate Management");
            console.log("=".repeat(70));

            // 1. Check initial state
            let isDelegate = await consent.delegates(delegate);
            console.log(`Initial delegate status: ${isDelegate}`);
            assert.equal(isDelegate, false, "Should not be delegate initially");

            // 2. Add delegate
            console.log(`Adding delegate: ${delegate}`);
            await consent.addDelegate(delegate, { from: dataSubject });
            
            isDelegate = await consent.delegates(delegate);
            console.log(`Status after add: ${isDelegate}`);
            assert.equal(isDelegate, true, "Should be delegate after adding");

            // 3. Remove delegate
            console.log(`Removing delegate: ${delegate}`);
            await consent.removeDelegate(delegate, { from: dataSubject });

            isDelegate = await consent.delegates(delegate);
            console.log(`Status after remove: ${isDelegate}`);
            assert.equal(isDelegate, false, "Should not be delegate after removal");

            console.log("\n✅ Test 2.10.1: PASSED");
        });

        it("Should prevent unauthorized users from adding delegates", async () => {
            console.log("\n🧪 Test 2.10.1b: Unauthorized Delegate Addition");
            
            try {
                await consent.addDelegate(delegate, { from: unauthorized });
                assert.fail("Should have thrown error");
            } catch (e) {
                console.log(`Error caught as expected: ${e.message}`);
                assert.include(e.message, "Only the data Subject", "Error message mismatch");
            }
            console.log("\n✅ Test 2.10.1b: PASSED");
        });
    });

    describe("Test 2.10.2: Delegated Granting", () => {
        it("Should allow delegate to grant consent on behalf of DS", async () => {
            console.log("\n🧪 Test 2.10.2: Delegated Granting");
            console.log("=".repeat(70));

            // Add delegate
            await consent.addDelegate(delegate, { from: dataSubject });

            // Delegate grants consent
            console.log(`Delegate (${delegate}) granting consent...`);
            await consent.grantConsent({ from: delegate });

            // DC grants consent
            console.log(`DC (${dataController}) granting consent...`);
            await consent.grantConsent({ from: dataController });

            // Verify
            const isValid = await consent.verify();
            console.log(`Consent Valid: ${isValid}`);
            assert.equal(isValid, true, "Consent should be valid after delegate grant");

            console.log("\n✅ Test 2.10.2: PASSED");
        });
    });

    describe("Test 2.10.3: Delegated Revocation", () => {
        it("Should allow delegate to revoke consent", async () => {
            console.log("\n🧪 Test 2.10.3: Delegated Revocation");
            console.log("=".repeat(70));

            // Setup: Valid consent
            await consent.addDelegate(delegate, { from: dataSubject });
            await consent.grantConsent({ from: dataSubject });
            await consent.grantConsent({ from: dataController });
            assert.equal(await consent.verify(), true);

            // Delegate revokes
            console.log(`Delegate (${delegate}) revoking consent...`);
            await consent.revokeConsent({ from: delegate });

            // Verify
            const isValid = await consent.verify();
            console.log(`Consent Valid: ${isValid}`);
            assert.equal(isValid, false, "Consent should be revoked by delegate");

            console.log("\n✅ Test 2.10.3: PASSED");
        });
    });

    describe("Test 2.10.4: Mixed Operations", () => {
        it("Should allow DS to revoke what Delegate granted", async () => {
            console.log("\n🧪 Test 2.10.4: Mixed Operations");
            console.log("=".repeat(70));

            await consent.addDelegate(delegate, { from: dataSubject });

            // Delegate grants
            await consent.grantConsent({ from: delegate });
            await consent.grantConsent({ from: dataController });
            assert.equal(await consent.verify(), true, "Valid after delegate grant");

            // DS revokes
            console.log("DS revoking consent granted by delegate...");
            await consent.revokeConsent({ from: dataSubject });
            
            assert.equal(await consent.verify(), false, "DS should be able to revoke");

            console.log("\n✅ Test 2.10.4: PASSED");
        });
    });
});
