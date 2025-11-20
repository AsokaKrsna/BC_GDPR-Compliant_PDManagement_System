# 🎨 Streamlit Web UI for GDPR Consent System

Beautiful, interactive web interface for testing the blockchain consent system!

## 🚀 Quick Start

### Step 1: Install Python Dependencies

```powershell
cd ui
pip install -r requirements.txt
```

### Step 2: Make Sure Ganache is Running

In Terminal 1:
```powershell
cd BC_GDPR-Compliant_PDManagement_System
ganache --port 8545
```

### Step 3: Deploy Contracts (First Time Only)

In Terminal 2:
```powershell
cd BC_GDPR-Compliant_PDManagement_System
truffle migrate
```

### Step 4: Start Streamlit UI

In Terminal 3:
```powershell
cd BC_GDPR-Compliant_PDManagement_System\ui
streamlit run app.py
```

Your browser will open automatically at `http://localhost:8501` 🎉

---

## 🎮 Features

### 📝 Tab 1: Create Consent
- Select Data Subject, Controller, and Recipients
- Choose data categories (Name, Email, Address, Phone)
- Set consent duration
- Select purposes (Marketing, Analytics, Research)
- **Deploy consent contract with one click!**

### 🔍 Tab 2: View Consents
- See all deployed contracts
- Check consent validity status
- View Data Subject and Controller consent status
- See contract details (actors, data flags, duration)

### ✅ Tab 3: Grant/Revoke
- Grant consent as Data Subject or Controller
- Revoke consent
- **Real-time status updates!**
- Visual indicators for consent state

### 🧪 Tab 4: Test Console
- Execute Web3 commands from UI
- Get account balances
- Check block numbers
- Custom Python/Web3 code execution
- **Perfect for debugging!**

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────────────┐
│  🔐 GDPR Consent Management System              │
│  Blockchain-based Personal Data Access Control  │
├─────────────────────────────────────────────────┤
│  📝 Create  │ 🔍 View  │ ✅ Grant/Revoke │ 🧪 Test │
├─────────────────────────────────────────────────┤
│                                                  │
│  👥 Actors                  📋 Details          │
│  ┌──────────────┐          ┌──────────────┐    │
│  │ Data Subject │          │ ☑ Name       │    │
│  │ Controller   │          │ ☑ Email      │    │
│  │ Recipients   │          │ ☐ Address    │    │
│  └──────────────┘          │ ☑ Phone      │    │
│                            │ Duration: 86400s │  │
│                            │ Purposes: [0,1] │   │
│                            └──────────────┘    │
│                                                  │
│         🚀 Deploy Consent Contract              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 💡 How It Works

1. **Streamlit UI** (Python web app)
   ↓
2. **Web3.py** (Python → Blockchain)
   ↓
3. **Ganache** (Local Ethereum blockchain)
   ↓
4. **Smart Contracts** (Solidity)

The UI reads your compiled contracts from `build/contracts/` and interacts with them using Web3.py!

---

## 🔧 Troubleshooting

### "Not connected to Ganache"
→ Make sure Ganache is running: `ganache --port 8545`

### "No contracts deployed"
→ Deploy first: `truffle migrate`

### "Module not found"
→ Install dependencies: `pip install -r requirements.txt`

### "Contract not found at address"
→ Redeploy: `truffle migrate --reset`

---

## 🎯 Perfect For:

✅ **Demos** - Beautiful visual interface for presentations  
✅ **Testing** - Quick manual testing without command line  
✅ **Debugging** - See contract state in real-time  
✅ **Research** - Easy to simulate different scenarios  
✅ **Teaching** - Great for explaining how blockchain works  

---

## 🆚 Streamlit vs Truffle Console

| Feature | Streamlit UI | Truffle Console |
|---------|--------------|-----------------|
| **Easy to use** | ✅ Click buttons | ❌ Type commands |
| **Visual** | ✅ Beautiful UI | ❌ Text only |
| **Fast testing** | ✅ Very fast | ⚠️ Medium |
| **Scripting** | ❌ Limited | ✅ Full power |
| **Automation** | ❌ No | ✅ Yes |
| **Demos** | ✅ Perfect! | ❌ Not great |

**Use both!** Streamlit for demos and quick tests, Truffle Console for scripting and automation.

---

## 🎨 Customizing the UI

### Change Theme

Edit `.streamlit/config.toml`:

```toml
[theme]
primaryColor = "#FF4B4B"
backgroundColor = "#0E1117"
secondaryBackgroundColor = "#262730"
textColor = "#FAFAFA"
```

### Add More Features

Edit `app.py` and add new tabs or functionality!

Example - Add a "Statistics" tab:

```python
with tab5:
    st.header("📊 Statistics")
    st.metric("Total Consents", len(st.session_state.deployed_consents))
    st.metric("Valid Consents", count_valid_consents())
```

---

## 🚀 Advanced Usage

### Run on Different Port

```powershell
streamlit run app.py --server.port 8502
```

### Enable CORS (for external access)

```powershell
streamlit run app.py --server.enableCORS=false
```

### Production Mode

```powershell
streamlit run app.py --server.headless=true
```

---

## 📚 Next Steps

1. ✅ Start the UI (you're about to do this!)
2. 🎮 Create your first consent
3. 🔄 Grant consent from both parties
4. ✅ Verify it works
5. 🔬 Try attack scenarios:
   - Create consent as attacker
   - Try to grant consent as wrong account
   - Try to revoke someone else's consent
   - Test expired consents

---

## 🎉 You're Ready!

```powershell
cd ui
streamlit run app.py
```

**Your beautiful blockchain UI awaits! 🚀**
