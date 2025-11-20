# PowerShell script to capture key test outputs for screenshots
# Run this from the BC_GDPR-Compliant_PDManagement_System directory

Write-Host "`n=== Capturing Test Outputs for Report Screenshots ===" -ForegroundColor Cyan
Write-Host "This will run specific test suites and save outputs to text files`n" -ForegroundColor Yellow

# Create outputs directory
$outputDir = "test-outputs-for-screenshots"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "📁 Output directory: $outputDir" -ForegroundColor Green

# Test 1: Malicious Registration Service (Test 2.1)
Write-Host "`n[1/5] Running Test 2.1: Malicious Registration Service..." -ForegroundColor Cyan
truffle test test/phase2-suite1-malicious-rs.js | Out-File "$outputDir/test-2.1-malicious-rs.txt" -Encoding UTF8
Write-Host "✅ Saved to: $outputDir/test-2.1-malicious-rs.txt" -ForegroundColor Green

# Test 2: Metadata Privacy (CRITICAL - Test 2.6)
Write-Host "`n[2/5] Running Test 2.6: Metadata Privacy (SMOKING GUN)..." -ForegroundColor Cyan
truffle test test/phase2-suite6-metadata-privacy.js | Out-File "$outputDir/test-2.6-metadata-privacy.txt" -Encoding UTF8
Write-Host "✅ Saved to: $outputDir/test-2.6-metadata-privacy.txt" -ForegroundColor Green

# Test 3: Delegation (Your Contribution - Test 2.10)
Write-Host "`n[3/5] Running Test 2.10: Delegation Mechanism..." -ForegroundColor Cyan
truffle test test/phase2-suite10-delegation.js | Out-File "$outputDir/test-2.10-delegation.txt" -Encoding UTF8
Write-Host "✅ Saved to: $outputDir/test-2.10-delegation.txt" -ForegroundColor Green

# Test 4: Scalability Microbenchmark (Test 2.9)
Write-Host "`n[4/5] Running Test 2.9: Scalability Analysis..." -ForegroundColor Cyan
truffle test test/phase2-suite9-scalability-microbenchmark.js | Out-File "$outputDir/test-2.9-scalability.txt" -Encoding UTF8
Write-Host "✅ Saved to: $outputDir/test-2.9-scalability.txt" -ForegroundColor Green

# Test 5: Gas Consumption (Test 1.1)
Write-Host "`n[5/5] Running Test 1.1: Gas Consumption Analysis..." -ForegroundColor Cyan
truffle test test/phase1-suite1-consent-creation.js | Out-File "$outputDir/test-1.1-gas-analysis.txt" -Encoding UTF8
Write-Host "✅ Saved to: $outputDir/test-1.1-gas-analysis.txt" -ForegroundColor Green

Write-Host "`n=== All Test Outputs Captured! ===" -ForegroundColor Green
Write-Host "`n📋 Files ready for screenshots:" -ForegroundColor Yellow
Write-Host "   1. $outputDir/test-2.1-malicious-rs.txt" -ForegroundColor White
Write-Host "   2. $outputDir/test-2.6-metadata-privacy.txt (⭐ CRITICAL)" -ForegroundColor Red
Write-Host "   3. $outputDir/test-2.10-delegation.txt" -ForegroundColor White
Write-Host "   4. $outputDir/test-2.9-scalability.txt" -ForegroundColor White
Write-Host "   5. $outputDir/test-1.1-gas-analysis.txt" -ForegroundColor White

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open each .txt file in Notepad or VS Code" -ForegroundColor White
Write-Host "   2. Find the relevant sections (vulnerability confirmations, test results)" -ForegroundColor White
Write-Host "   3. Take screenshots using Windows Snipping Tool (Win+Shift+S)" -ForegroundColor White
Write-Host "   4. Insert screenshots into FINAL_REPORT.md at [PLACEHOLDER] markers`n" -ForegroundColor White

# Open the output directory in File Explorer
Invoke-Item $outputDir
