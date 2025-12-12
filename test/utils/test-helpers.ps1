# Test Helpers for WAH4PC API Gateway
# Common utilities and functions for all test scripts

$script:BaseUrl = "http://localhost:3050"
$script:TestResults = @()
$script:PassCount = 0
$script:FailCount = 0

# Colors for output
function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-TestSection {
    param([string]$Section)
    Write-Host ""
    Write-Host "--- $Section ---" -ForegroundColor Yellow
}

function Write-Pass {
    param([string]$TestName)
    $script:PassCount++
    $script:TestResults += @{ Name = $TestName; Status = "PASS" }
    Write-Host "[PASS] $TestName" -ForegroundColor Green
}

function Write-Fail {
    param([string]$TestName, [string]$Message = "")
    $script:FailCount++
    $script:TestResults += @{ Name = $TestName; Status = "FAIL"; Message = $Message }
    Write-Host "[FAIL] $TestName" -ForegroundColor Red
    if ($Message) {
        Write-Host "       $Message" -ForegroundColor Red
    }
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Gray
}

function Write-TestSummary {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "Total Tests: $($script:PassCount + $script:FailCount)"
    Write-Host "Passed: $($script:PassCount)" -ForegroundColor Green
    Write-Host "Failed: $($script:FailCount)" -ForegroundColor $(if ($script:FailCount -gt 0) { "Red" } else { "Green" })
    Write-Host ""
    
    if ($script:FailCount -gt 0) {
        Write-Host "Failed Tests:" -ForegroundColor Red
        foreach ($result in $script:TestResults | Where-Object { $_.Status -eq "FAIL" }) {
            Write-Host "  - $($result.Name): $($result.Message)" -ForegroundColor Red
        }
    }
}

function Reset-TestCounters {
    $script:TestResults = @()
    $script:PassCount = 0
    $script:FailCount = 0
}

# HTTP Request Helpers
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [switch]$RawResponse
    )
    
    $url = "$script:BaseUrl$Endpoint"
    $Headers["Content-Type"] = "application/json"
    
    $params = @{
        Method = $Method
        Uri = $url
        Headers = $Headers
        ErrorAction = "Stop"
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-WebRequest @params
        $result = @{
            StatusCode = $response.StatusCode
            Content = $response.Content
            Success = $true
        }
        
        if (-not $RawResponse) {
            try {
                $result.Data = $response.Content | ConvertFrom-Json
            } catch {
                $result.Data = $null
            }
        }
        
        return $result
    } catch {
        $statusCode = 0
        $content = ""
        
        # Handle PowerShell Core (7+) and Windows PowerShell differently
        if ($_.Exception -is [Microsoft.PowerShell.Commands.HttpResponseException]) {
            # PowerShell Core
            $statusCode = [int]$_.Exception.Response.StatusCode
            $content = $_.ErrorDetails.Message
        } elseif ($_.Exception.Response) {
            # Windows PowerShell fallback
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $content = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {
                $content = $_.ErrorDetails.Message
            }
        }
        
        # If we still don't have status code, try to parse from error message
        if ($statusCode -eq 0) {
            if ($_.Exception.Message -match "(\d{3})") {
                $statusCode = [int]$Matches[1]
            }
        }
        
        return @{
            StatusCode = $statusCode
            Content = $content
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-ApiGet {
    param([string]$Endpoint)
    return Invoke-ApiRequest -Method "GET" -Endpoint $Endpoint
}

function Test-ApiPost {
    param([string]$Endpoint, [object]$Body)
    return Invoke-ApiRequest -Method "POST" -Endpoint $Endpoint -Body $Body
}

# Assertion Helpers
function Assert-StatusCode {
    param(
        [string]$TestName,
        [object]$Response,
        [int]$Expected
    )
    
    if ($Response.StatusCode -eq $Expected) {
        Write-Pass "$TestName (Status: $Expected)"
        return $true
    } else {
        Write-Fail "$TestName" "Expected status $Expected, got $($Response.StatusCode)"
        return $false
    }
}

function Assert-PropertyExists {
    param(
        [string]$TestName,
        [object]$Object,
        [string]$Property
    )
    
    if ($Object.PSObject.Properties.Name -contains $Property) {
        Write-Pass "$TestName - Property '$Property' exists"
        return $true
    } else {
        Write-Fail "$TestName" "Property '$Property' not found"
        return $false
    }
}

function Assert-PropertyEquals {
    param(
        [string]$TestName,
        [object]$Object,
        [string]$Property,
        [object]$Expected
    )
    
    $actual = $Object.$Property
    if ($actual -eq $Expected) {
        Write-Pass "$TestName - $Property = '$Expected'"
        return $true
    } else {
        Write-Fail "$TestName" "Expected $Property='$Expected', got '$actual'"
        return $false
    }
}

function Assert-NotNull {
    param(
        [string]$TestName,
        [object]$Value
    )
    
    if ($null -ne $Value -and $Value -ne "") {
        Write-Pass "$TestName - Value is not null"
        return $true
    } else {
        Write-Fail "$TestName" "Value is null or empty"
        return $false
    }
}

function Assert-ArrayLength {
    param(
        [string]$TestName,
        [array]$Array,
        [int]$MinLength = 0,
        [int]$MaxLength = [int]::MaxValue
    )
    
    $length = if ($null -eq $Array) { 0 } else { $Array.Count }
    
    if ($length -ge $MinLength -and $length -le $MaxLength) {
        Write-Pass "$TestName - Array length: $length"
        return $true
    } else {
        Write-Fail "$TestName" "Array length $length not in range [$MinLength, $MaxLength]"
        return $false
    }
}

# Server Health Check
function Test-ServerHealth {
    Write-Info "Checking if server is running at $script:BaseUrl..."
    
    try {
        $response = Invoke-WebRequest -Uri "$script:BaseUrl/v1/provider" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[OK] Server is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[ERROR] Server is not responding at $script:BaseUrl" -ForegroundColor Red
        Write-Host "        Please start the server with: go run cmd/server/main.go" -ForegroundColor Yellow
        return $false
    }
}

# Data Generation Helpers
function New-TestProvider {
    param(
        [string]$ProviderId = "test-provider-$(Get-Random -Minimum 1000 -Maximum 9999)",
        [string]$Name = "Test Provider",
        [string]$Type = "HOSPITAL",
        [string]$BaseUrl = "http://localhost:8080",
        [string]$CallbackUrl = "http://localhost:8080/callback"
    )
    
    return @{
        providerId = $ProviderId
        name = $Name
        type = $Type
        baseUrl = $BaseUrl
        endpoints = @{
            patientRequest = "/api/patient/request"
        }
        callback = @{
            patientRequest = "$CallbackUrl/patient-request"
            patientResponse = "$CallbackUrl/patient-response"
        }
    }
}

function New-TestPatientRequest {
    param(
        [string]$RequestorProviderId,
        [string]$TargetProviderId,
        [string]$PatientId = "patient-$(Get-Random -Minimum 1000 -Maximum 9999)",
        [string]$CorrelationKey = ""
    )
    
    $request = @{
        requestorProviderId = $RequestorProviderId
        targetProviderId = $TargetProviderId
        patientReference = @{
            id = $PatientId
            identifiers = @(
                @{
                    system = "urn:oid:2.16.840.1.113883.4.1"
                    value = "123-45-6789"
                }
            )
        }
        metadata = @{
            reason = "Test request"
            notes = "Automated test"
        }
    }
    
    if ($CorrelationKey) {
        $request.correlationKey = $CorrelationKey
    }
    
    return $request
}

function New-TestPatientResponse {
    param(
        [string]$RequestId,
        [string]$FromProviderId,
        [string]$Status = "COMPLETED",
        [string]$Error = ""
    )
    
    $response = @{
        requestId = $RequestId
        fromProviderId = $FromProviderId
        status = $Status
        fhirPatient = @{
            resourceType = "Patient"
            id = "test-patient-$(Get-Random -Minimum 1000 -Maximum 9999)"
            name = @(
                @{
                    use = "official"
                    family = "TestFamily"
                    given = @("TestGiven")
                }
            )
            gender = "male"
            birthDate = "1990-01-15"
        }
    }
    
    if ($Error) {
        $response.error = $Error
        $response.Remove("fhirPatient")
    }
    
    return $response
}

# Functions are available via dot-sourcing (. .\test-helpers.ps1)