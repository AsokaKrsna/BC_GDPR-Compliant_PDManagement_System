import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend to avoid display issues
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')  # Suppress numpy warnings

# Gas cost data from truffle-output.txt (Test 1.1.3)
configurations = ['Minimal\nConfig', 'Medium\nConfig', 'Maximum\nConfig']
gas_costs = [3124774, 3170038, 3237969]

# Additional operation gas costs for reference
operations = ['Create\n(Minimal)', 'Create\n(Medium)', 'Create\n(Maximum)', 'DS Grant', 'DC Grant', 'Revoke']
operation_gas = [3124774, 3170038, 3237969, 28058, 30913, 26168]

# Calculate USD costs at different gas prices (ETH at $2000)
eth_price = 2000
gwei_to_eth = 1e-9

def gas_to_usd(gas, gwei_price):
    return gas * gwei_price * gwei_to_eth * eth_price

# Create figure with two subplots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Subplot 1: Gas costs vs configuration complexity
ax1.bar(configurations, gas_costs, color=['#3498db', '#2ecc71', '#e74c3c'], alpha=0.8, edgecolor='black')
ax1.set_ylabel('Gas Cost', fontsize=12, fontweight='bold')
ax1.set_xlabel('Configuration Complexity', fontsize=12, fontweight='bold')
ax1.set_title('Consent Creation: Gas Costs vs Configuration Complexity', fontsize=14, fontweight='bold')
ax1.grid(axis='y', alpha=0.3, linestyle='--')

# Add value labels on bars
for i, (config, gas) in enumerate(zip(configurations, gas_costs)):
    ax1.text(i, gas + 20000, f'{gas:,}', ha='center', va='bottom', fontweight='bold', fontsize=10)

# Add cost estimates
y_min = min(gas_costs) - 100000
y_max = max(gas_costs) + 150000
ax1.set_ylim(y_min, y_max)

# Add cost reference lines
cost_low = gas_to_usd(gas_costs[1], 10)  # 10 Gwei
cost_high = gas_to_usd(gas_costs[1], 100)  # 100 Gwei
ax1.text(0.98, 0.95, f'Cost @ 10 Gwei: ${cost_low:.2f}', 
         transform=ax1.transAxes, ha='right', va='top',
         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5), fontsize=9)
ax1.text(0.98, 0.87, f'Cost @ 100 Gwei: ${cost_high:.2f}', 
         transform=ax1.transAxes, ha='right', va='top',
         bbox=dict(boxstyle='round', facecolor='lightcoral', alpha=0.5), fontsize=9)

# Subplot 2: All operations comparison (log scale for better visibility)
colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c']
bars = ax2.bar(range(len(operations)), operation_gas, color=colors, alpha=0.8, edgecolor='black')
ax2.set_yscale('log')
ax2.set_ylabel('Gas Cost (log scale)', fontsize=12, fontweight='bold')
ax2.set_xlabel('Operation Type', fontsize=12, fontweight='bold')
ax2.set_title('Gas Costs Comparison: All Operations', fontsize=14, fontweight='bold')
ax2.set_xticks(range(len(operations)))
ax2.set_xticklabels(operations, fontsize=9)
ax2.grid(axis='y', alpha=0.3, linestyle='--', which='both')

# Add value labels on bars
for i, (op, gas) in enumerate(zip(operations, operation_gas)):
    ax2.text(i, gas * 1.15, f'{gas:,}', ha='center', va='bottom', fontweight='bold', fontsize=8, rotation=0)

# Add insight box
insight_text = (
    "Key Insights:\n"
    "• Creation: ~3.1M gas\n"
    "• Complexity: +3.6% cost\n"
    "• Grant/Revoke: ~30K gas\n"
    "• 100x cheaper than creation"
)
ax2.text(0.98, 0.03, insight_text, 
         transform=ax2.transAxes, ha='right', va='bottom',
         bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7), 
         fontsize=9, family='monospace')

plt.tight_layout()
plt.savefig('gas_costs_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Graph saved as 'gas_costs_analysis.png'")
print(f"   Resolution: 300 DPI")
print(f"   File location: {plt.gcf().canvas.get_default_filename()}")

# Also create a simpler version focused just on configuration complexity
fig2, ax3 = plt.subplots(figsize=(10, 6))

x_pos = list(range(len(configurations)))
bars = ax3.bar(x_pos, gas_costs, color=['#3498db', '#2ecc71', '#e74c3c'], 
               alpha=0.85, edgecolor='black', linewidth=2)

# Add gradient effect
for bar, gas in zip(bars, gas_costs):
    bar.set_height(gas)
    
ax3.set_ylabel('Gas Cost', fontsize=14, fontweight='bold')
ax3.set_xlabel('Configuration Complexity', fontsize=14, fontweight='bold')
ax3.set_title('Smart Contract Deployment: Gas Costs vs Configuration Complexity\n(Test Suite 1.1.3)', 
              fontsize=16, fontweight='bold', pad=20)
ax3.set_xticks(x_pos)
ax3.set_xticklabels(configurations, fontsize=12)
ax3.grid(axis='y', alpha=0.3, linestyle='--', linewidth=1.5)

# Add value labels
for i, (pos, gas) in enumerate(zip(x_pos, gas_costs)):
    ax3.text(pos, gas + 15000, f'{gas:,} gas', 
            ha='center', va='bottom', fontweight='bold', fontsize=11)

# Add difference annotations
diff_total = gas_costs[2] - gas_costs[0]
diff_percent = (diff_total / gas_costs[0]) * 100
ax3.annotate('', xy=(2, gas_costs[2]), xytext=(0, gas_costs[0]),
            arrowprops=dict(arrowstyle='<->', color='red', lw=2))
ax3.text(1, (gas_costs[0] + gas_costs[2]) / 2, 
        f'Δ {diff_total:,} gas\n(+{diff_percent:.1f}%)', 
        ha='center', va='center',
        bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7),
        fontsize=10, fontweight='bold')

# Add cost table
cost_table_text = (
    "USD Cost Estimates (ETH @ $2,000):\n"
    "────────────────────────────────\n"
    f"10 Gwei:   ${gas_to_usd(gas_costs[0], 10):.2f} - ${gas_to_usd(gas_costs[2], 10):.2f}\n"
    f"50 Gwei:   ${gas_to_usd(gas_costs[0], 50):.2f} - ${gas_to_usd(gas_costs[2], 50):.2f}\n"
    f"100 Gwei:  ${gas_to_usd(gas_costs[0], 100):.2f} - ${gas_to_usd(gas_costs[2], 100):.2f}"
)
ax3.text(0.02, 0.97, cost_table_text, 
        transform=ax3.transAxes, ha='left', va='top',
        bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8),
        fontsize=10, family='monospace')

plt.tight_layout()
plt.savefig('gas_costs_configuration.png', dpi=300, bbox_inches='tight')
print("✅ Simplified graph saved as 'gas_costs_configuration.png'")
print("\n📊 Summary:")
print(f"   Minimal Config:  {gas_costs[0]:,} gas (${gas_to_usd(gas_costs[0], 10):.2f} @ 10 Gwei)")
print(f"   Medium Config:   {gas_costs[1]:,} gas (${gas_to_usd(gas_costs[1], 10):.2f} @ 10 Gwei)")
print(f"   Maximum Config:  {gas_costs[2]:,} gas (${gas_to_usd(gas_costs[2], 10):.2f} @ 10 Gwei)")
print(f"   Complexity Cost: +{diff_percent:.1f}% ({diff_total:,} gas)")
print(f"   DS Grant Cost:   {operation_gas[3]:,} gas (${gas_to_usd(operation_gas[3], 10):.4f} @ 10 Gwei)")
print(f"   DC Grant Cost:   {operation_gas[4]:,} gas (${gas_to_usd(operation_gas[4], 10):.4f} @ 10 Gwei)")

print("\n✅ Graphs generated successfully!")
print("   📁 gas_costs_analysis.png - Comprehensive comparison")
print("   📁 gas_costs_configuration.png - Configuration complexity focus")
