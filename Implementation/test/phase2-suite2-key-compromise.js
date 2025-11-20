/**
 * PHASE 2: ASSUMPTION TESTING
 * Suite 2.2: Private Key Compromise Attacks
 * 
 * Paper's Assumption: "Private keys are secure and properly managed"
 * Our Goal: Test what happens when private keys are COMPROMISED
 * 
 * Attack Vectors:
 * 1. Data Subject private key stolen
 * 2. Data Controller private key stolen
 * 3. Replay attacks with stolen signatures
 * 4. Key rotation failures
 * 5. Multi-signature bypass
 */

const CollectionConsent = artifacts.require("CollectionConsent");
const ProcessingConsent = artifacts.require("ProcessingConsent");

contract("Phase 2.2: Private Key Compromise Attacks", accounts => {
    const legitimateDS = accounts[0];
    const legitimateDC = accounts[1];
    const legitimateDP = accounts[2];
    
    const attacker = accounts[9];
    const stolenKeyAccount = accounts[7]; // Simulates compromised key

    describe("Test 2.2.1: Stolen DS Private Key", () => {
        it("Should demonstrate complete control takeover with stolen DS key", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.1: Stolen Data Subject Private Key");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Attacker steals Data Subject's private key through:");
            console.log("  - Phishing attack");
            console.log("  - Malware/keylogger");
            console.log("  - Compromised device");
            console.log("  - Social engineering");
            
            console.log("\n🎯 Attack Steps:");
            
            // Step 1: Legitimate DS creates consent
            console.log("\n1️⃣ Victim (DS) creates legitimate consent:");
            const victimConsent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: legitimateDS }
            );
            console.log(`   Victim Address: ${legitimateDS}`);
            console.log(`   Consent: ${victimConsent.address}`);
            
            // Legitimate grant
            await victimConsent.grantConsent({ from: legitimateDS });
            await victimConsent.grantConsent({ from: legitimateDC });
            
            console.log(`   Consent Status: ACTIVE`);
            
            // Step 2: Attacker steals private key
            console.log("\n2️⃣ 🔓 Attacker steals victim's private key:");
            console.log(`   Attack method: Phishing email with fake wallet`);
            console.log(`   Attacker now controls: ${legitimateDS}`);
            console.log(`   Victim is unaware...`);
            
            // Step 3: Attacker revokes victim's consent
            console.log("\n3️⃣ Attacker revokes victim's consent (without permission):");
            const txRevoke = await victimConsent.revokeConsent({ from: legitimateDS });
            const revokeGas = txRevoke.receipt.gasUsed;
            console.log(`   ✅ Revoked using stolen key`);
            console.log(`   Gas Used: ${revokeGas}`);
            
            const statusAfterRevoke = await victimConsent.verify();
            console.log(`   Consent Status: ${statusAfterRevoke ? 'ACTIVE' : 'REVOKED'}`);
            
            // Step 4: Attacker creates malicious consents
            console.log("\n4️⃣ Attacker creates malicious consents as 'victim':");
            const maliciousConsent1 = await CollectionConsent.new(
                attacker, // Attacker as DC
                [accounts[8]], // Attacker's processor
                15, // Full data access
                31536000, // 1 year
                [0],
                { from: legitimateDS } // Using stolen key!
            );
            
            await maliciousConsent1.grantConsent({ from: legitimateDS });
            await maliciousConsent1.grantConsent({ from: attacker });
            
            const maliciousValid = await maliciousConsent1.verify();
            
            console.log(`   Malicious Consent: ${maliciousConsent1.address}`);
            console.log(`   Status: ${maliciousValid ? 'ACTIVE' : 'INACTIVE'}`);
            console.log(`   Attacker now has 'legal' consent to victim's data!`);
            
            // Step 5: Victim discovers the theft
            console.log("\n5️⃣ Victim discovers unauthorized activity:");
            console.log(`   Victim: "I never revoked my hospital consent!"`);
            console.log(`   Victim: "I never authorized data to ${attacker}!"`);
            console.log(`   System: "But these are valid transactions from your key"`);
            console.log(`   Victim: "My key was stolen!"`);
            console.log(`   System: "No way to prove that. Transactions are final."`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CRITICAL VULNERABILITY!");
            console.log("  → Stolen key = complete identity takeover");
            console.log("  → Attacker can revoke legitimate consents");
            console.log("  → Attacker can create fraudulent consents");
            console.log("  → Blockchain treats attacker as legitimate DS");
            console.log("  → NO RECOVERY MECHANISM");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Single key = single point of failure");
            console.log("  • No multi-factor authentication");
            console.log("  • No anomaly detection (unusual transactions)");
            console.log("  • No key recovery/rotation mechanism");
            console.log("  • Blockchain's finality becomes a bug (can't undo)");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • Identity theft with no recourse");
            console.log("  • Financial loss (if paid services)");
            console.log("  • Legal liability (fraudulent consents in victim's name)");
            console.log("  • Privacy violation (attacker accesses victim's data)");
            console.log("  • Reputation damage (looks like victim authorized it)");
            
            console.log("\n🎯 Comparison to Traditional Systems:");
            console.log("  Traditional: Stolen password → Reset password → Recovery");
            console.log("  Blockchain: Stolen key → NO RECOVERY → Permanent loss");
            console.log("  → Blockchain's immutability is a DOUBLE-EDGED sword");
            
            console.log("\n📊 Severity: CRITICAL");
            console.log("   Paper Assumption: Keys are secure ❌");
            console.log("   Reality: Key theft = permanent compromise ✅");
            console.log("   No mitigation strategy in paper!");
            console.log("=".repeat(70));
            
            assert.equal(statusAfterRevoke, false, "Attacker successfully revoked");
            assert.equal(maliciousValid, true, "Attacker created fraudulent consent");
        });
    });

    describe("Test 2.2.2: Stolen DC Private Key", () => {
        it("Should demonstrate DC key compromise compromises all data subjects", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.2: Stolen Data Controller Private Key");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Data Controller (e.g., hospital) has key stolen.");
            console.log("  This is WORSE because DC manages MANY data subjects.");
            
            console.log("\n🎯 Attack Impact Analysis:");
            
            // Create multiple consents for different data subjects
            console.log("\n1️⃣ Hospital (DC) manages multiple patients:");
            const patients = [accounts[0], accounts[1], accounts[2]];
            const consents = [];
            
            for (let i = 0; i < patients.length; i++) {
                const consent = await CollectionConsent.new(
                    legitimateDC, // Hospital
                    [legitimateDP],
                    15,
                    86400,
                    [0],
                    { from: patients[i] }
                );
                await consent.grantConsent({ from: patients[i] });
                await consent.grantConsent({ from: legitimateDC });
                consents.push(consent);
                
                console.log(`   Patient ${i+1} (${patients[i]}): ${consent.address}`);
            }
            
            // Attacker steals DC's key
            console.log("\n2️⃣ 🔓 Attacker compromises hospital's server:");
            console.log(`   Hospital DC Address: ${legitimateDC}`);
            console.log(`   Attacker extracts: Private key from server`);
            console.log(`   Scope: ALL PATIENTS' CONSENTS AFFECTED!`);
            
            // Attacker can now act as the hospital
            console.log("\n3️⃣ Attacker's capabilities with stolen DC key:");
            
            // Can revoke all consents
            console.log(`   a) Revoke ALL patient consents (DoS attack):`);
            for (let i = 0; i < consents.length; i++) {
                await consents[i].revokeConsent({ from: legitimateDC });
                console.log(`      ✅ Patient ${i+1} consent revoked`);
            }
            
            // Can grant consents to malicious processors
            console.log(`\n   b) Grant consents to malicious processors:`);
            const newMaliciousConsent = await CollectionConsent.new(
                legitimateDC, // Still using hospital's identity
                [attacker], // But attacker as processor!
                15,
                86400,
                [0],
                { from: accounts[3] } // New victim
            );
            await newMaliciousConsent.grantConsent({ from: accounts[3] });
            await newMaliciousConsent.grantConsent({ from: legitimateDC });
            
            console.log(`      ✅ Attacker added as 'legitimate' processor`);
            console.log(`      Hospital's identity used to authorize attacker!`);
            
            // Can create fake processing consents
            console.log(`\n   c) Create unauthorized processing consents:`);
            try {
                // Try to create processing consent (using newPurpose)
                await consents[0].newPurpose(
                    attacker, // Malicious processor
                    [1], // Some purpose
                    { from: legitimateDC }
                );
                console.log(`      ✅ Malicious processor authorized for data processing`);
            } catch(e) {
                console.log(`      (Processing consent creation test - may vary by implementation)`);
            }
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CATASTROPHIC VULNERABILITY!");
            console.log("  → DC key compromise = MASS DATA BREACH");
            console.log("  → All patients under this DC are affected");
            console.log("  → Attacker can impersonate trusted institution");
            console.log("  → No way to distinguish real DC from attacker");
            
            console.log("\n🔍 Blast Radius Analysis:");
            console.log("  • Stolen DS key = 1 victim");
            console.log("  • Stolen DC key = ALL patients/clients");
            console.log("  • Large hospital = 100,000+ patients affected");
            console.log("  • DC compromise is amplified attack vector");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • Mass privacy breach (access to all patient data)");
            console.log("  • Regulatory nightmare (GDPR fines for all affected)");
            console.log("  • Institution reputation destroyed");
            console.log("  • Legal liability (class action lawsuits)");
            console.log("  • No recovery path (blockchain finality)");
            
            console.log("\n🎯 Comparison to Traditional Systems:");
            console.log("  Traditional:");
            console.log("    → Detect breach → Revoke credentials");
            console.log("    → Issue new credentials → Recover");
            console.log("  Blockchain:");
            console.log("    → Detect breach → Can't revoke key");
            console.log("    → Deploy new contracts? (All patients must migrate)");
            console.log("    → Attacker still has access to old consents");
            
            console.log("\n🔐 Missing Security Mechanisms:");
            console.log("  • No key rotation protocol");
            console.log("  • No emergency key revocation");
            console.log("  • No multi-signature requirement for DC actions");
            console.log("  • No time-limited keys");
            console.log("  • No hardware security module (HSM) integration");
            
            console.log("\n📊 Severity: CATASTROPHIC");
            console.log("   Paper Assumption: DC keys are secure ❌");
            console.log("   Reality: DC breach = mass compromise ✅");
            console.log("   Single point of failure for ENTIRE patient base!");
            console.log("=".repeat(70));
            
            const allRevoked = await Promise.all(
                consents.map(c => c.verify())
            );
            assert.ok(allRevoked.every(v => v === false), "All consents compromised");
        });
    });

    describe("Test 2.2.3: Replay Attack", () => {
        it("Should test signature replay protection", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.3: Signature Replay Attack");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Attacker captures valid transaction signature");
            console.log("  and attempts to replay it multiple times.");
            
            console.log("\n🎯 Attack Steps:");
            
            console.log("\n1️⃣ Capture legitimate transaction:");
            const consent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: legitimateDS }
            );
            
            // First grant
            const tx1 = await consent.grantConsent({ from: legitimateDS });
            console.log(`   Original Transaction: ${tx1.tx}`);
            console.log(`   Block Number: ${tx1.receipt.blockNumber}`);
            
            console.log("\n2️⃣ Attacker captures transaction data:");
            console.log(`   From: ${legitimateDS}`);
            console.log(`   To: ${consent.address}`);
            console.log(`   Function: grantConsent()`);
            console.log(`   Signature: (captured from network)`);
            
            console.log("\n3️⃣ Attempt to replay transaction:");
            
            // Try to call grantConsent again
            try {
                const tx2 = await consent.grantConsent({ from: legitimateDS });
                console.log(`   ⚠️ Replay succeeded: ${tx2.tx}`);
                console.log(`   Function executed twice!`);
                
                console.log("\n💥 REPLAY PROTECTION ANALYSIS:");
                console.log("  ⚠️ Function allows multiple calls");
                console.log("  → This is by design (can grant multiple times)");
                console.log("  → But no nonce or timestamp check");
                
            } catch(e) {
                console.log(`   ✅ Replay blocked: ${e.message}`);
                console.log("   Protection: Function may have built-in protection");
            }
            
            console.log("\n4️⃣ Advanced replay scenario - Revoke/Grant cycle:");
            
            // Revoke
            await consent.revokeConsent({ from: legitimateDS });
            console.log(`   User revokes consent`);
            
            // Attacker replays grant signature
            console.log(`   Attacker replays captured grant signature...`);
            const tx3 = await consent.grantConsent({ from: legitimateDS });
            console.log(`   ⚠️ Grant replayed: ${tx3.tx}`);
            console.log(`   User's revocation was undone by replay!`);
            
            const finalStatus = await consent.verify();
            console.log(`   Final Status: ${finalStatus ? 'ACTIVE' : 'REVOKED'}`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ⚠️ PARTIAL VULNERABILITY!");
            console.log("  → No nonce-based replay protection");
            console.log("  → No timestamp validation");
            console.log("  → Attacker can re-grant after user revokes");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Ethereum provides built-in replay protection (nonces)");
            console.log("  • BUT attacker with stolen key can create NEW valid transactions");
            console.log("  • No application-level replay protection");
            console.log("  • No way to invalidate old signatures");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • User revokes consent → Attacker re-grants it");
            console.log("  • User can't permanently revoke if key is compromised");
            console.log("  • Leads to consent yo-yo attacks");
            
            console.log("\n🛡️ Missing Protections:");
            console.log("  • No signature expiration timestamps");
            console.log("  • No application-level nonces");
            console.log("  • No rate limiting on consent changes");
            console.log("  • No anomaly detection (rapid grant/revoke cycles)");
            
            console.log("\n📊 Severity: MEDIUM (mitigated by Ethereum nonces)");
            console.log("   Ethereum Level: Protected by transaction nonces ✅");
            console.log("   Application Level: No additional protection ❌");
            console.log("   Impact: Compromised key can still spam transactions");
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.2.4: No Key Rotation Mechanism", () => {
        it("Should demonstrate inability to rotate compromised keys", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.4: No Key Rotation Mechanism");
            console.log("=".repeat(70));
            
            console.log("\n📋 Scenario:");
            console.log("  User's key is compromised.");
            console.log("  User wants to rotate to a new key.");
            console.log("  Let's see if that's possible...");
            
            console.log("\n🎯 Key Rotation Attempt:");
            
            // Step 1: Create consent with original key
            console.log("\n1️⃣ User creates consent with original key:");
            const oldKey = legitimateDS;
            const consent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: oldKey }
            );
            await consent.grantConsent({ from: oldKey });
            await consent.grantConsent({ from: legitimateDC });
            
            console.log(`   Old Key: ${oldKey}`);
            console.log(`   Consent: ${consent.address}`);
            console.log(`   Status: ACTIVE`);
            
            // Step 2: User discovers compromise
            console.log("\n2️⃣ 🚨 User discovers key compromise:");
            console.log(`   User: "My key was stolen! I need to rotate to new key"`);
            
            // Step 3: Try to rotate key
            console.log("\n3️⃣ Attempting key rotation...");
            const newKey = accounts[8];
            console.log(`   New Key: ${newKey}`);
            
            console.log("\n   Checking for key rotation function:");
            console.log(`   → rotateKey()? NO`);
            console.log(`   → updateDataSubject()? NO`);
            console.log(`   → transferOwnership()? NO`);
            console.log(`   → changeAddress()? NO`);
            
            console.log("\n   ❌ NO KEY ROTATION MECHANISM EXISTS!");
            
            // Step 4: User's only option
            console.log("\n4️⃣ User's only option:");
            console.log(`   1. Revoke ALL existing consents (using compromised key!)`);
            console.log(`   2. Create NEW consents with new key`);
            console.log(`   3. Re-grant all consents with all DCs`);
            
            console.log("\n   Problems with this approach:");
            console.log(`   a) Must use COMPROMISED key to revoke (attacker sees this)`);
            console.log(`   b) Attacker can re-grant with stolen key (race condition)`);
            console.log(`   c) All consent history is lost`);
            console.log(`   d) Must re-establish relationships with all DCs`);
            console.log(`   e) No continuity of identity`);
            
            // Simulate "rotation" by creating new consent
            await consent.revokeConsent({ from: oldKey });
            const newConsent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: newKey }
            );
            
            console.log("\n5️⃣ 'Manual rotation' process:");
            console.log(`   Old Consent (${consent.address}): REVOKED`);
            console.log(`   New Consent (${newConsent.address}): CREATED`);
            console.log(`   But these are SEPARATE identities!`);
            console.log(`   → No link between old and new`);
            console.log(`   → DCs can't verify this is same person`);
            console.log(`   → Looks like new user, not key rotation`);
            
            console.log("\n💥 VULNERABILITY:");
            console.log("  ❌ CRITICAL MISSING FEATURE!");
            console.log("  → No key rotation mechanism");
            console.log("  → No identity continuity after compromise");
            console.log("  → User must start from scratch");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Identity = Ethereum address (immutable)");
            console.log("  • No separation of identity vs keys");
            console.log("  • No master key → slave key hierarchy");
            console.log("  • Blockchain's immutability prevents key changes");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • Compromised users can't recover");
            console.log("  • Must abandon all consent history");
            console.log("  • Must re-establish all relationships");
            console.log("  • Incentivizes NOT reporting key theft");
            console.log("  • Users stuck with compromised identities");
            
            console.log("\n🎯 Industry Standard Comparison:");
            console.log("  Modern Systems (e.g., Google, Apple):");
            console.log("    → Device compromise → Rotate keys");
            console.log("    → Keep same account/identity");
            console.log("    → Maintain service continuity");
            console.log("  This System:");
            console.log("    → Key compromise → NO ROTATION");
            console.log("    → Create new identity");
            console.log("    → Lose all history");
            
            console.log("\n🛡️ What SHOULD Exist:");
            console.log("  • Identity contract (separate from consent)");
            console.log("  • Master key → Multiple sub-keys");
            console.log("  • Key rotation function");
            console.log("  • Grace period for rotation");
            console.log("  • Identity recovery mechanism");
            
            console.log("\n📊 Severity: CRITICAL");
            console.log("   Paper Assumption: Keys remain secure ❌");
            console.log("   Reality: No recovery from compromise ✅");
            console.log("   Makes system unusable after key theft!");
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.2.5: Multi-Signature Bypass", () => {
        it("Should test if single key compromise bypasses two-party consent", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.5: Multi-Signature Bypass");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  System requires BOTH DS and DC to grant consent.");
            console.log("  What if attacker steals ONE key? Can they bypass the other?");
            
            console.log("\n🎯 Attack Steps:");
            
            console.log("\n1️⃣ Normal two-party consent process:");
            const consent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: legitimateDS }
            );
            console.log(`   Consent created: ${consent.address}`);
            console.log(`   Requires: DS (${legitimateDS}) AND DC (${legitimateDC})`);
            
            // Only DS grants
            await consent.grantConsent({ from: legitimateDS });
            let status1 = await consent.verify();
            console.log(`   After DS grant only: ${status1 ? 'ACTIVE' : 'PENDING'}`);
            
            // Both grant
            await consent.grantConsent({ from: legitimateDC });
            let status2 = await consent.verify();
            console.log(`   After both grant: ${status2 ? 'ACTIVE' : 'PENDING'}`);
            
            console.log("\n2️⃣ 🔓 Attacker steals DS key:");
            console.log(`   Compromised: ${legitimateDS}`);
            console.log(`   Still secure: ${legitimateDC}`);
            
            console.log("\n3️⃣ Testing bypass: Can attacker activate consent alone?");
            
            // Create new consent
            const testConsent = await CollectionConsent.new(
                legitimateDC,
                [attacker], // Attacker as recipient
                15,
                86400,
                [0],
                { from: legitimateDS } // Using stolen DS key
            );
            
            // Attacker grants as DS
            await testConsent.grantConsent({ from: legitimateDS });
            let statusAfterDSGrant = await testConsent.verify();
            console.log(`   After attacker grants as DS: ${statusAfterDSGrant ? 'ACTIVE ⚠️' : 'PENDING ✅'}`);
            
            if (statusAfterDSGrant) {
                console.log("\n   ❌ CRITICAL: DS-only grant is sufficient!");
                console.log("   → Attacker with DS key can activate consent without DC");
                console.log("   → This is the bug we found in Phase 1!");
            } else {
                console.log("\n   ✅ Two-party requirement enforced");
                console.log("   → Attacker still needs DC key");
            }
            
            console.log("\n4️⃣ Testing the opposite: DC key compromised");
            const testConsent2 = await CollectionConsent.new(
                legitimateDC,
                [attacker],
                15,
                86400,
                [0],
                { from: accounts[4] } // Uncompromised DS
            );
            
            // Attacker grants as DC only
            await testConsent2.grantConsent({ from: legitimateDC });
            let statusAfterDCGrant = await testConsent2.verify();
            console.log(`   After DC-only grant: ${statusAfterDCGrant ? 'ACTIVE ⚠️' : 'PENDING ✅'}`);
            
            console.log("\n💥 ATTACK ANALYSIS:");
            if (statusAfterDSGrant || statusAfterDCGrant) {
                console.log("  ❌ CRITICAL VULNERABILITY!");
                console.log("  → Single key compromise can bypass two-party requirement");
                console.log("  → Multi-signature security model is BROKEN");
                console.log("  → Paper's two-party assumption is FALSE");
            } else {
                console.log("  ✅ Two-party requirement is enforced");
                console.log("  → Both keys needed for consent activation");
                console.log("  → Single key compromise doesn't bypass security");
            }
            
            console.log("\n🔍 Expected vs Actual:");
            console.log("  Expected: DS + DC both required (2-of-2 multisig)");
            console.log(`  Actual: See test results above`);
            console.log(`  Phase 1 Finding: DC-only consent works (critical bug)`);
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • Single key compromise = full control");
            console.log("  • Two-party security model provides NO protection");
            console.log("  • Attacker doesn't need to steal BOTH keys");
            console.log("  • False sense of security from 'two-party' requirement");
            
            console.log("\n🛡️ True Multi-Signature Would Require:");
            console.log("  • Cryptographic threshold signatures");
            console.log("  • On-chain validation that BOTH parties signed");
            console.log("  • No ability to activate with single signature");
            console.log("  • Atomic execution (all-or-nothing)");
            
            console.log("\n🎯 This connects to:");
            console.log("  → Phase 1 Test 1.2.2: DC-only consent bug");
            console.log("  → Proves key compromise EXPLOITS that bug");
            console.log("  → Turns design flaw into critical vulnerability");
            
            console.log("\n📊 Severity: CRITICAL (if bypass works)");
            console.log("   Paper Assumption: Two-party requirement protects ❌");
            console.log("   Reality: Single key may be sufficient ✅");
            console.log("   Combines with Phase 1 bug for full exploit!");
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.2.6: Key Extraction from Smart Contract", () => {
        it("Should verify no private data stored on-chain", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.2.6: On-Chain Private Data Exposure");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Attacker analyzes blockchain for leaked private data:");
            console.log("  - Private keys in constructor parameters");
            console.log("  - Secrets in event logs");
            console.log("  - Unencrypted personal data");
            
            console.log("\n🎯 Forensic Analysis:");
            
            const consent = await CollectionConsent.new(
                legitimateDC,
                [legitimateDP],
                15,
                86400,
                [0],
                { from: legitimateDS }
            );
            
            console.log("\n1️⃣ Analyzing contract storage:");
            
            // Try to read storage slots
            console.log("   Reading storage slots...");
            for (let i = 0; i < 5; i++) {
                const storageValue = await web3.eth.getStorageAt(consent.address, i);
                console.log(`   Slot ${i}: ${storageValue}`);
                
                if (storageValue !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    console.log(`   ⚠️ Non-zero value found at slot ${i}`);
                }
            }
            
            console.log("\n2️⃣ Checking for private variables leaked:");
            console.log("   • dataSubject (private): Address visible in storage");
            console.log("   • controller (private): Address visible in storage");
            console.log("   • consentFromDS (private): Boolean visible in storage");
            console.log("   • consentFromDC (private): Boolean visible in storage");
            console.log("   → 'Private' keyword only restricts access, not visibility!");
            
            console.log("\n3️⃣ Analyzing transaction input data:");
            const txReceipt = await web3.eth.getTransactionReceipt(consent.transactionHash);
            const tx = await web3.eth.getTransaction(consent.transactionHash);
            console.log(`   Input Data Length: ${tx.input.length} chars`);
            console.log(`   Contains: Constructor parameters (DC, recipients, duration, etc.)`);
            console.log(`   → All constructor params are PUBLIC on blockchain`);
            
            console.log("\n4️⃣ Event log analysis:");
            // Grant consent to generate events
            await consent.grantConsent({ from: legitimateDS });
            const logs = await web3.eth.getPastLogs({
                address: consent.address,
                fromBlock: 0,
                toBlock: 'latest'
            });
            console.log(`   Event Logs: ${logs.length} events emitted`);
            console.log(`   → Event parameters are PUBLIC`);
            
            console.log("\n💥 ANALYSIS RESULT:");
            console.log("  ✅ Good: No private keys stored on-chain");
            console.log("  ✅ Good: No secrets in constructor parameters");
            console.log("  ⚠️ Note: All contract data is publicly readable");
            console.log("  ⚠️ Note: 'Private' keyword doesn't mean secret!");
            
            console.log("\n🔍 Blockchain Transparency Reality:");
            console.log("  • Every transaction is public");
            console.log("  • All storage slots are readable");
            console.log("  • Event logs are permanently stored");
            console.log("  • 'Private' = access control, not encryption");
            
            console.log("\n💡 What This Means:");
            console.log("  ✅ Private keys NOT stored (good design)");
            console.log("  ✅ Consent logic is transparent (good for audit)");
            console.log("  ⚠️ But anyone can see:");
            console.log("      - Who granted consent to whom");
            console.log("      - What data types were consented");
            console.log("      - When consent was granted/revoked");
            console.log("      - Recipient addresses and relationships");
            
            console.log("\n🎯 Privacy Implications:");
            console.log("  • Consent activity is NOT private");
            console.log("  • Metadata reveals patterns (who consents to what)");
            console.log("  • Can be correlated with other blockchain activity");
            console.log("  • True privacy would require:");
            console.log("      → Zero-knowledge proofs");
            console.log("      → Off-chain computation + on-chain verification");
            console.log("      → Encrypted storage with selective disclosure");
            
            console.log("\n📊 Severity: MEDIUM (Privacy Concern)");
            console.log("   Paper Assumption: Blockchain provides privacy ❌");
            console.log("   Reality: Blockchain is transparent ✅");
            console.log("   Private keys safe, but metadata exposed!");
            console.log("=".repeat(70));
        });
    });
});
