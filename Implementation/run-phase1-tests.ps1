# Phase 1 Test Execution Script
# Run this to execute all Phase 1 functional tests

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: FUNCTIONAL TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Ganache is running
Write-Host "Checking Ganache connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 2
    Write-Host "✓ Ganache is running`n" -ForegroundColor Green
} catch {
    Write-Host "✗ Ganache not detected. Starting Ganache...`n" -ForegroundColor Red
    Write-Host "Please run in separate terminal: ganache --port 8545`n" -ForegroundColor Yellow
    exit 1
}

# Test Suite 1: Consent Creation
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUITE 1.1: CONSENT CREATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
truffle test test\phase1-suite1-consent-creation.js
$suite1 = $LASTEXITCODE

# Test Suite 2: Consent Granting
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUITE 1.2: CONSENT GRANTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
truffle test test\phase1-suite2-consent-granting.js
$suite2 = $LASTEXITCODE

# Test Suite 3: Consent Revocation
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUITE 1.3: CONSENT REVOCATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
truffle test test\phase1-suite3-consent-revocation.js
$suite3 = $LASTEXITCODE

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Suite 1.1 (Consent Creation): " -NoNewline
if ($suite1 -eq 0) { Write-Host "PASSED ✓" -ForegroundColor Green } else { Write-Host "FAILED ✗" -ForegroundColor Red }

Write-Host "Suite 1.2 (Consent Granting): " -NoNewline
if ($suite2 -eq 0) { Write-Host "PASSED ✓" -ForegroundColor Green } else { Write-Host "FAILED ✗" -ForegroundColor Red }

Write-Host "Suite 1.3 (Consent Revocation): " -NoNewline
if ($suite3 -eq 0) { Write-Host "PASSED ✓" -ForegroundColor Green } else { Write-Host "FAILED ✗" -ForegroundColor Red }

Write-Host "`n========================================`n" -ForegroundColor Cyan

$totalFailed = $suite1 + $suite2 + $suite3
if ($totalFailed -eq 0) {
    Write-Host "ALL TESTS PASSED! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SOME TESTS FAILED!" -ForegroundColor Red
    exit 1
}
