# Patient Request API Tests
# Tests for /v1/fhir/patient/* endpoints

param(
    [string]$BaseUrl = "http://localhost:3050"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptPath\..\utils\test-helpers.ps1"

$script:BaseUrl = $BaseUrl

Write-TestHeader "PATIENT REQUEST API TESTS"

# Check server health
if (-not (Test-ServerHealth)) {
    exit 1
}

Reset-TestCounters

# ============================================================
# SETUP: Create Test Providers
# ============================================================
Write-TestSection "SETUP - Creating Test Providers"

$requestorId = "test-requestor-$(Get-Random -Minimum 1000 -Maximum 9999)"
$targetId = "test-target-$(Get-Random -Minimum 1000 -Maximum 9999)"

# Create requestor provider
$requestorProvider = @{
    providerId = $requestorId
    name = "Test Requestor Hospital"
    type = "HOSPITAL"
    baseUrl = "http://requestor.local"
    callback = @{
        patientRequest = "http://requestor.local/callback/request"
        patientResponse = "http://requestor.local/callback/response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $requestorProvider
if ($response.StatusCode -eq 201) {
    Write-Info "Created requestor provider: $requestorId"
} else {
    Write-Fail "Setup" "Failed to create requestor provider"
    exit 1
}

# Create target provider
$targetProvider = @{
    providerId = $targetId
    name = "Test Target Clinic"
    type = "CLINIC"
    baseUrl = "http://target.local"
    callback = @{
        patientRequest = "http://target.local/callback/request"
        patientResponse = "http://target.local/callback/response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $targetProvider
if ($response.StatusCode -eq 201) {
    Write-Info "Created target provider: $targetId"
} else {
    Write-Fail "Setup" "Failed to create target provider"
    exit 1
}

# ============================================================
# TEST: Create Patient Request - Success
# ============================================================
Write-TestSection "POST /v1/fhir/patient/request - Create Request"

$patientRequest = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{
        id = "patient-12345"
        identifiers = @(
            @{
                system = "urn:oid:2.16.840.1.113883.4.1"
                value = "123-45-6789"
            }
        )
    }
    metadata = @{
        reason = "Patient transfer"
        notes = "Urgent request for patient records"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $patientRequest
Assert-StatusCode -TestName "Create request returns 201" -Response $response -Expected 201

$createdRequestId = $null
if ($response.Success -and $response.Data) {
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "requestId"
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "status" -Expected "PENDING"
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "requestorProviderId" -Expected $requestorId
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "targetProviderId" -Expected $targetId
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "createdAt"
    
    $createdRequestId = $response.Data.requestId
    Write-Info "Created request ID: $createdRequestId"
}

# ============================================================
# TEST: Create Request with Correlation Key
# ============================================================
Write-TestSection "POST /v1/fhir/patient/request - With Correlation Key"

$requestWithCorrelation = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    correlationKey = "CORR-$(Get-Random -Minimum 10000 -Maximum 99999)"
    patientReference = @{
        id = "patient-67890"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $requestWithCorrelation
Assert-StatusCode -TestName "Create request with correlation key returns 201" -Response $response -Expected 201

# ============================================================
# TEST: Create Request with FHIR Constraints
# ============================================================
Write-TestSection "POST /v1/fhir/patient/request - With FHIR Constraints"

$requestWithConstraints = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{
        id = "patient-constraints"
    }
    fhirConstraints = @{
        resourceType = "Patient"
        version = "4.0.1"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $requestWithConstraints
Assert-StatusCode -TestName "Create request with FHIR constraints returns 201" -Response $response -Expected 201

# ============================================================
# TEST: Create Request - Validation Errors
# ============================================================
Write-TestSection "POST /v1/fhir/patient/request - Validation Errors"

# Missing requestorProviderId
$invalidRequest1 = @{
    targetProviderId = $targetId
    patientReference = @{ id = "patient-123" }
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $invalidRequest1
Assert-StatusCode -TestName "Missing requestorProviderId returns 400" -Response $response -Expected 400

# Missing targetProviderId
$invalidRequest2 = @{
    requestorProviderId = $requestorId
    patientReference = @{ id = "patient-123" }
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $invalidRequest2
Assert-StatusCode -TestName "Missing targetProviderId returns 400" -Response $response -Expected 400

# Non-existent requestor provider
$invalidRequest3 = @{
    requestorProviderId = "non-existent-provider"
    targetProviderId = $targetId
    patientReference = @{ id = "patient-123" }
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $invalidRequest3
Assert-StatusCode -TestName "Non-existent requestor returns 400" -Response $response -Expected 400

# Non-existent target provider
$invalidRequest4 = @{
    requestorProviderId = $requestorId
    targetProviderId = "non-existent-provider"
    patientReference = @{ id = "patient-123" }
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $invalidRequest4
Assert-StatusCode -TestName "Non-existent target returns 400" -Response $response -Expected 400

# ============================================================
# TEST: Get Pending Requests
# ============================================================
Write-TestSection "GET /v1/fhir/patient/request - Pending Requests"

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=$targetId"
Assert-StatusCode -TestName "Get pending requests returns 200" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "targetProviderId" -Expected $targetId
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "pendingRequests"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "count"
    
    $pendingCount = $response.Data.count
    Write-Info "Pending requests for target: $pendingCount"
    
    if ($pendingCount -gt 0) {
        Write-Pass "Pending requests array has items"
    }
}

# ============================================================
# TEST: Get Pending Requests - Validation Errors
# ============================================================
Write-TestSection "GET /v1/fhir/patient/request - Validation Errors"

# Missing targetProviderId
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request"
Assert-StatusCode -TestName "Missing targetProviderId returns 400" -Response $response -Expected 400

# Non-existent target provider
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=non-existent"
Assert-StatusCode -TestName "Non-existent target returns 404" -Response $response -Expected 404

# ============================================================
# TEST: Get Response for Pending Request
# ============================================================
Write-TestSection "GET /v1/fhir/patient/response - Pending Request"

if ($createdRequestId) {
    $response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$createdRequestId"
    Assert-StatusCode -TestName "Get response for pending request returns 200" -Response $response -Expected 200
    
    if ($response.Success -and $response.Data) {
        Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "requestId" -Expected $createdRequestId
        Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "status" -Expected "PENDING"
    }
}

# ============================================================
# TEST: Get Response - Validation Errors
# ============================================================
Write-TestSection "GET /v1/fhir/patient/response - Validation Errors"

# Missing requestId
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response"
Assert-StatusCode -TestName "Missing requestId returns 400" -Response $response -Expected 400

# Non-existent request
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=REQ-NONEXISTENT"
Assert-StatusCode -TestName "Non-existent request returns 404" -Response $response -Expected 404

# ============================================================
# SUMMARY
# ============================================================
Write-TestSummary

if ($script:FailCount -gt 0) {
    exit 1
}
exit 0