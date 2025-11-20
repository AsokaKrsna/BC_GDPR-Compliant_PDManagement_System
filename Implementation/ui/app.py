import streamlit as st
import json
from web3 import Web3
import time

# Page config
st.set_page_config(
    page_title="GDPR Consent Manager",
    page_icon="🔐",
    layout="wide"
)

# Connect to Ganache
@st.cache_resource
def get_web3():
    try:
        w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
        if w3.is_connected():
            return w3
        else:
            return None
    except Exception as e:
        return None

# Load contract
@st.cache_resource
def load_contract(_w3, contract_name):
    try:
        import os
        contract_path = os.path.join(os.path.dirname(__file__), '..', 'build', 'contracts', f'{contract_name}.json')
        
        with open(contract_path, 'r') as f:
            contract_json = json.load(f)
        
        abi = contract_json['abi']
        bytecode = contract_json.get('bytecode', '')
        
        # Get latest deployment
        networks = contract_json.get('networks', {})
        if networks:
            network_id = list(networks.keys())[-1]
            address = networks[network_id]['address']
            return _w3.eth.contract(address=address, abi=abi), abi, bytecode
        return None, abi, bytecode
    except Exception as e:
        st.error(f"Error loading contract: {e}")
        return None, None, None

# Initialize Web3
w3 = get_web3()

# Sidebar
st.sidebar.title("🔐 GDPR Consent System")
st.sidebar.markdown("---")

if w3 and w3.is_connected():
    st.sidebar.success("✅ Connected to Ganache")
    st.sidebar.info(f"Block: {w3.eth.block_number}")
else:
    st.sidebar.error("❌ Not connected to Ganache")
    st.sidebar.warning("Start Ganache: `ganache --port 8545`")
    st.stop()

# Get accounts
accounts = w3.eth.accounts
st.sidebar.markdown("### 👥 Available Accounts")
account_labels = {
    accounts[0]: "Data Subject 1",
    accounts[1]: "Data Controller 1",
    accounts[2]: "Data Processor 1",
    accounts[3]: "Data Subject 2",
    accounts[4]: "Data Controller 2",
}

# Main page
st.title("🔐 GDPR-Compliant Consent Management System")
st.markdown("### Blockchain-based Personal Data Access Control")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📝 Create Consent", 
    "🔍 View Consents", 
    "✅ Grant/Revoke", 
    "🧪 Test Console"
])

# TAB 1: Create Consent
with tab1:
    st.header("📝 Create Collection Consent")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Actors")
        data_subject = st.selectbox(
            "Data Subject",
            options=accounts[:5],
            format_func=lambda x: f"{account_labels.get(x, 'Account')} ({x[:8]}...)",
            key="create_ds"
        )
        
        controller = st.selectbox(
            "Data Controller",
            options=accounts[:5],
            format_func=lambda x: f"{account_labels.get(x, 'Account')} ({x[:8]}...)",
            key="create_dc",
            index=1
        )
        
        # Multi-select for recipients
        recipients = st.multiselect(
            "Recipients (Data Processors)",
            options=accounts[:5],
            default=[accounts[2]],
            format_func=lambda x: f"{account_labels.get(x, 'Account')} ({x[:8]}...)",
            key="create_recipients"
        )
    
    with col2:
        st.subheader("Consent Details")
        
        # Data categories (bit flags)
        st.markdown("**Data Categories:**")
        data_name = st.checkbox("Name", value=True)
        data_email = st.checkbox("Email", value=True)
        data_address = st.checkbox("Address", value=False)
        data_phone = st.checkbox("Phone", value=True)
        
        # Convert to bit flags
        data_flags = 0
        if data_name: data_flags |= (1 << 0)
        if data_email: data_flags |= (1 << 1)
        if data_address: data_flags |= (1 << 2)
        if data_phone: data_flags |= (1 << 3)
        
        st.code(f"Data Flags: {data_flags} (binary: {bin(data_flags)})")
        
        duration = st.number_input(
            "Duration (seconds)",
            min_value=60,
            max_value=31536000,
            value=86400,
            help="How long the consent is valid"
        )
        
        # Purposes
        st.markdown("**Purposes:**")
        purpose_marketing = st.checkbox("Marketing", value=True)
        purpose_analytics = st.checkbox("Analytics", value=True)
        purpose_research = st.checkbox("Research", value=False)
        
        purposes = []
        if purpose_marketing: purposes.append(0)
        if purpose_analytics: purposes.append(1)
        if purpose_research: purposes.append(2)
        
        st.code(f"Purposes: {purposes}")
    
    st.markdown("---")
    
    if st.button("🚀 Deploy Consent Contract", type="primary", use_container_width=True):
        if not recipients:
            st.error("Please select at least one recipient!")
        else:
            with st.spinner("Deploying contract to blockchain..."):
                try:
                    # Load ABI and bytecode
                    _, abi, bytecode = load_contract(w3, 'CollectionConsent')
                    
                    if abi and bytecode:
                        # Create contract factory
                        CollectionConsent = w3.eth.contract(abi=abi, bytecode=bytecode)
                        
                        # Deploy
                        tx_hash = CollectionConsent.constructor(
                            controller,
                            recipients,
                            data_flags,
                            duration,
                            purposes
                        ).transact({'from': data_subject})
                        
                        # Wait for receipt
                        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                        
                        contract_address = receipt['contractAddress'] if isinstance(receipt, dict) else receipt.contractAddress
                        
                        st.success(f"✅ Contract deployed successfully!")
                        st.code(f"Contract Address: {contract_address}")
                        st.balloons()
                        
                        # Store in session state
                        if 'deployed_consents' not in st.session_state:
                            st.session_state.deployed_consents = []
                        
                        st.session_state.deployed_consents.append({
                            'address': contract_address,
                            'data_subject': data_subject,
                            'controller': controller,
                            'recipients': recipients,
                            'purposes': purposes,
                            'timestamp': time.time()
                        })
                        
                except Exception as e:
                    st.error(f"❌ Deployment failed: {e}")

# TAB 2: View Consents
with tab2:
    st.header("🔍 View Deployed Consents")
    
    # Check if contracts are deployed
    collection_contract, collection_abi, collection_bytecode = load_contract(w3, 'CollectionConsent')
    
    if collection_contract:
        st.success(f"✅ Found deployed contract at: {collection_contract.address}")
        
        # Get contract details
        col1, col2, col3 = st.columns(3)
        
        try:
            is_valid = collection_contract.functions.verify().call()
            ds_consent = collection_contract.functions.consentFromDS().call()
            dc_consent = collection_contract.functions.consentFromDC().call()
            
            with col1:
                st.metric("Contract Status", "✅ Valid" if is_valid else "❌ Invalid")
            with col2:
                st.metric("Data Subject Consent", "✅ Granted" if ds_consent else "❌ Not Granted")
            with col3:
                st.metric("Controller Consent", "✅ Granted" if dc_consent else "❌ Not Granted")
            
            # Show details
            st.markdown("---")
            st.subheader("Contract Details")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("**Actors:**")
                st.text(f"Data Subject: {collection_contract.functions.dataSubject().call()}")
                st.text(f"Controller: {collection_contract.functions.controller().call()}")
            
            with col2:
                st.markdown("**Consent Info:**")
                st.text(f"Data Flags: {collection_contract.functions.data().call()}")
                st.text(f"Duration: {collection_contract.functions.duration().call()} seconds")
            
        except Exception as e:
            st.error(f"Error reading contract: {e}")
    
    else:
        st.warning("⚠️ No contracts deployed yet!")
        st.info("👈 Go to 'Create Consent' tab to deploy a new contract")
    
    # Show session deployed consents
    if 'deployed_consents' in st.session_state and st.session_state.deployed_consents:
        st.markdown("---")
        st.subheader("📋 Recently Deployed Consents")
        
        for idx, consent in enumerate(st.session_state.deployed_consents):
            with st.expander(f"Consent #{idx + 1} - {consent['address'][:10]}..."):
                st.code(f"Address: {consent['address']}")
                st.text(f"Data Subject: {consent['data_subject'][:10]}...")
                st.text(f"Controller: {consent['controller'][:10]}...")
                st.text(f"Recipients: {len(consent['recipients'])} processor(s)")
                st.text(f"Purposes: {consent['purposes']}")
                st.text(f"Created: {time.ctime(consent['timestamp'])}")

# TAB 3: Grant/Revoke
with tab3:
    st.header("✅ Grant or Revoke Consent")
    
    collection_contract, _, _ = load_contract(w3, 'CollectionConsent')
    
    if collection_contract:
        st.info(f"📍 Working with contract: `{collection_contract.address}`")
        
        # Get current status
        try:
            is_valid = collection_contract.functions.verify().call()
            ds_consent = collection_contract.functions.consentFromDS().call()
            dc_consent = collection_contract.functions.consentFromDC().call()
            
            col1, col2 = st.columns(2)
            
            # Grant Consent
            with col1:
                st.subheader("✅ Grant Consent")
                
                grant_account = st.selectbox(
                    "Grant as:",
                    options=accounts[:5],
                    format_func=lambda x: f"{account_labels.get(x, 'Account')} ({x[:8]}...)",
                    key="grant_account"
                )
                
                if st.button("✅ Grant Consent", use_container_width=True):
                    with st.spinner("Submitting transaction..."):
                        try:
                            tx_hash = collection_contract.functions.grantConsent().transact({
                                'from': grant_account
                            })
                            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                            
                            tx_status = receipt['status'] if isinstance(receipt, dict) else receipt.status
                            
                            if tx_status == 1:
                                st.success("✅ Consent granted successfully!")
                                st.rerun()
                            else:
                                st.error("❌ Transaction failed")
                        except Exception as e:
                            st.error(f"❌ Error: {e}")
            
            # Revoke Consent
            with col2:
                st.subheader("❌ Revoke Consent")
                
                revoke_account = st.selectbox(
                    "Revoke as:",
                    options=accounts[:5],
                    format_func=lambda x: f"{account_labels.get(x, 'Account')} ({x[:8]}...)",
                    key="revoke_account"
                )
                
                if st.button("❌ Revoke Consent", use_container_width=True):
                    with st.spinner("Submitting transaction..."):
                        try:
                            tx_hash = collection_contract.functions.revokeConsent().transact({
                                'from': revoke_account
                            })
                            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                            
                            tx_status = receipt['status'] if isinstance(receipt, dict) else receipt.status
                            
                            if tx_status == 1:
                                st.success("✅ Consent revoked successfully!")
                                st.rerun()
                            else:
                                st.error("❌ Transaction failed")
                        except Exception as e:
                            st.error(f"❌ Error: {e}")
            
            # Current Status
            st.markdown("---")
            st.subheader("📊 Current Status")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if is_valid:
                    st.success("✅ Consent is VALID")
                else:
                    st.error("❌ Consent is INVALID")
            
            with col2:
                if ds_consent:
                    st.success("✅ DS Granted")
                else:
                    st.warning("⏳ DS Pending")
            
            with col3:
                if dc_consent:
                    st.success("✅ DC Granted")
                else:
                    st.warning("⏳ DC Pending")
                    
        except Exception as e:
            st.error(f"Error reading contract: {e}")
    
    else:
        st.warning("⚠️ No contracts deployed yet!")

# TAB 4: Test Console
with tab4:
    st.header("🧪 Interactive Test Console")
    
    st.markdown("""
    This is a simplified console for testing. For advanced testing, use:
    ```bash
    truffle console
    ```
    """)
    
    st.subheader("📝 Quick Commands")
    
    # Command selector
    command = st.selectbox(
        "Select Command:",
        [
            "Get Accounts",
            "Get Balance",
            "Get Block Number",
            "Check Contract Validity",
            "Custom Web3 Command"
        ]
    )
    
    if command == "Get Accounts":
        if st.button("Execute"):
            st.code("\n".join([f"{i}: {acc}" for i, acc in enumerate(accounts)]))
    
    elif command == "Get Balance":
        account = st.selectbox("Select Account:", accounts[:5])
        if st.button("Execute"):
            balance = w3.eth.get_balance(account)
            st.code(f"Balance: {w3.from_wei(balance, 'ether')} ETH")
    
    elif command == "Get Block Number":
        if st.button("Execute"):
            st.code(f"Current Block: {w3.eth.block_number}")
    
    elif command == "Check Contract Validity":
        collection_contract, _, _ = load_contract(w3, 'CollectionConsent')
        if collection_contract:
            if st.button("Execute"):
                try:
                    is_valid = collection_contract.functions.verify().call()
                    st.code(f"Consent Valid: {is_valid}")
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("No contract deployed")
    
    elif command == "Custom Web3 Command":
        st.warning("⚠️ Advanced users only!")
        custom_code = st.text_area(
            "Enter Python code (has access to `w3` and `accounts`):",
            "# Example:\n# w3.eth.block_number\n# w3.eth.get_balance(accounts[0])"
        )
        
        if st.button("Execute Custom Code"):
            try:
                result = eval(custom_code)
                st.success("✅ Executed successfully!")
                st.code(result)
            except Exception as e:
                st.error(f"❌ Error: {e}")

# Footer
st.sidebar.markdown("---")
st.sidebar.markdown("### 📚 Resources")
st.sidebar.markdown("📖 [Documentation](https://github.com/toful/PD_AccessControlSystem)")
st.sidebar.markdown("🔧 [Truffle Console](https://trufflesuite.com/docs/truffle/getting-started/using-truffle-develop-and-the-console/)")
st.sidebar.markdown("📂 See `START_HERE.md` in project root")
if w3:
    st.sidebar.info(f"💾 Network ID: {w3.net.version}")
