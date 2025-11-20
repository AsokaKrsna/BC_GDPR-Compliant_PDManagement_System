# GDPR-Compliant Blockchain Personal Data Management System

## 🎯 Project Overview

**Course:** Advanced Blockchain Technology  
**Focus:** Research-oriented implementation and security analysis  
**Base Repository:** https://github.com/toful/BC_GDPR-Compliant_PDManagement_System  
**Paper Reference:** GDPR-Compliant Personal Data Management: A Blockchain-Based Solution (IEEE 2020)

---

## 📁 Project Structure

```
ABT_Project/
├── BC_GDPR-Compliant_PDManagement_System/    # Main implementation (Ethereum/Ganache)
│   ├── contracts/                             # Solidity smart contracts
│   │   ├── CollectionConsent.sol             # DS-DC consent management
│   │   └── ProcessingConsent.sol             # DC-DP processing consent
│   ├── src/main/java/                        # Java integration layer
│   │   ├── Main.java                         # Entry point with menu
│   │   ├── CollectionConsentManager.java     # Contract interaction
│   │   ├── ProcessingConsentManager.java     # Processing logic
│   │   └── ActorsManager.java                # Manage DS/DC/DP actors
│   ├── src/test/java/                        # Test suite
│   ├── migrations/                            # Truffle deployment scripts
│   ├── truffle-config.js                     # Blockchain configuration
│   ├── pom.xml                               # Maven dependencies
│   └── Makefile                              # Build commands
│
├── docs/                                      # Documentation (TO BE CREATED)
│   ├── architecture/                         # System design
│   ├── attack-scenarios/                     # Security analysis docs
│   └── experiments/                          # Research results
│
├── security-analysis/                         # YOUR RESEARCH (TO BE CREATED)
│   ├── attack-simulations/                   # Attack code
│   ├── test-assumptions/                     # Assumption testing
│   └── vulnerabilities/                      # Discovered issues
│
├── performance-analysis/                      # YOUR RESEARCH (TO BE CREATED)
│   ├── benchmarks/                           # Performance tests
│   └── results/                              # Charts and data
│
├── GDPR-Compliant_Personal_Data_Management_A_Blockchain-Based_Solution_copy.pdf
├── research_paper_content.txt                # Extracted paper text
├── PROJECT_ANALYSIS.md                       # Initial analysis
├── REPOSITORY_COMPARISON.md                  # Repo comparison
├── REPOSITORY_ISSUES_DETAILED.md             # Why not to use Repo #1
└── README.md                                 # This file
```

---

## 🎓 Research Goals

### Primary Objective
Test the **assumptions** made in the paper and analyze **security vulnerabilities** not covered by the original research.

### Research Contributions

#### 1️⃣ **Assumption Testing** (Weeks 1-3)
**Paper's Assumptions:**
- Resource Server is "honest-but-curious"
- Majority of blockchain nodes are honest
- Private keys are secure
- Certificate Authority is trusted

**Our Tests:**
- ❓ What if RS is fully malicious?
- ❓ What if <33% of nodes collude?
- ❓ What if private keys are compromised?
- ❓ Impact of key theft on system security

#### 2️⃣ **Security Analysis** (Weeks 4-6)
**Paper's Gap:** Doesn't discuss side-channel and MiTM attacks

**Our Analysis:**
- 🔒 Token replay attacks
- 🔒 Man-in-the-Middle during consent granting
- 🔒 Front-running attacks (public blockchain)
- 🔒 Smart contract reentrancy vulnerabilities
- 🔒 Timing attacks on contract execution

#### 3️⃣ **Scalability Trade-offs** (Weeks 7-8)
**Paper's Issue:** Performance degrades with scale

**Our Investigation:**
- 📊 Baseline performance metrics
- 📊 Gas cost analysis
- 📊 Transaction throughput vs. security
- 📊 Delegation strategies and trade-offs

---

## ✅ Why Ethereum/Ganache (Not Hyperledger Fabric)?

### Advantages for Research:

1. **✅ Faster Development**
   - Ganache: Instant blockchain setup
   - HLF: Complex network configuration

2. **✅ Easier Attack Simulation**
   - Easy to simulate malicious nodes
   - Easy to intercept transactions
   - Easy to test front-running

3. **✅ Better Tooling**
   - Truffle, Web3.js, Remix IDE
   - Gas profiling tools
   - Transaction inspection

4. **✅ Research-Focused**
   - Security vulnerabilities are platform-agnostic
   - Easier to prototype attacks
   - Faster iteration

5. **✅ Community Support**
   - More documentation
   - More examples
   - Larger community

### When HLF Would Be Needed:

- ❌ Performance comparison with paper
- ❌ Permissioned blockchain features
- ❌ Enterprise deployment
- ❌ BFT consensus testing

**Conclusion:** For testing assumptions and security vulnerabilities, **Ethereum/Ganache is perfect!** ✅

---

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js & npm
node --version  # v14+ required
npm --version

# Truffle & Ganache
npm install -g truffle ganache-cli

# Java & Maven
java -version   # Java 8+
mvn -version

# Web3j (for Java wrappers)
curl -L get.web3j.io | sh
```

### Quick Setup

```bash
cd BC_GDPR-Compliant_PDManagement_System

# 1. Start local blockchain
ganache-cli

# 2. Compile contracts (in new terminal)
truffle compile

# 3. Deploy contracts
truffle migrate

# 4. Generate Java wrappers
web3j generate truffle --truffle-json ./build/contracts/CollectionConsent.json \
    --outputDir . -p src.main.java.contracts

# 5. Run the application
mvn compile
mvn exec:java -Dexec.mainClass="Main"
```

### Verify It Works

You should see an interactive menu:
```
Select an actor:
1. Controller
2. Data Subject
3. Processor
4. Exit
```

---

## 📚 Understanding the System

### Key Concepts

**1. Actors (GDPR Roles)**
- **Data Subject (DS):** Person whose data is being managed
- **Data Controller (DC):** Organization collecting data
- **Data Processor (DP):** Third-party processing data

**2. Smart Contracts**
- **CollectionConsent:** Manages DS↔DC relationship
- **ProcessingConsent:** Manages DC↔DP relationship (created per processor)

**3. Consent Workflow**
```
DS creates CollectionConsent → DC grants consent → 
DP requests processing → New ProcessingConsent created →
DS/DC/DP all grant consent → DP can process data
```

### Smart Contract Functions

**CollectionConsent.sol:**
- `grantConsent()` - DS/DC approve collection
- `revokeConsent()` - DS/DC withdraw consent
- `verify()` - Check if consent is valid
- `newPurpose()` - DC adds new processing purpose
- `revokeConsentProcessor()` - Block specific processor
- `eraseData()` - Right to be forgotten

**ProcessingConsent.sol:**
- `grantConsent(purpose)` - Approve processing purpose
- `revokeConsent(purpose)` - Withdraw purpose consent
- `verify(purpose)` - Check if purpose is valid
- `modifyData(purpose, data)` - DS modifies allowed data

---


## 🛠️ Tools & Technologies

### Core Stack
- **Blockchain:** Ethereum (Ganache for local testing)
- **Smart Contracts:** Solidity (0.4.22 - 0.7.0)
- **Backend:** Java + Web3j
- **Build Tools:** Maven, Truffle
- **Testing:** JUnit, Truffle Test

### Research Tools
- **Attack Simulation:** Custom scripts
- **Performance:** Truffle profiler, gas-reporter
- **Analysis:** Python (pandas, matplotlib)
- **Documentation:** Markdown, LaTeX

---

## 📖 Key Resources

### Original Paper
- **Title:** GDPR-Compliant Personal Data Management: A Blockchain-Based Solution
- **Authors:** Nguyen Binh Truong et al.
- **Published:** IEEE Transactions on Information Forensics and Security, 2020
- **DOI:** 10.1109/TIFS.2019.2948287

### Base Implementation
- **Repository:** https://github.com/toful/BC_GDPR-Compliant_PDManagement_System
- **Author:** Cristòfol Daudén Esmel
- **License:** Open source

### Documentation
- [Solidity Docs](https://docs.soliditylang.org/)
- [Web3j Docs](https://docs.web3j.io/)
- [Truffle Docs](https://www.trufflesuite.com/docs)
- [Ganache Docs](https://www.trufflesuite.com/docs/ganache)

---

## 🎯 Success Criteria

### Minimum Viable Research
- ✅ System runs successfully
- ✅ At least 3 attack scenarios implemented
- ✅ At least 2 assumptions tested
- ✅ Findings documented
- ✅ Mitigations proposed

### Excellent Research
- 🏆 5+ attack scenarios with POCs
- 🏆 All paper assumptions tested
- 🏆 Novel vulnerabilities discovered
- 🏆 Performance metrics collected
- 🏆 Comparison with paper's results
- 🏆 Working prototype of mitigations

---

## 👥 Team & Contact

**Student:** Durjoy  Majumdar & Vatsala Gupta
**Course:** Advanced Blockchain Technology  
**Advisor:** Dr. Somnath Tripathy
**Institution:** IIT Patna

---

## 📄 License

This research project builds upon:
- Original paper: IEEE © 2020
- Base code: Open source (see LICENSE in BC_GDPR-Compliant_PDManagement_System/)
