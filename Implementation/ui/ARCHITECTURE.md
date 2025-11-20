# 🎨 Streamlit UI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR WEB BROWSER                          │
│                  http://localhost:8501                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📝 Create  │  🔍 View  │  ✅ Grant/Revoke  │  🧪 Test │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  [  Select Data Subject  ▼  ]                          │ │
│  │  [  Select Controller    ▼  ]                          │ │
│  │  ☑ Name  ☑ Email  ☐ Address  ☑ Phone                 │ │
│  │  Duration: ━━●━━━━━ 86400 seconds                     │ │
│  │                                                          │ │
│  │  [  🚀 Deploy Consent Contract  ]                      │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────┘
                          │ HTTP
                          │
┌────────────────────────▼───────────────────────────────────┐
│              STREAMLIT SERVER (app.py)                      │
│                    Python Process                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  import streamlit as st                               │ │
│  │  import web3                                          │ │
│  │                                                       │ │
│  │  # Connect to blockchain                            │ │
│  │  w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))│ │
│  │                                                       │ │
│  │  # Load contract                                     │ │
│  │  contract = w3.eth.contract(address=..., abi=...)   │ │
│  │                                                       │ │
│  │  # Deploy new consent                               │ │
│  │  tx_hash = contract.constructor(...).transact(...)  │ │
│  │                                                       │ │
│  │  # Grant consent                                     │ │
│  │  contract.functions.grantConsent().transact({...})  │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────┘
                          │ Web3.py
                          │ JSON-RPC
                          │
┌────────────────────────▼───────────────────────────────────┐
│              GANACHE (Local Blockchain)                     │
│                  127.0.0.1:8545                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Ethereum VM                         │ │
│  │                                                       │ │
│  │  Accounts (10):                                       │ │
│  │  ├─ 0x... (1000 ETH) ← Data Subject                  │ │
│  │  ├─ 0x... (1000 ETH) ← Data Controller               │ │
│  │  ├─ 0x... (1000 ETH) ← Data Processor                │ │
│  │  └─ ...                                               │ │
│  │                                                       │ │
│  │  Deployed Contracts:                                  │ │
│  │  ├─ CollectionConsent @ 0xABC...                    │ │
│  │  │   ├─ grantConsent()                               │ │
│  │  │   ├─ revokeConsent()                              │ │
│  │  │   ├─ verify() → bool                              │ │
│  │  │   └─ authorize()                                  │ │
│  │  │                                                    │ │
│  │  └─ ProcessingConsent @ 0xDEF...                    │ │
│  │      ├─ grantConsent()                               │ │
│  │      ├─ revokeConsent()                              │ │
│  │      └─ verify() → bool                              │ │
│  │                                                       │ │
│  │  Blockchain State:                                    │ │
│  │  Block #47 | Gas: 6721975                            │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

                          ▲
                          │ Reads compiled contracts
                          │
┌────────────────────────┴───────────────────────────────────┐
│              build/contracts/ (Truffle Output)              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  CollectionConsent.json                               │ │
│  │  ├─ abi: [...]           ← Function signatures       │ │
│  │  ├─ bytecode: "0x60..."   ← Contract code            │ │
│  │  └─ networks: {           ← Deployed addresses       │ │
│  │       "5777": {                                       │ │
│  │         "address": "0xABC..."                         │ │
│  │       }                                               │ │
│  │     }                                                 │ │
│  │                                                       │ │
│  │  ProcessingConsent.json                               │ │
│  │  └─ ...                                               │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Example:

### Creating a Consent:

```
1. USER clicks "Deploy Contract" in Browser
         ↓
2. STREAMLIT sends HTTP request to Python backend
         ↓
3. PYTHON (app.py) calls:
   CollectionConsent.constructor(
     controller, recipients, data, duration, purposes
   ).transact({from: dataSubject})
         ↓
4. WEB3.PY converts to JSON-RPC and sends to Ganache
         ↓
5. GANACHE executes smart contract constructor
         ↓
6. GANACHE returns transaction receipt with:
   - Transaction hash
   - Contract address
   - Gas used
         ↓
7. PYTHON (app.py) receives receipt
         ↓
8. STREAMLIT updates UI:
   ✅ "Contract deployed successfully!"
   📍 Contract Address: 0xABC...
         ↓
9. BROWSER shows balloons 🎈 and success message
```

### Granting Consent:

```
1. USER selects account and clicks "Grant Consent"
         ↓
2. STREAMLIT → PYTHON → WEB3 → GANACHE
         ↓
3. GANACHE executes:
   contract.grantConsent() from selected account
         ↓
4. Contract state changes:
   consentFromDS = true (or consentFromDC = true)
         ↓
5. UI updates:
   ⏳ Pending → ✅ Granted
```

## 🎨 UI Components:

### Sidebar:
```
┌──────────────────────┐
│ 🔐 GDPR Consent Sys  │
├──────────────────────┤
│ ✅ Connected to      │
│    Ganache           │
│ Block: 47            │
├──────────────────────┤
│ 👥 Available Accounts│
│ • DS 1: 0xaD2D...    │
│ • DC 1: 0x9b72...    │
│ • DP 1: 0x5A4a...    │
└──────────────────────┘
```

### Main Content:
```
┌──────────────────────────────────────────────┐
│  📝 Create  │ 🔍 View │ ✅ Grant │ 🧪 Test  │ Active Tab
├──────────────────────────────────────────────┤
│                                              │
│  TAB CONTENT HERE                            │
│  (Forms, buttons, metrics, etc.)             │
│                                              │
└──────────────────────────────────────────────┘
```

## 💻 Technology Stack:

```
Frontend (Browser):
├── Streamlit UI Components
├── JavaScript (automatic)
└── HTML/CSS (automatic)

Backend (Python):
├── Streamlit Server
├── Web3.py
└── JSON handling

Blockchain:
├── Ganache (Local Ethereum)
├── Smart Contracts (Solidity)
└── EVM (Execution)

Smart Contracts:
├── CollectionConsent.sol
├── ProcessingConsent.sol
└── Purpose.sol (imported)
```

## 🔧 Why This Architecture?

### ✅ Pros:
1. **Simple**: Python only, no JavaScript needed
2. **Fast**: Streamlit auto-refreshes on changes
3. **Real**: Actual blockchain transactions
4. **Visual**: Beautiful UI with zero CSS
5. **Flexible**: Easy to add new features

### ⚠️ Limitations:
1. **Not production-ready**: Uses local Ganache
2. **No authentication**: Anyone can use UI
3. **Single user**: No session management
4. **Local only**: Can't deploy to public web easily

### 💡 Perfect For:
- ✅ Research and testing
- ✅ Demos and presentations
- ✅ Rapid prototyping
- ✅ Educational purposes

## 🚀 Extending the UI:

Want to add more features? Easy!

### Add a new tab:
```python
with tab5:
    st.header("📊 Statistics")
    st.metric("Total Consents", len(deployed_consents))
    st.metric("Valid Consents", count_valid())
```

### Add a chart:
```python
import plotly.express as px

data = {"Status": ["Valid", "Invalid"], "Count": [5, 2]}
fig = px.pie(data, values='Count', names='Status')
st.plotly_chart(fig)
```

### Add real-time updates:
```python
st_autorefresh = st.empty()
while True:
    with st_autorefresh:
        status = contract.functions.verify().call()
        st.write(f"Current status: {status}")
    time.sleep(5)
```

---

**This architecture makes blockchain testing as easy as using a website! 🎉**
