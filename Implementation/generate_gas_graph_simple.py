"""
Generate gas cost graphs without external dependencies (matplotlib issues on Windows)
Creates an HTML file with embedded SVG charts
"""

# Gas cost data from truffle-output.txt
configurations = ['Minimal', 'Medium', 'Maximum']
gas_costs = [3124774, 3170038, 3237969]
operations = ['DS Grant', 'DC Grant', 'Revoke']
operation_gas = [28058, 30913, 26168]

# Calculate costs
eth_price = 2000
gwei_to_eth = 1e-9

def gas_to_usd(gas, gwei_price):
    return gas * gwei_price * gwei_to_eth * eth_price

# Create HTML with SVG charts
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Gas Cost Analysis - GDPR Blockchain Research</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1400px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .chart {
            margin: 30px 0;
        }
        .bar {
            transition: opacity 0.3s;
        }
        .bar:hover {
            opacity: 0.8;
        }
        .summary {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        .insight {
            background: #e8f8f5;
            border-left: 4px solid #27ae60;
            padding: 15px;
            margin: 15px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #34495e;
            color: white;
        }
        tr:hover {
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⛽ Gas Cost Analysis: Blockchain GDPR Compliance</h1>
        <p><strong>Source:</strong> Test Suite 1.1.3 - Consent Creation Gas Consumption Analysis</p>
        <p><strong>Date:</strong> November 20, 2025</p>
        
        <h2>📊 Chart 1: Gas Costs vs Configuration Complexity</h2>
        <svg width="900" height="500" class="chart">
            <!-- Title -->
            <text x="450" y="30" text-anchor="middle" font-size="18" font-weight="bold">
                Consent Creation: Gas Costs vs Configuration Complexity
            </text>
            
            <!-- Bars -->
            <rect x="150" y="170" width="150" height="230" fill="#3498db" class="bar"/>
            <rect x="375" y="149" width="150" height="251" fill="#2ecc71" class="bar"/>
            <rect x="600" y="115" width="150" height="285" fill="#e74c3c" class="bar"/>
            
            <!-- Value labels -->
            <text x="225" y="155" text-anchor="middle" font-weight="bold">3,124,774</text>
            <text x="450" y="134" text-anchor="middle" font-weight="bold">3,170,038</text>
            <text x="675" y="100" text-anchor="middle" font-weight="bold">3,237,969</text>
            
            <!-- X-axis labels -->
            <text x="225" y="430" text-anchor="middle" font-size="14">Minimal Config</text>
            <text x="450" y="430" text-anchor="middle" font-size="14">Medium Config</text>
            <text x="675" y="430" text-anchor="middle" font-size="14">Maximum Config</text>
            
            <!-- Y-axis -->
            <line x1="100" y1="100" x2="100" y2="400" stroke="black" stroke-width="2"/>
            <line x1="100" y1="400" x2="800" y2="400" stroke="black" stroke-width="2"/>
            <text x="50" y="250" text-anchor="middle" font-weight="bold" transform="rotate(-90 50 250)">
                Gas Cost
            </text>
            
            <!-- Cost info box -->
            <rect x="550" y="250" width="220" height="80" fill="#fff3cd" stroke="#856404" rx="5"/>
            <text x="660" y="275" text-anchor="middle" font-size="12" font-weight="bold">Cost @ ETH $2,000</text>
            <text x="660" y="295" text-anchor="middle" font-size="11">10 Gwei: $62.50 - $64.76</text>
            <text x="660" y="310" text-anchor="middle" font-size="11">100 Gwei: $624.95 - $647.59</text>
            <text x="660" y="325" text-anchor="middle" font-size="10" fill="#666">(+3.6% complexity cost)</text>
        </svg>
        
        <div class="insight">
            <strong>💡 Key Insight:</strong> Configuration complexity adds ~113K gas (+3.6%), meaning the difference between 
            minimal and maximum complexity is only about $1.25 at typical gas prices. The deployment cost itself 
            (~$6-65 depending on network congestion) is the main expense.
        </div>
        
        <h2>📊 Chart 2: All Operations Comparison</h2>
        <svg width="900" height="450" class="chart">
            <!-- Title -->
            <text x="450" y="30" text-anchor="middle" font-size="18" font-weight="bold">
                Gas Costs: Creation vs Grant/Revoke Operations
            </text>
            
            <!-- Creation bars (scaled down for comparison) -->
            <rect x="100" y="100" width="120" height="280" fill="#3498db" opacity="0.3"/>
            <rect x="100" y="100" width="40" height="280" fill="#3498db" class="bar"/>
            <text x="120" y="390" text-anchor="middle" font-size="11">Create</text>
            <text x="120" y="80" text-anchor="middle" font-weight="bold" font-size="12">~3.1M gas</text>
            
            <!-- Grant/Revoke bars (actual scale) -->
            <rect x="300" y="355" width="80" height="25" fill="#f39c12" class="bar"/>
            <text x="340" y="390" text-anchor="middle" font-size="11">DS Grant</text>
            <text x="340" y="345" text-anchor="middle" font-weight="bold" font-size="11">28,058</text>
            
            <rect x="450" y="350" width="80" height="30" fill="#9b59b6" class="bar"/>
            <text x="490" y="390" text-anchor="middle" font-size="11">DC Grant</text>
            <text x="490" y="340" text-anchor="middle" font-weight="bold" font-size="11">30,913</text>
            
            <rect x="600" y="357" width="80" height="23" fill="#1abc9c" class="bar"/>
            <text x="640" y="390" text-anchor="middle" font-size="11">Revoke</text>
            <text x="640" y="347" text-anchor="middle" font-weight="bold" font-size="11">26,168</text>
            
            <!-- Comparison arrow -->
            <text x="450" y="200" text-anchor="middle" font-size="16" fill="#e74c3c" font-weight="bold">
                ⚠️ Creation is ~110x more expensive!
            </text>
            
            <!-- Axes -->
            <line x1="80" y1="100" x2="80" y2="380" stroke="black" stroke-width="2"/>
            <line x1="80" y1="380" x2="750" y2="380" stroke="black" stroke-width="2"/>
        </svg>
        
        <div class="insight">
            <strong>💡 Key Insight:</strong> Grant and revoke operations are ~110x cheaper than creation (under 31K gas vs 3.1M gas). 
            This means once a consent contract is deployed, ongoing consent management is extremely affordable (~$0.06 per operation).
        </div>
        
        <h2>📋 Detailed Gas Cost Table</h2>
        <table>
            <thead>
                <tr>
                    <th>Operation</th>
                    <th>Gas Cost</th>
                    <th>USD @ 10 Gwei</th>
                    <th>USD @ 50 Gwei</th>
                    <th>USD @ 100 Gwei</th>
                </tr>
            </thead>
            <tbody>
"""

# Add data rows
for i, (config, gas) in enumerate(zip(configurations, gas_costs)):
    html_content += f"""
                <tr>
                    <td><strong>Create ({config})</strong></td>
                    <td>{gas:,} gas</td>
                    <td>${gas_to_usd(gas, 10):.2f}</td>
                    <td>${gas_to_usd(gas, 50):.2f}</td>
                    <td>${gas_to_usd(gas, 100):.2f}</td>
                </tr>
"""

for op, gas in zip(operations, operation_gas):
    html_content += f"""
                <tr>
                    <td>{op}</td>
                    <td>{gas:,} gas</td>
                    <td>${gas_to_usd(gas, 10):.4f}</td>
                    <td>${gas_to_usd(gas, 50):.4f}</td>
                    <td>${gas_to_usd(gas, 100):.4f}</td>
                </tr>
"""

diff_total = gas_costs[2] - gas_costs[0]
diff_percent = (diff_total / gas_costs[0]) * 100

html_content += f"""
            </tbody>
        </table>
        
        <h2>📈 Summary Statistics</h2>
        <div class="summary">
<strong>Configuration Complexity Impact:</strong>
• Minimal Config:  {gas_costs[0]:,} gas (${gas_to_usd(gas_costs[0], 10):.2f} @ 10 Gwei)
• Medium Config:   {gas_costs[1]:,} gas (${gas_to_usd(gas_costs[1], 10):.2f} @ 10 Gwei)
• Maximum Config:  {gas_costs[2]:,} gas (${gas_to_usd(gas_costs[2], 10):.2f} @ 10 Gwei)
• Complexity Cost: +{diff_percent:.1f}% ({diff_total:,} gas difference)

<strong>Operation Costs:</strong>
• DS Grant:  {operation_gas[0]:,} gas (${gas_to_usd(operation_gas[0], 10):.4f} @ 10 Gwei)
• DC Grant:  {operation_gas[1]:,} gas (${gas_to_usd(operation_gas[1], 10):.4f} @ 10 Gwei)
• Revoke:    {operation_gas[2]:,} gas (${gas_to_usd(operation_gas[2], 10):.4f} @ 10 Gwei)

<strong>Cost Ratio:</strong>
• Creation vs Grant: {gas_costs[1] / operation_gas[0]:.1f}x more expensive
• Creation vs Revoke: {gas_costs[1] / operation_gas[2]:.1f}x more expensive
        </div>
        
        <div class="insight">
            <strong>📌 Report Context:</strong> These graphs visualize data from Test Suite 1.1.3 (Gas Consumption Analysis) 
            in the GDPR blockchain research report. The findings demonstrate that while contract deployment is expensive 
            (~$6-65), ongoing consent operations are affordable. However, the research ultimately concludes that blockchain-based 
            GDPR compliance fails due to metadata privacy violations (Section 5.3.4), not gas costs.
        </div>
    </div>
</body>
</html>
"""

# Write HTML file
with open('gas_costs_analysis.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Graph generated successfully!")
print("   📁 File: gas_costs_analysis.html")
print("   🌐 Open this file in your browser to view the interactive charts")
print()
print("📊 Summary:")
print(f"   Minimal Config:  {gas_costs[0]:,} gas (${gas_to_usd(gas_costs[0], 10):.2f} @ 10 Gwei)")
print(f"   Medium Config:   {gas_costs[1]:,} gas (${gas_to_usd(gas_costs[1], 10):.2f} @ 10 Gwei)")
print(f"   Maximum Config:  {gas_costs[2]:,} gas (${gas_to_usd(gas_costs[2], 10):.2f} @ 10 Gwei)")
print(f"   Complexity Cost: +{diff_percent:.1f}% ({diff_total:,} gas)")
print(f"   DS Grant Cost:   {operation_gas[0]:,} gas (${gas_to_usd(operation_gas[0], 10):.4f} @ 10 Gwei)")
print(f"   DC Grant Cost:   {operation_gas[1]:,} gas (${gas_to_usd(operation_gas[1], 10):.4f} @ 10 Gwei)")
print()
print("💡 Tip: You can screenshot the charts from the HTML file for your report!")
