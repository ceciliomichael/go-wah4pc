# Provider API Tests
# Tests for /v1/provider endpoints

param(
    [string]$BaseUrl = "http://localhost:3050"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptPath\..\utils\test-helpers.ps1"

$script:BaseUrl = $BaseUrl

Write-TestHeader "PROVIDER API TESTS"

# Check server health
if (-not (Test-ServerHealth)) {
    exit 1
}

Reset-TestCounters

# ============================================================
# TEST: Get Providers (Empty or Existing)
# ============================================================
Write-TestSection "GET /v1/provider - List Providers"

$response = Test-ApiGet -Endpoint "/v1/provider"
Assert-StatusCode -TestName "Get providers returns 200" -Response $response -Expected 200

if ($response.Success) {
    Write-Info "Current provider count: $($response.Data.Count)"
}

# ============================================================
# TEST: Create Provider - Success
# ============================================================
Write-TestSection "POST /v1/provider - Create Provider"

$testProviderId = "test-hospital-$(Get-Random -Minimum 1000 -Maximum 9999)"
$providerData = @{
    providerId = $testProviderId
    name = "Test Hospital"
    type = "HOSPITAL"
    baseUrl = "http://test-hospital.local"
    endpoints = @{
        patientRequest = "/api/patient/request"
    }
    callback = @{
        patientRequest = "http://test-hospital.local/callback/patient-request"
        patientResponse = "http://test-hospital.local/callback/patient-response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $providerData
Assert-StatusCode -TestName "Create provider returns 201" -Response $response -Expected 201

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Created provider" -Object $response.Data -Property "providerId" -Expected $testProviderId
    Assert-PropertyEquals -TestName "Created provider" -Object $response.Data -Property "name" -Expected "Test Hospital"
    Assert-PropertyEquals -TestName "Created provider" -Object $response.Data -Property "type" -Expected "HOSPITAL"
    Assert-PropertyExists -TestName "Created provider" -Object $response.Data -Property "createdAt"
    Assert-PropertyExists -TestName "Created provider" -Object $response.Data -Property "updatedAt"
}

# Store for later tests
$script:CreatedProviderId = $testProviderId

# ============================================================
# TEST: Create Provider - Missing Required Fields
# ============================================================
Write-TestSection "POST /v1/provider - Validation Errors"

# Missing providerId
$invalidProvider1 = @{
    name = "Test Provider"
    baseUrl = "http://test.local"
    callback = @{ patientResponse = "http://test.local/callback" }
}
$response = Test-ApiPost -Endpoint "/v1/provider" -Body $invalidProvider1
Assert-StatusCode -TestName "Missing providerId returns 400" -Response $response -Expected 400

# Missing name
$invalidProvider2 = @{
    providerId = "test-invalid"
    baseUrl = "http://test.local"
    callback = @{ patientResponse = "http://test.local/callback" }
}
$response = Test-ApiPost -Endpoint "/v1/provider" -Body $invalidProvider2
Assert-StatusCode -TestName "Missing name returns 400" -Response $response -Expected 400

# Missing baseUrl
$invalidProvider3 = @{
    providerId = "test-invalid"
    name = "Test Provider"
    callback = @{ patientResponse = "http://test.local/callback" }
}
$response = Test-ApiPost -Endpoint "/v1/provider" -Body $invalidProvider3
Assert-StatusCode -TestName "Missing baseUrl returns 400" -Response $response -Expected 400

# Missing callback.patientResponse
$invalidProvider4 = @{
    providerId = "test-invalid"
    name = "Test Provider"
    baseUrl = "http://test.local"
    callback = @{}
}
$response = Test-ApiPost -Endpoint "/v1/provider" -Body $invalidProvider4
Assert-StatusCode -TestName "Missing callback.patientResponse returns 400" -Response $response -Expected 400

# ============================================================
# TEST: Create Provider - Default Type
# ============================================================
Write-TestSection "POST /v1/provider - Default Values"

$providerNoType = @{
    providerId = "test-default-type-$(Get-Random -Minimum 1000 -Maximum 9999)"
    name = "Provider Without Type"
    baseUrl = "http://test.local"
    callback = @{
        patientResponse = "http://test.local/callback"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $providerNoType
if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Default type" -Object $response.Data -Property "type" -Expected "OTHER"
}

# ============================================================
# TEST: Create Multiple Providers (Different Types)
# ============================================================
Write-TestSection "POST /v1/provider - Multiple Provider Types"

$providerTypes = @("CLINIC", "LAB", "PHARMACY")

foreach ($type in $providerTypes) {
    $provider = @{
        providerId = "test-$($type.ToLower())-$(Get-Random -Minimum 1000 -Maximum 9999)"
        name = "Test $type"
        type = $type
        baseUrl = "http://test-$($type.ToLower()).local"
        callback = @{
            patientResponse = "http://test-$($type.ToLower()).local/callback"
        }
    }
    
    $response = Test-ApiPost -Endpoint "/v1/provider" -Body $provider
    Assert-StatusCode -TestName "Create $type provider" -Response $response -Expected 201
}

# ============================================================
# TEST: Get Providers After Creation
# ============================================================
Write-TestSection "GET /v1/provider - After Creation"

$response = Test-ApiGet -Endpoint "/v1/provider"
Assert-StatusCode -TestName "Get providers after creation returns 200" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-ArrayLength -TestName "Providers list has items" -Array $response.Data -MinLength 1
    Write-Info "Total providers: $($response.Data.Count)"
}

# ============================================================
# TEST: Invalid JSON Body
# ============================================================
Write-TestSection "POST /v1/provider - Invalid JSON"

try {
    $params = @{
        Method = "POST"
        Uri = "$script:BaseUrl/v1/provider"
        Headers = @{ "Content-Type" = "application/json" }
        Body = "{ invalid json }"
        ErrorAction = "Stop"
    }
    $result = Invoke-WebRequest @params
    Write-Fail "Invalid JSON should return error"
} catch {
    $statusCode = 0
    # Handle PowerShell Core and Windows PowerShell
    if ($_.Exception -is [Microsoft.PowerShell.Commands.HttpResponseException]) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    } elseif ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    if ($statusCode -eq 400) {
        Write-Pass "Invalid JSON returns 400"
    } else {
        Write-Fail "Invalid JSON" "Expected 400, got $statusCode"
    }
}

# ============================================================
# SUMMARY
# ============================================================
Write-TestSummary

# Return exit code based on failures
if ($script:FailCount -gt 0) {
    exit 1
}
exit 0