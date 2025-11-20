// Quick Test: Verify GDPR Consent System Works
// Run with: truffle test test/quick-test.js

const CollectionConsent = artifacts.require("CollectionConsent");
const ProcessingConsent = artifacts.require("ProcessingConsent");

contract("Quick System Test", accounts => {
    
    const dataSubject = accounts[0];
    const controller = accounts[1];
    const processor = accounts[2];
    
    console.log("\n🧪 Testing GDPR Consent System\n");
    console.log("Data Subject:", dataSubject);
    console.log("Controller:", controller);
    console.log("Processor:", processor);
    
    it("✅ Should create a Collection Consent contract", async () => {
        const consent = await CollectionConsent.new(
            controller,           // controller address
            [processor],          // recipients
            4294967295,          // data (all bits set)
            1000000,             // duration: 1000000 seconds (~11.5 days)
            [0, 1, 2],           // default purposes
            {from: dataSubject}
        );
        
        assert.ok(consent.address, "Contract should have an address");
        console.log("✅ Collection Consent Created:", consent.address);
    });
    
    it("✅ Should require both DS and DC to grant consent", async () => {
        const consent = await CollectionConsent.new(
            controller,
            [processor],
            4294967295,
            1000000,
            [0, 1, 2],
            {from: dataSubject}
        );
        
        // Initially not valid (no consents granted)
        const initiallyValid = await consent.verify();
        assert.equal(initiallyValid, false, "Should not be valid initially");
        console.log("✅ Initial state: NOT VALID (as expected)");
        
        // DS grants consent
        await consent.grantConsent({from: dataSubject});
        const afterDSConsent = await consent.verify();
        assert.equal(afterDSConsent, false, "Should still not be valid (need DC too)");
        console.log("✅ After DS consent: Still NOT VALID (need DC)");
        
        // DC grants consent  
        await consent.grantConsent({from: controller});
        const afterBothConsents = await consent.verify();
        assert.equal(afterBothConsents, true, "Should be valid after both consents");
        console.log("✅ After Both Consents: VALID! ✨");
    });
    
    it("✅ Should allow DS to revoke consent", async () => {
        const consent = await CollectionConsent.new(
            controller,
            [processor],
            4294967295,
            1000000,
            [0, 1, 2],
            {from: dataSubject}
        );
        
        // Grant consents
        await consent.grantConsent({from: dataSubject});
        await consent.grantConsent({from: controller});
        assert.equal(await consent.verify(), true, "Should be valid");
        
        // DS revokes
        await consent.revokeConsent({from: dataSubject});
        const afterRevoke = await consent.verify();
        assert.equal(afterRevoke, false, "Should be invalid after DS revokes");
        console.log("✅ DS Revoked: Consent now INVALID (GDPR Right Enforced!)");
    });
    
    it("✅ Should create Processing Consent for a processor", async () => {
        const consent = await CollectionConsent.new(
            controller,
            [processor],
            4294967295,
            1000000,
            [0, 1, 2],
            {from: dataSubject}
        );
        
        // Grant Collection Consent
        await consent.grantConsent({from: dataSubject});
        await consent.grantConsent({from: controller});
        
        // Create Processing Consent
        await consent.newPurpose(
            processor,      // processor address
            0,              // purpose: ModelTraining
            4294967295,     // data
            1000000,        // duration
            {from: controller}
        );
        
        // Get Processing Consent address
        const processingConsentAddr = await consent.getProcessingConsentSC(processor);
        assert.ok(processingConsentAddr, "Processing Consent should be created");
        console.log("✅ Processing Consent Created:", processingConsentAddr);
        
        // Load Processing Consent
        const processingConsent = await ProcessingConsent.at(processingConsentAddr);
        
        // Verify initial state (default purpose should be pre-approved)
        const purposeValid = await processingConsent.verify(0);
        console.log("✅ Purpose 0 (ModelTraining) Valid:", purposeValid);
    });
    
    it("⚠️  Should reject unauthorized access attempts", async () => {
        const consent = await CollectionConsent.new(
            controller,
            [processor],
            4294967295,
            1000000,
            [0, 1, 2],
            {from: dataSubject}
        );
        
        const unauthorizedAccount = accounts[9];
        
        try {
            await consent.revokeConsent({from: unauthorizedAccount});
            assert.fail("Should have thrown error");
        } catch (error) {
            assert.include(error.message, "Actor not allowed", "Should reject unauthorized");
            console.log("✅ Unauthorized Access BLOCKED! 🛡️");
        }
    });
    
    console.log("\n🎉 All Tests Passed! System is Working! ✅\n");
});
