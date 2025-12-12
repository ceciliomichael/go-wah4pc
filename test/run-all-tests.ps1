# WAH4PC API Gateway - Test Runner
# Runs all test suites and generates a summary report

param(
    [string]$BaseUrl = "http://localhost:3050",
    [switch]$ProviderOnly,
    [switch]$PatientRequestOnly,
    [switch]$PatientResponseOnly,
    [switch]$IntegrationOnly,
    [switch]$NoSave,
    [string]$LogsPath = "./test-logs"
)

$ErrorActionPreference = "Continue"

# Script paths
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Setup logging - always save logs unless -NoSave is specified
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir = Join-Path $scriptRoot $LogsPath
$logFile = Join-Path $logDir "test-run-$timestamp.log"
$jsonResultsFile = Join-Path $logDir "test-results-$timestamp.json"

# Create log directory
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Transcript for full log capture
if (-not $NoSave) {
    Start-Transcript -Path $logFile -Force | Out-Null
}

# Test suites configuration
$testSuites = @(
    @{
        Name = "Provider API Tests"
        Script = "$scriptRoot/api/provider-tests.ps1"
        Category = "API"
        Enabled = (-not $PatientRequestOnly -and -not $PatientResponseOnly -and -not $IntegrationOnly) -or $ProviderOnly
    },
    @{
        Name = "Patient Request API Tests"
        Script = "$scriptRoot/api/patient-request-tests.ps1"
        Category = "API"
        Enabled = (-not $ProviderOnly -and -not $PatientResponseOnly -and -not $IntegrationOnly) -or $PatientRequestOnly
    },
    @{
        Name = "Patient Response API Tests"
        Script = "$scriptRoot/api/patient-response-tests.ps1"
        Category = "API"
        Enabled = (-not $ProviderOnly -and -not $PatientRequestOnly -and -not $IntegrationOnly) -or $PatientResponseOnly
    },
    @{
        Name = "End-to-End Integration Tests"
        Script = "$scriptRoot/integration/end-to-end-tests.ps1"
        Category = "Integration"
        Enabled = (-not $ProviderOnly -and -not $PatientRequestOnly -and -not $PatientResponseOnly) -or $IntegrationOnly
    }
)

# Colors and formatting
function Write-Banner {
    param([string]$Text)
    $width = 70
    $padding = [math]::Max(0, ($width - $Text.Length - 2) / 2)
    $leftPad = " " * [math]::Floor($padding)
    $rightPad = " " * [math]::Ceiling($padding)
    
    Write-Host ""
    Write-Host ("=" * $width) -ForegroundColor Magenta
    Write-Host "=$leftPad$Text$rightPad=" -ForegroundColor Magenta
    Write-Host ("=" * $width) -ForegroundColor Magenta
    Write-Host ""
}

function Write-SuiteHeader {
    param([string]$Name, [int]$Index, [int]$Total)
    Write-Host ""
    Write-Host "[$Index/$Total] Running: $Name" -ForegroundColor Cyan
    Write-Host ("-" * 50) -ForegroundColor DarkGray
}

function Write-SuiteResult {
    param([string]$Name, [bool]$Success, [TimeSpan]$Duration)
    $status = if ($Success) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Success) { "Green" } else { "Red" }
    $durationStr = "{0:mm}:{0:ss}.{0:fff}" -f $Duration
    
    Write-Host "$status $Name ($durationStr)" -ForegroundColor $color
}

# Main execution
Write-Banner "WAH4PC API GATEWAY TEST SUITE"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BaseUrl"
Write-Host "  Test Suites: $($testSuites | Where-Object { $_.Enabled } | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host ""

# Check server availability
Write-Host "Checking server availability..." -ForegroundColor Gray
try {
    $healthCheck = Invoke-WebRequest -Uri "$BaseUrl/v1/provider" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Server is running at $BaseUrl" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Server is not responding at $BaseUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the server before running tests:" -ForegroundColor Yellow
    Write-Host "  cd $((Get-Location).Path)"
    Write-Host "  go run cmd/server/main.go"
    Write-Host ""
    exit 1
}

# Run test suites
$results = @()
$totalPassed = 0
$totalFailed = 0
$enabledSuites = $testSuites | Where-Object { $_.Enabled }
$suiteIndex = 0

foreach ($suite in $enabledSuites) {
    $suiteIndex++
    Write-SuiteHeader -Name $suite.Name -Index $suiteIndex -Total $enabledSuites.Count
    
    $startTime = Get-Date
    
    try {
        # Run the test script
        $output = & $suite.Script -BaseUrl $BaseUrl 2>&1
        $exitCode = $LASTEXITCODE
        
        # Display output
        $output | ForEach-Object { Write-Host $_ }
        
        $endTime = Get-Date
        $duration = $endTime - $startTime
        $success = ($exitCode -eq 0)
        
        $results += @{
            Name = $suite.Name
            Category = $suite.Category
            Success = $success
            ExitCode = $exitCode
            Duration = $duration
            Output = $output -join "`n"
        }
        
        if ($success) {
            $totalPassed++
        } else {
            $totalFailed++
        }
        
    } catch {
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        Write-Host "[ERROR] Failed to run test suite: $_" -ForegroundColor Red
        
        $results += @{
            Name = $suite.Name
            Category = $suite.Category
            Success = $false
            ExitCode = -1
            Duration = $duration
            Error = $_.Exception.Message
        }
        
        $totalFailed++
    }
}

# Summary
Write-Banner "TEST RESULTS SUMMARY"

Write-Host "Suite Results:" -ForegroundColor Yellow
Write-Host ""

foreach ($result in $results) {
    Write-SuiteResult -Name $result.Name -Success $result.Success -Duration $result.Duration
}

Write-Host ""
Write-Host ("-" * 50) -ForegroundColor DarkGray
Write-Host ""

$totalSuites = $results.Count
$passRate = if ($totalSuites -gt 0) { [math]::Round(($totalPassed / $totalSuites) * 100, 1) } else { 0 }

Write-Host "Total Suites: $totalSuites"
Write-Host "Passed: $totalPassed" -ForegroundColor Green
Write-Host "Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -gt 0) { "Red" } else { "Green" })
Write-Host "Pass Rate: $passRate%"

# Save results (always unless -NoSave)
if (-not $NoSave) {
    $jsonResults = @{
        timestamp = (Get-Date).ToString("o")
        baseUrl = $BaseUrl
        summary = @{
            totalSuites = $totalSuites
            passed = $totalPassed
            failed = $totalFailed
            passRate = $passRate
        }
        suites = $results | ForEach-Object {
            @{
                name = $_.Name
                category = $_.Category
                success = $_.Success
                exitCode = $_.ExitCode
                durationMs = [math]::Round($_.Duration.TotalMilliseconds)
            }
        }
    }
    
    $jsonResults | ConvertTo-Json -Depth 10 | Out-File $jsonResultsFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "Logs saved to: $logFile" -ForegroundColor Gray
    Write-Host "Results saved to: $jsonResultsFile" -ForegroundColor Gray
    
    # Stop transcript
    Stop-Transcript | Out-Null
}

Write-Host ""

# Exit with appropriate code
if ($totalFailed -gt 0) {
    exit 1
}
exit 0