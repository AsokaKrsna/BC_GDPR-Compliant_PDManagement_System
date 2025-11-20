# Quick Start Guide

## ✅ Workspace Status: CLEAN & READY

### 📁 What's in Your Workspace

```
ABT_Project/
├── BC_GDPR-Compliant_PDManagement_System/  ← Your main project (working code!)
├── README.md                                ← Main project documentation
├── PROJECT_ANALYSIS.md                      ← Initial research analysis
├── REPOSITORY_COMPARISON.md                 ← Why we chose this repo
├── REPOSITORY_ISSUES_DETAILED.md            ← Evidence for not using repo #1
├── research_paper_content.txt               ← Extracted paper text
└── GDPR-Compliant_..._copy.pdf             ← Original paper
```

---

## 🚀 Quick Setup (Windows)

### Step 1: Install Prerequisites

**Node.js & npm:**
```powershell
# Download from https://nodejs.org/ (LTS version)
# Or use Chocolatey:
choco install nodejs-lts

# Verify:
node --version    # Should be v14+
npm --version
```

**Truffle & Ganache:**
```powershell
npm install -g truffle ganache-cli

# Verify:
truffle version
ganache-cli --version
```

**Java & Maven:**
```powershell
# Download Java 8+ from https://adoptium.net/
# Download Maven from https://maven.apache.org/

# Add to PATH, then verify:
java -version
mvn -version
```

**Web3j (optional, for regenerating Java wrappers):**
```powershell
# Download from https://github.com/web3j/web3j/releases
# Or use package manager
```

---

## 🎮 Run the System (First Time)

### Terminal 1: Start Blockchain
```powershell
cd C:\Users\Durjoy\Downloads\ABT_Project\BC_GDPR-Compliant_PDManagement_System
ganache-cli
```

Keep this running! You should see:
```
Ganache CLI v6.x.x
Available Accounts
==================
(0) 0x... (100 ETH)
(1) 0x... (100 ETH)
...
Listening on 127.0.0.1:8545
```

### Terminal 2: Deploy Contracts
```powershell
cd C:\Users\Durjoy\Downloads\ABT_Project\BC_GDPR-Compliant_PDManagement_System

# Compile contracts
truffle compile

# Deploy to Ganache
truffle migrate
```

You should see:
```
Compiling your contracts...
===========================
✓ Compilation complete

Starting migrations...
======================
> Network: development
...
✓ Contract deployed successfully
```

### Terminal 3: Run Application
```powershell
cd C:\Users\Durjoy\Downloads\ABT_Project\BC_GDPR-Compliant_PDManagement_System

# Compile Java code
mvn compile

# Run
mvn exec:java -Dexec.mainClass="Main"
```

You should see:
```
Select an actor:
1. Controller
2. Data Subject
3. Processor
4. Exit
```

---

## 🎯 Try It Out

### Scenario 1: Create Consent (As Data Subject)

1. Select `2` (Data Subject)
2. Select `1` (Create new Collection Consent)
3. Follow prompts to create consent
4. Consent is now on blockchain! ✅

### Scenario 2: Grant Consent (As Controller)

1. Select `1` (Controller)
2. Select `2` (Grant consent on existing contract)
3. Enter contract address
4. Consent is now active! ✅

### Scenario 3: Verify Consent

1. From any actor menu
2. Select verify option
3. See if consent is valid

---

## 🔍 Exploring the Code

### Key Files to Understand

**Smart Contracts:**
```
contracts/
├── CollectionConsent.sol    ← DS ↔ DC consent
└── ProcessingConsent.sol    ← DC ↔ DP consent
```

**Java Backend:**
```
src/main/java/
├── Main.java                         ← Start here!
├── CollectionConsentManager.java     ← How to interact with contracts
├── ProcessingConsentManager.java     ← Processing logic
└── ActorsManager.java                ← Manages addresses
```

**Tests:**
```
src/test/java/
├── CollectionConsentManagerTest.java  ← See how it works
└── ProcessingConsentManagerTest.java
```

---

## 📚 Understanding the Workflow

### Consent Creation Flow

```
1. Data Subject creates CollectionConsent
   ↓
2. Controller grants consent
   ↓
3. Both valid[] flags = true
   ↓
4. Consent is ACTIVE
```

### Processing Flow

```
1. Controller calls newPurpose(processor, purpose, data, duration)
   ↓
2. New ProcessingConsent contract created for that processor
   ↓
3. Data Subject grants consent on ProcessingConsent
   ↓
4. Controller grants consent
   ↓
5. Processor grants consent
   ↓
6. All 3 valid[] flags = true
   ↓
7. Processing is AUTHORIZED
```

---

## 🔬 Your Research Plan

### Week 1: Setup & Understanding ← YOU ARE HERE

**Goals:**
- [ ] Get system running
- [ ] Understand consent workflow
- [ ] Read smart contract code
- [ ] Document current architecture

**Deliverables:**
- Architecture diagram
- Flow diagrams
- Notes on attack surfaces

### Week 2-3: Assumption Testing

**Goals:**
- [ ] Test "honest-but-curious" assumption
- [ ] Test key compromise scenarios
- [ ] Test node collusion

**Deliverables:**
- Attack simulation code
- Test results
- Findings document

### Week 4-6: Security Analysis

**Goals:**
- [ ] Replay attacks
- [ ] MiTM attacks
- [ ] Front-running attacks
- [ ] Smart contract vulnerabilities

**Deliverables:**
- Proof-of-concept exploits
- Vulnerability report
- Mitigation proposals

### Week 7-8: Write-up

**Goals:**
- [ ] Document all findings
- [ ] Create visualizations
- [ ] Write research paper
- [ ] Prepare presentation

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to Ganache"
**Solution:**
```powershell
# Make sure Ganache is running in Terminal 1
# Check port 8545 is not blocked by firewall
netstat -an | findstr "8545"
```

### Issue: "Compilation failed"
**Solution:**
```powershell
# Clean and recompile
truffle compile --all
```

### Issue: "Java class not found"
**Solution:**
```powershell
# Regenerate contract wrappers
web3j generate truffle --truffle-json ./build/contracts/CollectionConsent.json `
    --outputDir . -p src.main.java.contracts
```

### Issue: "Maven build failed"
**Solution:**
```powershell
# Clean Maven cache
mvn clean
mvn compile
```

---

## 📝 Useful Commands

### Blockchain Operations

```powershell
# Start Ganache with specific settings
ganache-cli --port 8545 --networkId 5777 --gasLimit 8000000

# Compile contracts
truffle compile

# Deploy contracts
truffle migrate

# Reset and redeploy
truffle migrate --reset

# Open Truffle console
truffle console

# Run tests
truffle test
```

### Java Operations

```powershell
# Compile
mvn compile

# Run main
mvn exec:java -Dexec.mainClass="Main"

# Run tests
mvn test

# Clean build
mvn clean compile
```

### Contract Interaction (Truffle Console)

```javascript
// Get deployed contract
let consent = await CollectionConsent.deployed()

// Check consent validity
await consent.verify()

// Get data subject address
await consent.dataSubject()
```

---

## 🎓 Learning Resources

### Solidity
- [Official Docs](https://docs.soliditylang.org/)
- [Solidity by Example](https://solidity-by-example.org/)
- [CryptoZombies](https://cryptozombies.io/) - Interactive tutorial

### Web3j
- [Web3j Docs](https://docs.web3j.io/)
- [Web3j Examples](https://github.com/web3j/sample-project-gradle)

### Smart Contract Security
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [SWC Registry](https://swcregistry.io/) - Vulnerability classification
- [Ethernaut](https://ethernaut.openzeppelin.com/) - Security challenges

### GDPR
- [Official GDPR Text](https://gdpr-info.eu/)
- [GDPR Developer Guide](https://github.com/LINCnil/GDPR-Developer-Guide)

---

## 💡 Tips for Your Research

### 1. Keep a Research Journal
Document everything:
- What you tried
- What worked/didn't work
- Interesting observations
- Questions to explore

### 2. Version Control
```powershell
cd BC_GDPR-Compliant_PDManagement_System
git init
git add .
git commit -m "Initial commit - base implementation"

# Create research branch
git checkout -b research-security-analysis
```

### 3. Backup Your Work
- Commit frequently
- Push to GitHub/GitLab
- Keep multiple backups

### 4. Document as You Go
Don't wait until the end to write documentation!

### 5. Test Early, Test Often
Don't assume code works - verify it!

---

## 🎯 Next Immediate Steps

### Today:
1. ✅ Workspace cleaned
2. ⏳ Setup dev environment (Node, Java, Maven, Truffle, Ganache)
3. ⏳ Run the system for the first time
4. ⏳ Play with the interactive menu

### Tomorrow:
1. Read through smart contracts
2. Understand the consent logic
3. Draw architecture diagram
4. Identify potential attack surfaces

### This Week:
1. Document current system behavior
2. Create test scenarios
3. Plan first attack simulation
4. Start literature review on smart contract vulnerabilities

---

## 📞 Getting Help

### If Stuck:
1. Check this guide
2. Read error messages carefully
3. Search on Stack Overflow
4. Check GitHub issues on toful's repo
5. Ask your advisor

### Useful Search Terms:
- "Solidity [your issue]"
- "Web3j [your issue]"
- "Truffle [your issue]"
- "Ganache [your issue]"

---

## 🎉 You're All Set!

Your workspace is clean and ready. Time to:
1. Setup your dev environment
2. Run the system
3. Start exploring!

**Good luck with your research!** 🚀

---

**Last Updated:** November 16, 2025  
**Status:** 🟢 Ready to Code

