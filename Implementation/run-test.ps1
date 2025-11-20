# Quick Test Runner - Individual Suites
# Usage: .\run-test.ps1 <suite-number>
# Example: .\run-test.ps1 1

param(
    [Parameter(Mandatory=$false)]
    [int]$Suite = 1
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RUNNING TEST SUITE $Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

switch ($Suite) {
    1 {
        Write-Host "Suite 1.1: Consent Creation`n" -ForegroundColor Yellow
        truffle test test\phase1-suite1-consent-creation.js
    }
    2 {
        Write-Host "Suite 1.2: Consent Granting`n" -ForegroundColor Yellow
        truffle test test\phase1-suite2-consent-granting.js
    }
    3 {
        Write-Host "Suite 1.3: Consent Revocation`n" -ForegroundColor Yellow
        truffle test test\phase1-suite3-consent-revocation.js
    }
    default {
        Write-Host "Invalid suite number. Use 1, 2, or 3" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
