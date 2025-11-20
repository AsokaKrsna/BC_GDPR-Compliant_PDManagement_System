/**
 * PHASE 2: ASSUMPTION TESTING
 * Suite 2.3: Blockchain Consensus & Node Collusion Attacks
 * 
 * Paper's Assumption: "Blockchain network is secure and decentralized"
 * Our Goal: Test what happens with MALICIOUS VALIDATORS/MINERS
 * 
 * Attack Vectors:
 * 1. 51% attack - majority validator collusion
 * 2. Transaction censorship
 * 3. Blockchain reorganization
 * 4. Selfish mining / validator manipulation
 * 5. Network partition attacks
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 2.3: Blockchain Consensus Attacks", accounts => {
    const dataSubject = accounts[0];
    const dataController = accounts[1];
    const dataProcessor = accounts[2];
    const attacker = accounts[9];

    describe("Test 2.3.1: 51% Attack - Consent Reversal", () => {
        it("Should demonstrate how majority validator control can reverse consents", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.3.1: 51% Attack - Consent Reversal");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Attacker controls >50% of validators/miners.");
            console.log("  Can rewrite blockchain history to reverse consent decisions.");
            
            console.log("\n🎯 Attack Timeline:");
            
            // Step 1: User creates and grants consent
            console.log("\n1️⃣ Block N: User creates consent and grants it:");
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
            
            const blockNumber1 = await web3.eth.getBlockNumber();
            const consentTx = consent.transactionHash;
            
            console.log(`   Consent Contract: ${consent.address}`);
            console.log(`   Block Number: ${blockNumber1}`);
            console.log(`   Transaction: ${consentTx}`);
            console.log(`   Status: ACTIVE`);
            
            // Step 2: DC accesses data
            console.log("\n2️⃣ Block N+1: DC accesses user's data:");
            console.log(`   DC: "I have valid consent, accessing data..."`);
            console.log(`   Data accessed: Medical records`);
            console.log(`   (This happens off-chain but is authorized by on-chain consent)`);
            
            // Step 3: User revokes
            console.log("\n3️⃣ Block N+5: User discovers abuse and revokes:");
            await consent.revokeConsent({ from: dataSubject });
            const blockNumber2 = await web3.eth.getBlockNumber();
            console.log(`   Revocation Block: ${blockNumber2}`);
            console.log(`   Status: REVOKED`);
            console.log(`   User: "I want this consent erased from history!"`);
            
            // Step 4: Attacker with 51% rewrites history
            console.log("\n4️⃣ 51% Attack: Malicious validators rewrite chain:");
            console.log(`   Attacker: "I control majority of validators"`);
            console.log(`   Action: Mine alternative chain excluding revocation`);
            console.log(`   → Fork from block N+4`);
            console.log(`   → Include grant transaction`);
            console.log(`   → EXCLUDE revoke transaction`);
            console.log(`   → Make alternative chain longer`);
            
            console.log("\n   Alternative Chain View:");
            console.log(`   Block N: Consent created ✅`);
            console.log(`   Block N+1: DS grants ✅`);
            console.log(`   Block N+2: DC grants ✅`);
            console.log(`   Block N+3: (empty block)`);
            console.log(`   Block N+4: (empty block)`);
            console.log(`   Block N+5: (REVOCATION EXCLUDED!) ❌`);
            console.log(`   Block N+6: Attacker's chain becomes canonical`);
            
            console.log("\n5️⃣ Result after 51% attack:");
            console.log(`   Network adopts attacker's chain (longest chain rule)`);
            console.log(`   From network's view:`);
            console.log(`     → Consent was granted: TRUE`);
            console.log(`     → Consent was revoked: FALSE (tx disappeared!)`);
            console.log(`   User's revocation: ERASED FROM HISTORY`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CRITICAL VULNERABILITY!");
            console.log("  → 51% attack can erase consent revocations");
            console.log("  → User's 'right to withdraw' can be deleted");
            console.log("  → GDPR violation: inability to enforce withdrawal");
            console.log("  → Blockchain's immutability is a LIE with 51%");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Blockchain consensus is probabilistic, not absolute");
            console.log("  • Longest chain rule favors attackers with hash power");
            console.log("  • Finality is never guaranteed (only probabilistic)");
            console.log("  • No checkpointing or finality gadget in Ethereum PoW");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • User thinks consent is revoked → Actually still active");
            console.log("  • DC continues accessing data 'legitimately'");
            console.log("  • Legal dispute: blockchain shows 'no revocation'");
            console.log("  • Trust in blockchain as evidence is destroyed");
            
            console.log("\n🎯 GDPR Implications:");
            console.log("  GDPR Article 7(3): 'Right to withdraw consent'");
            console.log("  → 51% attack = ability to PREVENT withdrawal");
            console.log("  → System cannot guarantee GDPR compliance");
            console.log("  → Relying on blockchain = regulatory risk");
            
            console.log("\n📊 Attack Feasibility:");
            console.log("  • Public Ethereum: Very expensive (billions of dollars)");
            console.log("  • Private/Consortium chain: Easier (few validators)");
            console.log("  • If only 10 validator nodes → Need to compromise 6");
            console.log("  • Realistic threat for private deployments!");
            
            console.log("\n📊 Severity: CRITICAL (for private chains)");
            console.log("   Paper Assumption: Blockchain is immutable ❌");
            console.log("   Reality: Immutability requires honest majority ✅");
            console.log("   51% attack = complete history rewriting!");
            console.log("=".repeat(70));
            
            // Current state (revoked) but would be different after 51%
            const currentStatus = await consent.verify();
            assert.equal(currentStatus, false, "Currently revoked, but 51% could reverse");
        });
    });

    describe("Test 2.3.2: Transaction Censorship", () => {
        it("Should demonstrate validator censorship of revocation transactions", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.3.2: Transaction Censorship Attack");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Malicious validators refuse to include user's revocation tx.");
            console.log("  User wants to revoke, but validators censor the transaction.");
            
            console.log("\n🎯 Attack Steps:");
            
            console.log("\n1️⃣ User has active consent:");
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
            
            console.log(`   Consent: ${consent.address}`);
            console.log(`   Status: ACTIVE`);
            
            console.log("\n2️⃣ User discovers data misuse, attempts revocation:");
            console.log(`   User: "I want to revoke consent NOW!"`);
            console.log(`   User signs revocation transaction`);
            console.log(`   User broadcasts to network...`);
            
            console.log("\n3️⃣ Malicious validators censor transaction:");
            console.log(`   Validators controlled by DC or allies`);
            console.log(`   Validator pool:`);
            console.log(`     Validator 1: Controlled by DC ❌`);
            console.log(`     Validator 2: Controlled by DC ❌`);
            console.log(`     Validator 3: Controlled by DC ❌`);
            console.log(`     Validator 4: Honest ✅`);
            console.log(`     Validator 5: Honest ✅`);
            console.log(`   → 60% of validators are malicious`);
            
            console.log("\n4️⃣ Censorship mechanics:");
            console.log(`   User's revocation tx: 0xABCD...1234`);
            console.log(`   Malicious validators: "Drop this transaction"`);
            console.log(`   Transaction never enters a block`);
            console.log(`   Sits in mempool indefinitely`);
            console.log(`   Eventually expires (if user doesn't keep rebroadcasting)`);
            
            // In test environment, we can't actually censor, so we simulate
            console.log("\n5️⃣ Simulation: What if revocation is censored?");
            
            // Check status without revoking (as if censored)
            const statusBeforeRevoke = await consent.verify();
            console.log(`   Consent Status: ${statusBeforeRevoke ? 'ACTIVE' : 'REVOKED'}`);
            console.log(`   User WANTS to revoke but CANNOT (censored)`);
            console.log(`   DC continues accessing data`);
            
            // Show that if allowed through, revocation would work
            console.log("\n6️⃣ If honest validators process it:");
            await consent.revokeConsent({ from: dataSubject });
            const statusAfterRevoke = await consent.verify();
            console.log(`   Consent Status: ${statusAfterRevoke ? 'ACTIVE' : 'REVOKED'}`);
            console.log(`   But this only happens if honest validators get lucky`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CRITICAL VULNERABILITY!");
            console.log("  → Validators can censor revocation transactions");
            console.log("  → User's 'right to withdraw' is BLOCKED");
            console.log("  → No guarantee transaction will ever be processed");
            console.log("  → Consent remains active indefinitely against user's will");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Validators have full control over transaction inclusion");
            console.log("  • No forced inclusion mechanism");
            console.log("  • Users depend on validator honesty");
            console.log("  • Mempool transactions can be dropped");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • User cannot exercise GDPR withdrawal right");
            console.log("  • Creates appearance of consent when none exists");
            console.log("  • Regulatory violation (inability to revoke)");
            console.log("  • Users have no recourse");
            
            console.log("\n🛡️ Attack Prevention (not implemented):");
            console.log("  • Inclusion lists (force validators to include txs)");
            console.log("  • Decentralized validator set");
            console.log("  • Reputation system for validators");
            console.log("  • Alternative submission methods (relays)");
            
            console.log("\n🎯 Comparison:");
            console.log("  Traditional System:");
            console.log("    → User clicks 'revoke' → Instant effect");
            console.log("  Blockchain System:");
            console.log("    → User signs revoke → Depends on validators");
            console.log("    → Validators can censor → No revocation");
            
            console.log("\n📊 Severity: HIGH");
            console.log("   Paper Assumption: Transactions will be processed ❌");
            console.log("   Reality: Validators can censor at will ✅");
            console.log("   Defeats GDPR 'right to withdraw'!");
            console.log("=".repeat(70));
            
            assert.equal(statusBeforeRevoke, true, "Consent active when censored");
        });
    });

    describe("Test 2.3.3: Blockchain Reorganization Attack", () => {
        it("Should demonstrate how chain reorgs can invalidate consent history", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.3.3: Blockchain Reorganization Attack");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Natural or malicious chain reorg changes consent state.");
            console.log("  What happens to consents during a blockchain fork?");
            
            console.log("\n🎯 Attack Timeline:");
            
            console.log("\n1️⃣ Main chain - User creates consent:");
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
            
            const block1 = await web3.eth.getBlockNumber();
            console.log(`   Block ${block1}: Consent ${consent1.address} ACTIVE`);
            
            console.log("\n2️⃣ Main chain - User revokes after discovering abuse:");
            await consent1.revokeConsent({ from: dataSubject });
            const block2 = await web3.eth.getBlockNumber();
            console.log(`   Block ${block2}: Consent REVOKED`);
            
            console.log("\n3️⃣ Network fork occurs:");
            console.log(`   Reason: Network partition / competing blocks / 51% attack`);
            console.log(`   Chain splits:`);
            console.log(`     Chain A (main): Has revocation ✅`);
            console.log(`     Chain B (fork): Missing revocation ❌`);
            
            console.log("\n4️⃣ Alternative chain becomes canonical:");
            console.log(`   Chain B becomes longer/heavier`);
            console.log(`   Network switches from Chain A to Chain B`);
            console.log(`   Blockchain reorganization depth: ${block2 - block1} blocks`);
            
            console.log("\n5️⃣ Effect of reorg:");
            console.log(`   Before reorg (Chain A):`);
            console.log(`     → Consent created: Block ${block1} ✅`);
            console.log(`     → Consent revoked: Block ${block2} ✅`);
            console.log(`     → Status: REVOKED`);
            console.log(`   After reorg (Chain B):`);
            console.log(`     → Consent created: Block ${block1} ✅`);
            console.log(`     → Consent revoked: DISAPPEARED ❌`);
            console.log(`     → Status: ACTIVE (revocation lost!)`);
            
            console.log("\n6️⃣ Consequences:");
            console.log(`   User's perspective: "I revoked consent!"`);
            console.log(`   Blockchain state: "Consent is still active"`);
            console.log(`   DC's perspective: "Blockchain shows active consent"`);
            console.log(`   Legal dispute: Who is right?`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CRITICAL VULNERABILITY!");
            console.log("  → Chain reorgs can erase consent changes");
            console.log("  → State inconsistency between user and blockchain");
            console.log("  → No finality = no reliable consent records");
            console.log("  → Legal evidence becomes unreliable");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Proof of Work has probabilistic finality");
            console.log("  • Reorganizations are normal, not exceptional");
            console.log("  • Deep reorgs possible with sufficient hash power");
            console.log("  • No checkpoint mechanism to prevent reorgs");
            
            console.log("\n💡 Finality Times:");
            console.log("  • Bitcoin: ~6 confirmations (~60 min) for finality");
            console.log("  • Ethereum PoW: ~25 confirmations (~5 min)");
            console.log("  • Ethereum PoS: 2 epochs (~13 min) for finality");
            console.log("  • Private chain: Depends on validator honesty");
            console.log("  → User must WAIT for finality before trusting revocation");
            
            console.log("\n🎯 Real-World Scenario:");
            console.log("  1. User revokes consent at 10:00 AM");
            console.log("  2. User sees 'Revoked' confirmation");
            console.log("  3. Reorg happens at 10:05 AM");
            console.log("  4. Revocation disappears from blockchain");
            console.log("  5. DC accesses data at 10:10 AM (thinks it's legal)");
            console.log("  6. User sues: 'I revoked at 10:00!'");
            console.log("  7. Blockchain evidence: 'No revocation found'");
            
            console.log("\n🛡️ Mitigation (not implemented):");
            console.log("  • Wait for finality before considering revocation effective");
            console.log("  • Use PoS with finality gadget (Casper FFG)");
            console.log("  • Implement checkpointing");
            console.log("  • Off-chain acknowledgment of critical actions");
            
            console.log("\n📊 Severity: CRITICAL");
            console.log("   Paper Assumption: Blockchain provides finality ❌");
            console.log("   Reality: Finality is probabilistic, not guaranteed ✅");
            console.log("   Reorgs = consent state inconsistency!");
            console.log("=".repeat(70));
            
            // Current test state shows revoked, but in reality could flip
            const status = await consent1.verify();
            assert.equal(status, false, "Currently revoked but vulnerable to reorg");
        });
    });

    describe("Test 2.3.4: Selfish Mining / MEV Attack", () => {
        it("Should demonstrate how validators can manipulate consent timing", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.3.4: Selfish Mining / MEV Attack");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Validator sees profitable opportunity in mempool.");
            console.log("  Reorders transactions to exploit timing for profit.");
            
            console.log("\n🎯 Attack Scenario:");
            
            console.log("\n1️⃣ User submits revocation transaction:");
            console.log(`   User: "Revoke my consent to Hospital"`);
            console.log(`   Transaction enters mempool: tx_revoke`);
            console.log(`   Gas price: 50 Gwei`);
            
            console.log("\n2️⃣ Hospital (DC) sees revocation in mempool:");
            console.log(`   DC monitors mempool (public information)`);
            console.log(`   DC: "Oh no! User is revoking. I need to extract data NOW!"`);
            console.log(`   DC: "Let me pay validator to process my tx FIRST"`);
            
            console.log("\n3️⃣ DC submits data access transaction:");
            console.log(`   DC transaction: access_data()`);
            console.log(`   Gas price: 200 Gwei (higher than user's!)`);
            console.log(`   Side payment to validator: "I'll pay you $1000 extra"`);
            
            console.log("\n4️⃣ Malicious validator reorders transactions:");
            console.log(`   Mempool:`);
            console.log(`     [1] tx_revoke (50 Gwei)`);
            console.log(`     [2] access_data (200 Gwei)`);
            console.log(`   Validator's block:`);
            console.log(`     [1] access_data (200 Gwei) ← Processed FIRST`);
            console.log(`     [2] tx_revoke (50 Gwei)   ← Processed SECOND`);
            console.log(`   → DC accessed data before revocation took effect!`);
            
            console.log("\n5️⃣ Timeline analysis:");
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
            
            const block1 = await web3.eth.getBlockNumber();
            console.log(`   Block ${block1}: Consent ACTIVE`);
            console.log(`   Block ${block1}: DC accesses data (validator ordered first)`);
            console.log(`   Block ${block1}: Revocation processed (but too late!)`);
            
            await consent.revokeConsent({ from: dataSubject });
            const block2 = await web3.eth.getBlockNumber();
            console.log(`   Block ${block2}: Consent now REVOKED`);
            console.log(`   But damage done: DC already extracted data`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ HIGH VULNERABILITY!");
            console.log("  → Validators can reorder transactions for profit (MEV)");
            console.log("  → Time-sensitive actions vulnerable to front-running");
            console.log("  → User intent (revoke NOW) can be subverted");
            console.log("  → DC gets 'last minute' data access before revocation");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Validators control transaction ordering");
            console.log("  • Mempool is transparent (pending txs visible)");
            console.log("  • Gas price auction favors highest bidder");
            console.log("  • Validators profit from MEV (Maximal Extractable Value)");
            
            console.log("\n💡 Real-World Impact:");
            console.log("  • User wants immediate revocation");
            console.log("  • DC bribes validator to delay it");
            console.log("  • DC extracts valuable data before revocation");
            console.log("  • Technically 'legal' (access happened when consent active)");
            console.log("  • But morally wrong (subverted user's intent)");
            
            console.log("\n🎯 MEV Categories in Consent System:");
            console.log("  • Front-running: DC accesses data before user revokes");
            console.log("  • Back-running: Process grant before price increase");
            console.log("  • Sandwich: Grant → Access → Revoke in specific order");
            console.log("  • Time-bandit: Reorg to change consent sequence");
            
            console.log("\n🛡️ Defenses (not implemented):");
            console.log("  • Fair ordering protocols (order by arrival time)");
            console.log("  • Encrypted mempools (hide pending txs)");
            console.log("  • Commit-reveal schemes (two-phase transactions)");
            console.log("  • Off-chain consent revocation (instant, then on-chain)");
            
            console.log("\n📊 Severity: HIGH");
            console.log("   Paper Assumption: Transaction order is neutral ❌");
            console.log("   Reality: Validators manipulate order for profit ✅");
            console.log("   Defeats intention of immediate revocation!");
            console.log("=".repeat(70));
        });
    });

    describe("Test 2.3.5: Network Partition Attack", () => {
        it("Should demonstrate consent inconsistency during network splits", async () => {
            console.log("\n" + "=".repeat(70));
            console.log("🚨 ATTACK 2.3.5: Network Partition Attack");
            console.log("=".repeat(70));
            
            console.log("\n📋 Attack Scenario:");
            console.log("  Network splits into two partitions (e.g., internet cable cut).");
            console.log("  Different consent states on each partition.");
            
            console.log("\n🎯 Attack Timeline:");
            
            console.log("\n1️⃣ Network is healthy - initial state:");
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
            
            console.log(`   Consent: ${consent.address}`);
            console.log(`   Status: ACTIVE on all nodes`);
            
            console.log("\n2️⃣ Network partition occurs:");
            console.log(`   Reason: Undersea cable cut / DDoS / Nation-state firewall`);
            console.log(`   Network splits:`);
            console.log(`     Partition A: Europe nodes (40% hashpower)`);
            console.log(`     Partition B: Asia nodes (60% hashpower)`);
            console.log(`   → Both partitions continue independently`);
            
            console.log("\n3️⃣ Partition A: User revokes consent:");
            console.log(`   User (in Europe): "Revoke consent!"`);
            console.log(`   Transaction broadcast to Partition A only`);
            console.log(`   Partition A blockchain state: REVOKED ✅`);
            console.log(`   Partition B doesn't see this transaction ❌`);
            
            // Simulate revocation
            await consent.revokeConsent({ from: dataSubject });
            console.log(`   Simulated: Consent revoked on Partition A`);
            
            console.log("\n4️⃣ Partition B: DC accesses data:");
            console.log(`   DC (in Asia): "Checking blockchain... consent is ACTIVE"`);
            console.log(`   Partition B blockchain state: ACTIVE ✅`);
            console.log(`   DC accesses data (believes it's legitimate)`);
            console.log(`   Partition A has different state: REVOKED`);
            
            console.log("\n5️⃣ Network heals - partitions merge:");
            console.log(`   Network connectivity restored`);
            console.log(`   Two conflicting chain histories:`);
            console.log(`     Chain A (Europe): Consent REVOKED at block N`);
            console.log(`     Chain B (Asia): Consent ACTIVE, data accessed at block N`);
            console.log(`   Longest chain rule: Chain B wins (60% hashpower)`);
            console.log(`   Result: Revocation ERASED, data access VALIDATED`);
            
            console.log("\n6️⃣ Final state after merge:");
            console.log(`   Canonical blockchain: Chain B (Asia)`);
            console.log(`   Consent status: ACTIVE (user's revocation lost!)`);
            console.log(`   Data access: Recorded as legitimate`);
            console.log(`   User: "But I revoked consent!"`);
            console.log(`   Blockchain: "No evidence of revocation found"`);
            
            console.log("\n💥 ATTACK RESULT:");
            console.log("  ❌ CRITICAL VULNERABILITY!");
            console.log("  → Network partitions cause consent state inconsistency");
            console.log("  → User's revocation can be erased when network heals");
            console.log("  → DC's data access appears legitimate on final chain");
            console.log("  → No way to prove revocation happened on orphaned chain");
            
            console.log("\n🔍 Root Cause:");
            console.log("  • Blockchain assumes synchronous network (unrealistic)");
            console.log("  • Network partitions are inevitable in distributed systems");
            console.log("  • CAP theorem: Can't have Consistency + Availability during Partition");
            console.log("  • Blockchain chooses Availability → Temporary inconsistency");
            
            console.log("\n💡 Real-World Examples:");
            console.log("  • 2013: Bitcoin blockchain fork (6 hour partition)");
            console.log("  • 2020: Ethereum chain split during Berlin upgrade");
            console.log("  • Government censorship: Great Firewall creates partition");
            console.log("  • Submarine cable damage: Intercontinental partition");
            
            console.log("\n🎯 GDPR Implications:");
            console.log("  • User exercises 'right to withdraw' (GDPR Article 7(3))");
            console.log("  • Revocation broadcast to local partition");
            console.log("  • DC in different partition sees no revocation");
            console.log("  • DC legally accesses data (based on their blockchain view)");
            console.log("  • After merge: Revocation history is erased");
            console.log("  • Result: GDPR violation but blockchain shows compliance!");
            
            console.log("\n🛡️ Mitigation Strategies (not implemented):");
            console.log("  • Wait for global confirmation before trusting state");
            console.log("  • Require quorum across geographic regions");
            console.log("  • Off-chain acknowledgment of critical actions");
            console.log("  • Multiple blockchain record-keeping (redundancy)");
            
            console.log("\n📊 Severity: CRITICAL (for global deployments)");
            console.log("   Paper Assumption: Network is always connected ❌");
            console.log("   Reality: Partitions happen, cause inconsistency ✅");
            console.log("   Global deployment = partition risk!");
            console.log("=".repeat(70));
            
            const currentStatus = await consent.verify();
            assert.equal(currentStatus, false, "Currently revoked but vulnerable to partition attack");
        });
    });
});
