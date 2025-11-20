/**
 * PHASE 2.5: EDGE CASES & BOUNDARY CONDITIONS
 * 
 * Testing unusual scenarios that might break the system:
 * - Zero values and empty arrays
 * - Extreme values and boundary conditions
 * - Race conditions and timing attacks
 * - Unusual transaction patterns
 * - Self-referential consents
 * - Circular dependencies
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 2.5: Edge Cases & Boundary Conditions", accounts => {
    const dataSubject = accounts[0];
    const dataController = accounts[1];
    const dataProcessor = accounts[2];

    describe("Test 2.5.1: Zero Duration Consent", () => {
        it("Should test consent with zero or very short duration", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.1: Zero Duration Consent");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: Can consent have zero duration?");
            
            console.log("\n1️⃣ Creating consent with duration = 0:");
            try {
                const consent1 = await CollectionConsent.new(
                    dataController,
                    [dataProcessor],
                    15,
                    0, // Zero duration!
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ✅ Zero duration accepted: ${consent1.address}`);
                
                await consent1.grantConsent({ from: dataSubject });
                await consent1.grantConsent({ from: dataController });
                
                const valid = await consent1.verify();
                console.log(`   Status immediately after grant: ${valid ? 'VALID' : 'EXPIRED'}`);
                
                if (!valid) {
                    console.log("   ⚠️ Consent expired immediately (timestamp check failed)");
                } else {
                    console.log("   ⚠️ Zero duration consent is valid (no duration check?)");
                }
                
            } catch(e) {
                console.log(`   ✅ Zero duration rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n2️⃣ Creating consent with duration = 1 second:");
            try {
                const consent2 = await CollectionConsent.new(
                    dataController,
                    [dataProcessor],
                    15,
                    1, // 1 second duration
                    [0],
                    { from: dataSubject }
                );
                
                await consent2.grantConsent({ from: dataSubject });
                await consent2.grantConsent({ from: dataController });
                
                const valid1 = await consent2.verify();
                console.log(`   Status immediately: ${valid1 ? 'VALID' : 'EXPIRED'}`);
                
                // Wait for next block
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const valid2 = await consent2.verify();
                console.log(`   Status after 1 second: ${valid2 ? 'VALID' : 'EXPIRED'}`);
                
            } catch(e) {
                console.log(`   Error: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Creating consent with negative duration (underflow):");
            try {
                const consent3 = await CollectionConsent.new(
                    dataController,
                    [dataProcessor],
                    15,
                    -1, // Negative duration (JavaScript will convert)
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Negative duration accepted: ${consent3.address}`);
                console.log(`   This likely wrapped to huge positive number (uint underflow)`);
                
            } catch(e) {
                console.log(`   ✅ Negative duration rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Zero duration: Should be rejected (meaningless consent)");
            console.log("  → Very short duration: Vulnerable to timestamp manipulation");
            console.log("  → Negative duration: Type system should catch, but might wrap");
            
            console.log("\n🔍 Expected Behavior:");
            console.log("  • Minimum duration: 1 hour (3600 seconds)");
            console.log("  • Maximum duration: 2 years (GDPR recommendation)");
            console.log("  • Reject: Zero, negative, or extreme values");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.2: Empty Recipient Array", () => {
        it("Should test consent with no recipients", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.2: Empty Recipient Array");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: Can consent have zero recipients?");
            
            console.log("\n1️⃣ Creating consent with empty recipient array:");
            try {
                const consent = await CollectionConsent.new(
                    dataController,
                    [], // Empty array!
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Empty recipients accepted: ${consent.address}`);
                console.log(`   This is a consent with NO ONE to share data with!`);
                console.log(`   Meaningless but technically valid?`);
                
                await consent.grantConsent({ from: dataSubject });
                await consent.grantConsent({ from: dataController });
                
                const valid = await consent.verify();
                console.log(`   Status: ${valid ? 'VALID' : 'INVALID'}`);
                
                console.log("\n   💡 Question: Who can access data if recipients = []?");
                console.log("   → DC can access (controller always has access)");
                console.log("   → But no processors authorized");
                console.log("   → Is this a valid use case or a bug?");
                
            } catch(e) {
                console.log(`   ✅ Empty recipients rejected: ${e.reason || e.message}`);
                console.log(`   Good validation - consent must have at least one recipient`);
            }
            
            console.log("\n2️⃣ Creating consent with null recipient address:");
            try {
                const consent2 = await CollectionConsent.new(
                    dataController,
                    ["0x0000000000000000000000000000000000000000"], // Zero address
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Zero address recipient accepted: ${consent2.address}`);
                console.log(`   Consent granted to address(0) - impossible to access!`);
                
            } catch(e) {
                console.log(`   ✅ Zero address rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Creating consent with duplicate recipients:");
            const duplicates = [dataProcessor, dataProcessor, dataProcessor];
            try {
                const consent3 = await CollectionConsent.new(
                    dataController,
                    duplicates,
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Duplicate recipients accepted: ${consent3.address}`);
                console.log(`   Same processor listed 3 times - wastes gas, confusing`);
                
            } catch(e) {
                console.log(`   ✅ Duplicates rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Empty recipients: Meaningless consent");
            console.log("  → Zero address: Impossible to access");
            console.log("  → Duplicates: Gas waste, potential bugs");
            
            console.log("\n🔍 Expected Behavior:");
            console.log("  • Require at least 1 recipient");
            console.log("  • Reject zero address (0x0)");
            console.log("  • Reject or deduplicate duplicate addresses");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.3: Self-Referential Consent", () => {
        it("Should test DS granting consent to themselves", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.3: Self-Referential Consent");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: Can DS be their own DC or DP?");
            
            console.log("\n1️⃣ DS = DC (same person as controller):");
            try {
                const consent1 = await CollectionConsent.new(
                    dataSubject, // DC = DS (same address)
                    [dataProcessor],
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ✅ Self-consent accepted: ${consent1.address}`);
                console.log(`   DS is granting consent to themselves as DC`);
                console.log(`   This is philosophically weird but might be valid?`);
                
                await consent1.grantConsent({ from: dataSubject });
                // DS = DC, so same address grants as both
                
                const valid = await consent1.verify();
                console.log(`   Status after single grant: ${valid ? 'VALID' : 'PENDING'}`);
                
                if (valid) {
                    console.log(`   ⚠️ Single grant sufficient when DS = DC!`);
                    console.log(`   This bypasses two-party requirement`);
                }
                
            } catch(e) {
                console.log(`   ✅ Self-consent rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n2️⃣ DS as one of the recipients:");
            try {
                const consent2 = await CollectionConsent.new(
                    dataController,
                    [dataSubject, dataProcessor], // DS is a recipient!
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ✅ DS as recipient accepted: ${consent2.address}`);
                console.log(`   DS grants consent for DC to share data WITH DS`);
                console.log(`   Circular: DS → DC → DS (why?)`);;
                
            } catch(e) {
                console.log(`   Rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Fully circular: DS = DC = DP:");
            try {
                const consent3 = await CollectionConsent.new(
                    dataSubject, // DC = DS
                    [dataSubject], // DP = DS
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Fully circular consent accepted: ${consent3.address}`);
                console.log(`   DS grants themselves permission to share data with themselves`);
                console.log(`   This makes no sense but is technically valid?`);
                
            } catch(e) {
                console.log(`   ✅ Circular consent rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Self-consent: Bypasses two-party protection");
            console.log("  → Circular references: Meaningless but allowed");
            console.log("  → No role validation: Anyone can be any role");
            
            console.log("\n🔍 Expected Behavior:");
            console.log("  • Require DS ≠ DC (different parties)");
            console.log("  • Reject DS in recipient list (circular)");
            console.log("  • Enforce role separation");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.4: Race Condition - Simultaneous Grant/Revoke", () => {
        it("Should test rapid grant/revoke cycles", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.4: Race Condition - Grant/Revoke Spam");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: What happens with rapid state changes?");
            
            const consent = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            console.log(`\nConsent created: ${consent.address}`);
            
            console.log("\n1️⃣ Rapid grant/revoke cycle (10 iterations):");
            
            for (let i = 0; i < 10; i++) {
                await consent.grantConsent({ from: dataSubject });
                await consent.grantConsent({ from: dataController });
                const valid1 = await consent.verify();
                
                await consent.revokeConsent({ from: dataSubject });
                const valid2 = await consent.verify();
                
                if (i === 0 || i === 9) {
                    console.log(`   Cycle ${i+1}: Grant=${valid1}, Revoke=${valid2}`);
                }
            }
            
            console.log(`   ✅ Completed 10 rapid grant/revoke cycles`);
            console.log(`   No errors - contract handles state changes`);
            
            console.log("\n2️⃣ Testing idempotency - multiple grants:");
            await consent.grantConsent({ from: dataSubject });
            await consent.grantConsent({ from: dataSubject }); // Grant twice
            await consent.grantConsent({ from: dataSubject }); // Grant thrice
            
            console.log(`   ✅ Multiple grants from same party accepted`);
            console.log(`   Function is idempotent (no error on repeat)`);
            
            console.log("\n3️⃣ Testing multiple revocations:");
            await consent.revokeConsent({ from: dataSubject });
            
            try {
                await consent.revokeConsent({ from: dataSubject }); // Revoke twice
                console.log(`   ✅ Multiple revocations accepted (idempotent)`);
            } catch(e) {
                console.log(`   ⚠️ Second revocation failed: ${e.reason || e.message}`);
            }
            
            console.log("\n4️⃣ Grant after revoke (regrant test):");
            await consent.grantConsent({ from: dataSubject });
            await consent.grantConsent({ from: dataController });
            
            const finalStatus = await consent.verify();
            console.log(`   Final status after regrant: ${finalStatus ? 'ACTIVE' : 'REVOKED'}`);
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Rapid state changes: Contract handles correctly");
            console.log("  → Idempotency: Functions can be called multiple times");
            console.log("  → No rate limiting: Could be used for gas griefing");
            
            console.log("\n🔍 Potential Issues:");
            console.log("  • No rate limiting on consent changes");
            console.log("  • No cost for spamming grant/revoke");
            console.log("  • Could be used to bloat transaction history");
            console.log("  • Makes audit trail noisy");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.5: DataFlags Boundary Tests", () => {
        it("Should test dataFlags with unusual values", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.5: DataFlags Boundary Tests");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: What dataFlags values are accepted?");
            
            console.log("\n1️⃣ Creating consent with dataFlags = 0:");
            try {
                const consent1 = await CollectionConsent.new(
                    dataController,
                    [dataProcessor],
                    0, // Zero data flags!
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Zero dataFlags accepted: ${consent1.address}`);
                console.log(`   Consent grants access to... nothing?`);
                console.log(`   All flag bits are 0 = no data types consented`);
                
            } catch(e) {
                console.log(`   ✅ Zero dataFlags rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n2️⃣ Creating consent with all flags set (max uint):");
            const maxFlags = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
            try {
                const consent2 = await CollectionConsent.new(
                    dataController,
                    [dataProcessor],
                    maxFlags, // All 256 bits set
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                console.log(`   ⚠️ Max dataFlags accepted: ${consent2.address}`);
                console.log(`   All 256 data types consented (including undefined ones!)`);
                console.log(`   Future data types automatically included`);
                
            } catch(e) {
                console.log(`   ✅ Max dataFlags rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Testing specific bit patterns:");
            
            const patterns = [
                { name: "Single bit (1)", value: 1 },
                { name: "Powers of 2", value: 256 }, // Bit 8
                { name: "Sequential bits", value: 15 }, // 1111 in binary
                { name: "Alternating bits", value: 0xAAAAAAAA },
            ];
            
            for (const pattern of patterns) {
                try {
                    const c = await CollectionConsent.new(
                        dataController,
                        [dataProcessor],
                        pattern.value,
                        86400,
                        [0],
                        { from: dataSubject }
                    );
                    console.log(`   ✅ ${pattern.name} (${pattern.value}): Accepted`);
                } catch(e) {
                    console.log(`   ❌ ${pattern.name}: Rejected`);
                }
            }
            
            console.log("\n4️⃣ Checking data type semantics:");
            console.log("   Current implementation uses bit flags:");
            console.log("   • Bit 0 (value 1): Medical data");
            console.log("   • Bit 1 (value 2): Financial data");
            console.log("   • Bit 2 (value 4): Location data");
            console.log("   • Bit 3 (value 8): Communications");
            console.log("   • Bits 4-255: Undefined (but accepted!)");
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Zero flags: Meaningless consent");
            console.log("  → All flags: Dangerous over-permission");
            console.log("  → Undefined bits: Future data types auto-included");
            
            console.log("\n🔍 Expected Behavior:");
            console.log("  • Reject zero flags (must consent to something)");
            console.log("  • Define maximum valid flag value");
            console.log("  • Reject undefined data type bits");
            console.log("  • Document data type mapping");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.6: Purpose Array Edge Cases", () => {
        it("Should test unusual purpose configurations", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.6: Purpose Array Edge Cases");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: What purpose values are accepted?");
            
            const consent = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0], // Initial purpose
                { from: dataSubject }
            );
            
            await consent.grantConsent({ from: dataSubject });
            await consent.grantConsent({ from: dataController });
            
            console.log(`\nConsent created: ${consent.address}`);
            
            console.log("\n1️⃣ Adding purpose with empty array:");
            try {
                await consent.newPurpose(dataProcessor, [], { from: dataController });
                console.log(`   ⚠️ Empty purpose array accepted`);
                console.log(`   Processing consent with no purposes?`);
            } catch(e) {
                console.log(`   ✅ Empty purpose rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n2️⃣ Adding purpose with duplicate values:");
            try {
                await consent.newPurpose(
                    dataProcessor,
                    [1, 1, 1, 1], // Same purpose 4 times
                    { from: dataController }
                );
                console.log(`   ⚠️ Duplicate purposes accepted`);
                console.log(`   Same purpose listed 4 times - wasteful`);
            } catch(e) {
                console.log(`   ✅ Duplicates rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Adding purpose with zero value:");
            try {
                await consent.newPurpose(
                    dataProcessor,
                    [0], // Zero purpose
                    { from: dataController }
                );
                console.log(`   ⚠️ Zero purpose accepted`);
                console.log(`   What does purpose=0 mean? Undefined purpose?`);
            } catch(e) {
                console.log(`   ✅ Zero purpose rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n4️⃣ Adding purpose with huge values:");
            try {
                await consent.newPurpose(
                    dataProcessor,
                    [999999, 888888, 777777], // Undefined purposes
                    { from: dataController }
                );
                console.log(`   ⚠️ Huge purpose values accepted`);
                console.log(`   Purposes 999999+ are undefined but allowed`);
            } catch(e) {
                console.log(`   ✅ Huge purposes rejected: ${e.reason || e.message}`);
            }
            
            console.log("\n5️⃣ Testing same processor multiple times:");
            try {
                await consent.newPurpose(dataProcessor, [1], { from: dataController });
                await consent.newPurpose(dataProcessor, [2], { from: dataController });
                await consent.newPurpose(dataProcessor, [3], { from: dataController });
                
                console.log(`   ✅ Same processor added 3 times with different purposes`);
                console.log(`   Creates multiple ProcessingConsent contracts`);
                console.log(`   Could this cause confusion or gas waste?`);
                
            } catch(e) {
                console.log(`   Error: ${e.reason || e.message}`);
            }
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Empty purposes: Meaningless processing consent");
            console.log("  → Duplicate purposes: Gas waste, confusing");
            console.log("  → Zero/undefined purposes: Semantic issues");
            console.log("  → Multiple contracts per processor: Complexity");
            
            console.log("\n🔍 Expected Behavior:");
            console.log("  • Require at least one purpose");
            console.log("  • Deduplicate purpose arrays");
            console.log("  • Validate purpose values against enum");
            console.log("  • Prevent duplicate processor entries");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.7: Transaction Ordering Dependencies", () => {
        it("Should test if operation order matters", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.7: Transaction Ordering Dependencies");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: Does order of operations matter?");
            
            console.log("\n1️⃣ Scenario A: Grant → Revoke → Verify");
            const consent1 = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            await consent1.grantConsent({ from: dataSubject });
            await consent1.grantConsent({ from: dataController });
            const status1a = await consent1.verify();
            
            await consent1.revokeConsent({ from: dataSubject });
            const status1b = await consent1.verify();
            
            console.log(`   After grant: ${status1a}, After revoke: ${status1b}`);
            
            console.log("\n2️⃣ Scenario B: Revoke before grant");
            const consent2 = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            try {
                await consent2.revokeConsent({ from: dataSubject });
                console.log(`   ⚠️ Revoke before grant succeeded!`);
                console.log(`   Can revoke a consent that was never granted`);
                
                await consent2.grantConsent({ from: dataSubject });
                await consent2.grantConsent({ from: dataController });
                const status2 = await consent2.verify();
                console.log(`   Status after out-of-order grant: ${status2}`);
                
            } catch(e) {
                console.log(`   ✅ Revoke before grant prevented: ${e.reason || e.message}`);
            }
            
            console.log("\n3️⃣ Scenario C: Add purpose before granting consent");
            const consent3 = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            try {
                await consent3.newPurpose(dataProcessor, [1], { from: dataController });
                console.log(`   ⚠️ Purpose added before consent granted!`);
                console.log(`   Can add processing purposes to inactive consent`);
            } catch(e) {
                console.log(`   ✅ Purpose before grant prevented: ${e.reason || e.message}`);
            }
            
            console.log("\n4️⃣ Scenario D: Verify before any grants");
            const consent4 = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            const status4 = await consent4.verify();
            console.log(`   Ungranted consent verify(): ${status4}`);
            console.log(`   Expected: false (no grants yet)`);
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Operation order generally handled correctly");
            console.log("  → But: Can revoke before grant (odd)");
            console.log("  → But: Can add purposes before active (odd)");
            console.log("  → No strict state machine enforcement");
            
            console.log("\n🔍 Expected State Machine:");
            console.log("  CREATED → (grant) → ACTIVE → (revoke) → REVOKED");
            console.log("  Should reject operations in wrong state");
            
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.5.8: Gas Limit Edge Cases", () => {
        it("Should test operations near gas limits", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🧪 EDGE CASE 2.5.8: Gas Limit Stress Test");
            console.log("=".repeat(70));
            
            console.log("\n📋 Test: How much can we push gas limits?");
            
            console.log("\n1️⃣ Creating consent with 50 recipients:");
            const recipients = [];
            for (let i = 0; i < 50; i++) {
                recipients.push(accounts[i % 10]);
            }
            
            try {
                const tx1 = await CollectionConsent.new(
                    dataController,
                    recipients,
                    15,
                    86400,
                    [0],
                    { from: dataSubject }
                );
                
                const receipt = await web3.eth.getTransactionReceipt(tx1.transactionHash);
                console.log(`   ✅ 50 recipients accepted`);
                console.log(`   Gas used: ${receipt.gasUsed.toLocaleString()}`);
                console.log(`   Contract: ${tx1.address}`);
                
            } catch(e) {
                if (e.message.includes('gas')) {
                    console.log(`   ❌ Out of gas with 50 recipients`);
                } else {
                    console.log(`   Error: ${e.message}`);
                }
            }
            
            console.log("\n2️⃣ Creating consent with 100 recipients:");
            const recipients100 = [];
            for (let i = 0; i < 100; i++) {
                recipients100.push(accounts[i % 10]);
            }
            
            try {
                const tx2 = await CollectionConsent.new(
                    dataController,
                    recipients100,
                    15,
                    86400,
                    [0],
                    { from: dataSubject, gas: 8000000 } // Increase gas limit
                );
                
                const receipt = await web3.eth.getTransactionReceipt(tx2.transactionHash);
                console.log(`   ⚠️ 100 recipients accepted!`);
                console.log(`   Gas used: ${receipt.gasUsed.toLocaleString()}`);
                console.log(`   This could exceed block gas limit on mainnet`);
                
            } catch(e) {
                if (e.message.includes('gas')) {
                    console.log(`   ✅ Out of gas with 100 recipients (good limit)`);
                } else {
                    console.log(`   Error: ${e.message.substring(0, 80)}`);
                }
            }
            
            console.log("\n3️⃣ Adding many purposes rapidly:");
            const consent = await CollectionConsent.new(
                dataController,
                [dataProcessor],
                15,
                86400,
                [0],
                { from: dataSubject }
            );
            
            await consent.grantConsent({ from: dataSubject });
            await consent.grantConsent({ from: dataController });
            
            let totalGas = 0;
            const maxPurposes = 20;
            
            try {
                for (let i = 0; i < maxPurposes; i++) {
                    const tx = await consent.newPurpose(
                        accounts[i % 10],
                        [i],
                        { from: dataController }
                    );
                    totalGas += tx.receipt.gasUsed;
                }
                
                console.log(`   ✅ Added ${maxPurposes} purposes`);
                console.log(`   Total gas: ${totalGas.toLocaleString()}`);
                console.log(`   Average per purpose: ${Math.floor(totalGas/maxPurposes).toLocaleString()}`);
                
            } catch(e) {
                console.log(`   Error adding purposes: ${e.message.substring(0, 80)}`);
            }
            
            console.log("\n💥 EDGE CASE ANALYSIS:");
            console.log("  → Large recipient arrays: Possible but expensive");
            console.log("  → No hard limits: Could exceed block gas limit");
            console.log("  → Gas cost grows linearly with array size");
            console.log("  → Need reasonable caps for production");
            
            console.log("\n📊 Recommended Limits:");
            console.log("  • Max recipients: 20-30");
            console.log("  • Max purposes: 50");
            console.log("  • Max processors: 10");
            console.log("  • Prevents gas griefing and DoS");
            
            console.log("=".repeat(70));
        });
    });
});
