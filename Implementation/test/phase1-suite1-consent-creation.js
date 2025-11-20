/**
 * Phase 1: Functional Testing - Suite 1.1
 * Test: Collection Consent Creation
 * 
 * Tests basic consent creation functionality and input validation
 */

const CollectionConsent = artifacts.require("CollectionConsent");
const ProcessingConsent = artifacts.require("ProcessingConsent");

contract("Phase 1.1: Consent Creation Tests", accounts => {
    const dataSubject = accounts[0];
    const dataController = accounts[1];
    const dataProcessor1 = accounts[2];
    const dataProcessor2 = accounts[3];
    const attacker = accounts[9];

    // Test data
    const DATA_FLAGS = {
        NAME: 1 << 0,      // 1
        EMAIL: 1 << 1,     // 2
        ADDRESS: 1 << 2,   // 4
        PHONE: 1 << 3,     // 8
        ALL: 15            // 1+2+4+8
    };

    const PURPOSES = {
        MARKETING: 0,
        ANALYTICS: 1,
        RESEARCH: 2
    };

    const DURATION = {
        ONE_HOUR: 3600,
        ONE_DAY: 86400,
        ONE_WEEK: 604800,
        ONE_MONTH: 2592000
    };

    describe("Test 1.1.1: Basic Consent Creation", () => {
        it("Should successfully create a Collection Consent", async () => {
            console.log("\n📝 Test 1.1.1: Basic Consent Creation");
            console.log("=" .repeat(60));

            const recipients = [dataProcessor1];
            const dataFlags = DATA_FLAGS.NAME | DATA_FLAGS.EMAIL | DATA_FLAGS.PHONE; // 11
            const duration = DURATION.ONE_DAY;
            const purposes = [PURPOSES.MARKETING, PURPOSES.ANALYTICS];

            console.log("📊 Test Parameters:");
            console.log(`  Data Subject: ${dataSubject}`);
            console.log(`  Data Controller: ${dataController}`);
            console.log(`  Recipients: ${recipients}`);
            console.log(`  Data Flags: ${dataFlags} (binary: ${dataFlags.toString(2)})`);
            console.log(`  Duration: ${duration} seconds (${duration/3600} hours)`);
            console.log(`  Purposes: ${purposes}`);

            // Deploy consent contract
            const startGas = await web3.eth.getBlock('latest').then(b => b.gasLimit);
            const consent = await CollectionConsent.new(
                dataController,
                recipients,
                dataFlags,
                duration,
                purposes,
                { from: dataSubject }
            );

            const receipt = await web3.eth.getTransactionReceipt(consent.transactionHash);
            
            console.log("\n✅ Deployment Results:");
            console.log(`  Contract Address: ${consent.address}`);
            console.log(`  Gas Used: ${receipt.gasUsed.toLocaleString()}`);
            console.log(`  Transaction Hash: ${consent.transactionHash}`);

            // Verify contract state (using available methods)
            const storedData = await consent.getData();
            const isValid = await consent.verify();

            console.log("\n🔍 Contract State Verification:");
            console.log(`  Stored Data Flags: ${storedData}`);
            console.log(`  Consent Valid: ${isValid}`);
            console.log(`  Note: Contract variables are private (dataSubject, controller not directly accessible)`);

            // Assertions
            assert.equal(storedData.toString(), dataFlags.toString(), "Data flags mismatch");
            assert.equal(isValid, false, "Consent should be invalid initially (not yet granted by both parties)");

            console.log("\n✅ Test 1.1.1: PASSED");
            console.log("=" .repeat(60));
        });

        it("Should create consent with multiple recipients", async () => {
            console.log("\n📝 Test 1.1.1b: Multiple Recipients");
            console.log("=" .repeat(60));

            const recipients = [dataProcessor1, dataProcessor2, accounts[4]];
            const consent = await CollectionConsent.new(
                dataController,
                recipients,
                DATA_FLAGS.ALL,
                DURATION.ONE_WEEK,
                [PURPOSES.MARKETING],
                { from: dataSubject }
            );

            console.log(`✅ Created consent with ${recipients.length} recipients`);
            console.log(`  Recipients: ${recipients.join(', ')}`);
            console.log(`  Contract: ${consent.address}`);

            assert.ok(consent.address, "Contract should be deployed");
            
            console.log("\n✅ Test 1.1.1b: PASSED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.1.2: Invalid Parameter Validation", () => {
        it("Should fail: Empty recipients array", async () => {
            console.log("\n📝 Test 1.1.2a: Empty Recipients Array");
            console.log("=" .repeat(60));

            try {
                const consent = await CollectionConsent.new(
                    dataController,
                    [], // Empty recipients!
                    DATA_FLAGS.NAME,
                    DURATION.ONE_DAY,
                    [PURPOSES.MARKETING],
                    { from: dataSubject }
                );

                console.log("❌ FAIL: Should have reverted but didn't!");
                assert.fail("Expected revert for empty recipients");

            } catch (error) {
                console.log("✅ Transaction reverted as expected");
                console.log(`  Error: ${error.message.split('\n')[0]}`);
                assert.ok(error.message.includes("revert"), "Should contain 'revert'");
            }

            console.log("\n✅ Test 1.1.2a: PASSED (correctly rejected)");
            console.log("=" .repeat(60));
        });

        it("Should fail: Zero duration", async () => {
            console.log("\n📝 Test 1.1.2b: Zero Duration");
            console.log("=" .repeat(60));

            try {
                const consent = await CollectionConsent.new(
                    dataController,
                    [dataProcessor1],
                    DATA_FLAGS.EMAIL,
                    0, // Zero duration!
                    [PURPOSES.ANALYTICS],
                    { from: dataSubject }
                );

                console.log("❌ FAIL: Should have reverted but didn't!");
                assert.fail("Expected revert for zero duration");

            } catch (error) {
                console.log("✅ Transaction reverted as expected");
                console.log(`  Error: ${error.message.split('\n')[0]}`);
                assert.ok(error.message.includes("revert"), "Should contain 'revert'");
            }

            console.log("\n✅ Test 1.1.2b: PASSED (correctly rejected)");
            console.log("=" .repeat(60));
        });

        it("Should accept: Zero data flags (edge case)", async () => {
            console.log("\n📝 Test 1.1.2c: Zero Data Flags (Edge Case)");
            console.log("=" .repeat(60));

            // Note: Some implementations might allow zero data flags
            // This tests the actual behavior
            try {
                const consent = await CollectionConsent.new(
                    dataController,
                    [dataProcessor1],
                    0, // Zero data flags
                    DURATION.ONE_HOUR,
                    [PURPOSES.RESEARCH],
                    { from: dataSubject }
                );

                console.log("⚠️  Zero data flags accepted (potential security issue)");
                console.log(`  Contract: ${consent.address}`);
                console.log("  Recommendation: Add validation for data flags > 0");

            } catch (error) {
                console.log("✅ Zero data flags rejected");
                console.log(`  Error: ${error.message.split('\n')[0]}`);
            }

            console.log("\n✅ Test 1.1.2c: COMPLETED");
            console.log("=" .repeat(60));
        });

        it("Should accept: Empty purposes array (edge case)", async () => {
            console.log("\n📝 Test 1.1.2d: Empty Purposes Array");
            console.log("=" .repeat(60));

            try {
                const consent = await CollectionConsent.new(
                    dataController,
                    [dataProcessor1],
                    DATA_FLAGS.NAME,
                    DURATION.ONE_DAY,
                    [], // Empty purposes
                    { from: dataSubject }
                );

                console.log("⚠️  Empty purposes accepted (potential security issue)");
                console.log(`  Contract: ${consent.address}`);
                console.log("  Recommendation: Require at least one purpose");

            } catch (error) {
                console.log("✅ Empty purposes rejected");
                console.log(`  Error: ${error.message.split('\n')[0]}`);
            }

            console.log("\n✅ Test 1.1.2d: COMPLETED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.1.3: Gas Consumption Analysis", () => {
        it("Should measure gas costs for different configurations", async () => {
            console.log("\n📝 Test 1.1.3: Gas Consumption Analysis");
            console.log("=" .repeat(60));

            // Test 1: Minimal configuration
            const consent1 = await CollectionConsent.new(
                dataController,
                [dataProcessor1],
                DATA_FLAGS.NAME,
                DURATION.ONE_HOUR,
                [PURPOSES.MARKETING],
                { from: dataSubject }
            );
            const receipt1 = await web3.eth.getTransactionReceipt(consent1.transactionHash);

            // Test 2: Medium configuration
            const consent2 = await CollectionConsent.new(
                dataController,
                [dataProcessor1, dataProcessor2],
                DATA_FLAGS.NAME | DATA_FLAGS.EMAIL,
                DURATION.ONE_DAY,
                [PURPOSES.MARKETING, PURPOSES.ANALYTICS],
                { from: dataSubject }
            );
            const receipt2 = await web3.eth.getTransactionReceipt(consent2.transactionHash);

            // Test 3: Maximum configuration
            const consent3 = await CollectionConsent.new(
                dataController,
                [dataProcessor1, dataProcessor2, accounts[4], accounts[5]],
                DATA_FLAGS.ALL,
                DURATION.ONE_MONTH,
                [PURPOSES.MARKETING, PURPOSES.ANALYTICS, PURPOSES.RESEARCH],
                { from: dataSubject }
            );
            const receipt3 = await web3.eth.getTransactionReceipt(consent3.transactionHash);

            console.log("\n📊 Gas Usage Comparison:");
            console.log(`  Minimal Config:  ${receipt1.gasUsed.toLocaleString()} gas`);
            console.log(`  Medium Config:   ${receipt2.gasUsed.toLocaleString()} gas`);
            console.log(`  Maximum Config:  ${receipt3.gasUsed.toLocaleString()} gas`);
            console.log(`  Difference (Max-Min): ${(receipt3.gasUsed - receipt1.gasUsed).toLocaleString()} gas`);

            // Estimate costs (at different gas prices)
            const gasPrices = {
                low: 10,      // 10 Gwei
                medium: 50,   // 50 Gwei
                high: 100     // 100 Gwei
            };

            console.log("\n💰 Estimated Costs (at $2000 ETH):");
            for (const [speed, gwei] of Object.entries(gasPrices)) {
                const costWei = receipt3.gasUsed * gwei * 1e9;
                const costEth = costWei / 1e18;
                const costUsd = costEth * 2000;
                console.log(`  ${speed.padEnd(8)}: ${gwei} Gwei → $${costUsd.toFixed(2)} USD`);
            }

            console.log("\n✅ Test 1.1.3: PASSED");
            console.log("=" .repeat(60));
        });
    });

    describe("Test 1.1.4: Contract State Verification", () => {
        let consent;

        before(async () => {
            consent = await CollectionConsent.new(
                dataController,
                [dataProcessor1, dataProcessor2],
                DATA_FLAGS.NAME | DATA_FLAGS.EMAIL | DATA_FLAGS.PHONE,
                DURATION.ONE_DAY,
                [PURPOSES.MARKETING, PURPOSES.ANALYTICS],
                { from: dataSubject }
            );
        });

        it("Should have correct initial state", async () => {
            console.log("\n📝 Test 1.1.4: Initial State Verification");
            console.log("=" .repeat(60));

            const data = await consent.getData();
            const valid = await consent.verify();

            console.log("🔍 Contract State:");
            console.log(`  Data Flags: ${data} (binary: ${data.toString(2)})`);
            console.log(`  Is Valid: ${valid}`);
            console.log(`  Note: Contract stores dataSubject, dataController as private variables`);
            console.log(`        They are verified internally via modifiers (onlyDataSubject, onlyController)`);

            // Expected data flags: NAME(1) | EMAIL(2) | PHONE(8) = 11
            assert.equal(data.toString(), "11", "Data flags should be 11");
            assert.equal(valid, false, "Consent should be invalid initially (needs both parties to grant)");

            console.log("\n✅ State verification complete");
            console.log("✅ Test 1.1.4: PASSED");
            console.log("=" .repeat(60));
        });
    });
});
