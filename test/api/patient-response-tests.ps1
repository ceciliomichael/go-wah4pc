# Patient Response API Tests
# Tests for /v1/fhir/patient/respond endpoint

param(
    [string]$BaseUrl = "http://localhost:3050"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptPath\..\utils\test-helpers.ps1"

$script:BaseUrl = $BaseUrl

Write-TestHeader "PATIENT RESPONSE API TESTS"

# Check server health
if (-not (Test-ServerHealth)) {
    exit 1
}

Reset-TestCounters

# ============================================================
# SETUP: Create Test Providers and Request
# ============================================================
Write-TestSection "SETUP - Creating Test Providers and Request"

$requestorId = "test-resp-requestor-$(Get-Random -Minimum 1000 -Maximum 9999)"
$targetId = "test-resp-target-$(Get-Random -Minimum 1000 -Maximum 9999)"

# Create requestor provider
$requestorProvider = @{
    providerId = $requestorId
    name = "Response Test Requestor"
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
    name = "Response Test Target"
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

# Create a patient request
$patientRequest = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{
        id = "patient-resp-test"
        identifiers = @(
            @{
                system = "urn:oid:2.16.840.1.113883.4.1"
                value = "999-88-7777"
            }
        )
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $patientRequest
$createdRequestId = $null
if ($response.StatusCode -eq 201 -and $response.Data) {
    $createdRequestId = $response.Data.requestId
    Write-Info "Created request ID: $createdRequestId"
} else {
    Write-Fail "Setup" "Failed to create patient request"
    exit 1
}

# ============================================================
# TEST: Submit Response - Success (COMPLETED)
# ============================================================
Write-TestSection "POST /v1/fhir/patient/respond - Submit Completed Response"

$patientResponse = @{
    requestId = $createdRequestId
    fromProviderId = $targetId
    status = "COMPLETED"
    fhirPatient = @{
        resourceType = "Patient"
        id = "fhir-patient-001"
        meta = @{
            versionId = "1"
            lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
        name = @(
            @{
                use = "official"
                family = "Smith"
                given = @("John", "Robert")
            }
        )
        gender = "male"
        birthDate = "1985-03-15"
        address = @(
            @{
                use = "home"
                line = @("123 Main Street")
                city = "Springfield"
                state = "IL"
                postalCode = "62701"
                country = "USA"
            }
        )
        telecom = @(
            @{
                system = "phone"
                value = "555-123-4567"
                use = "home"
            }
            @{
                system = "email"
                value = "john.smith@email.com"
            }
        )
        identifier = @(
            @{
                system = "urn:oid:2.16.840.1.113883.4.1"
                value = "999-88-7777"
            }
        )
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $patientResponse
Assert-StatusCode -TestName "Submit completed response returns 200" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "requestId" -Expected $createdRequestId
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "status" -Expected "COMPLETED"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "receivedAt"
}

# ============================================================
# TEST: Verify Response Status After Submission
# ============================================================
Write-TestSection "GET /v1/fhir/patient/response - After Response Submission"

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$createdRequestId"
Assert-StatusCode -TestName "Get response after submission returns 200" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "status" -Expected "COMPLETED"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "fhirPatient"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "completedAt"
    
    if ($response.Data.fhirPatient) {
        Write-Pass "FHIR Patient data is present in response"
    }
}

# ============================================================
# TEST: Submit Response - Failed Status
# ============================================================
Write-TestSection "POST /v1/fhir/patient/respond - Submit Failed Response"

# Create another request for failed response test
$failedRequest = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{ id = "patient-fail-test" }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $failedRequest
$failedRequestId = $null
if ($response.StatusCode -eq 201 -and $response.Data) {
    $failedRequestId = $response.Data.requestId
    Write-Info "Created request for failed test: $failedRequestId"
}

if ($failedRequestId) {
    $failedResponse = @{
        requestId = $failedRequestId
        fromProviderId = $targetId
        status = "FAILED"
        error = "Patient not found in system"
    }
    
    $response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $failedResponse
    Assert-StatusCode -TestName "Submit failed response returns 200" -Response $response -Expected 200
    
    if ($response.Success -and $response.Data) {
        Assert-PropertyEquals -TestName "Response" -Object $response.Data -Property "status" -Expected "FAILED"
    }
    
    # Verify the failed response
    $response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$failedRequestId"
    if ($response.Success -and $response.Data) {
        Assert-PropertyEquals -TestName "Get failed response" -Object $response.Data -Property "status" -Expected "FAILED"
        
        if ($response.Data.error) {
            Write-Pass "Error message is present in failed response"
        }
    }
}

# ============================================================
# TEST: Submit Response - Validation Errors
# ============================================================
Write-TestSection "POST /v1/fhir/patient/respond - Validation Errors"

# Missing requestId
$invalidResponse1 = @{
    fromProviderId = $targetId
    status = "COMPLETED"
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $invalidResponse1
Assert-StatusCode -TestName "Missing requestId returns 400" -Response $response -Expected 400

# Missing fromProviderId
$invalidResponse2 = @{
    requestId = "REQ-12345"
    status = "COMPLETED"
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $invalidResponse2
Assert-StatusCode -TestName "Missing fromProviderId returns 400" -Response $response -Expected 400

# Non-existent request
$invalidResponse3 = @{
    requestId = "REQ-NONEXISTENT-99999"
    fromProviderId = $targetId
    status = "COMPLETED"
}
$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $invalidResponse3
Assert-StatusCode -TestName "Non-existent request returns 404" -Response $response -Expected 404

# ============================================================
# TEST: Submit Response - Wrong Provider
# ============================================================
Write-TestSection "POST /v1/fhir/patient/respond - Provider Mismatch"

# Create a new request for this test
$mismatchRequest = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{ id = "patient-mismatch-test" }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $mismatchRequest
$mismatchRequestId = $null
if ($response.StatusCode -eq 201 -and $response.Data) {
    $mismatchRequestId = $response.Data.requestId
}

if ($mismatchRequestId) {
    # Try to respond with wrong provider (requestor instead of target)
    $wrongProviderResponse = @{
        requestId = $mismatchRequestId
        fromProviderId = $requestorId  # Wrong! Should be targetId
        status = "COMPLETED"
        fhirPatient = @{ resourceType = "Patient"; id = "test" }
    }
    
    $response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $wrongProviderResponse
    Assert-StatusCode -TestName "Wrong fromProviderId returns 400" -Response $response -Expected 400
}

# ============================================================
# TEST: Submit Response - Default Status
# ============================================================
Write-TestSection "POST /v1/fhir/patient/respond - Default Status"

# Create a new request
$defaultStatusRequest = @{
    requestorProviderId = $requestorId
    targetProviderId = $targetId
    patientReference = @{ id = "patient-default-status" }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $defaultStatusRequest
$defaultStatusRequestId = $null
if ($response.StatusCode -eq 201 -and $response.Data) {
    $defaultStatusRequestId = $response.Data.requestId
}

if ($defaultStatusRequestId) {
    # Submit response without explicit status (should default to COMPLETED)
    $noStatusResponse = @{
        requestId = $defaultStatusRequestId
        fromProviderId = $targetId
        fhirPatient = @{ resourceType = "Patient"; id = "default-patient" }
    }
    
    $response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $noStatusResponse
    Assert-StatusCode -TestName "Response without status returns 200" -Response $response -Expected 200
    
    if ($response.Success -and $response.Data) {
        Assert-PropertyEquals -TestName "Default status" -Object $response.Data -Property "status" -Expected "COMPLETED"
    }
}

# ============================================================
# SUMMARY
# ============================================================
Write-TestSummary

if ($script:FailCount -gt 0) {
    exit 1
}
exit 0