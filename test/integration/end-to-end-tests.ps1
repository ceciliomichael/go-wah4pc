# End-to-End Integration Tests
# Complete workflow tests for the WAH4PC API Gateway

param(
    [string]$BaseUrl = "http://localhost:3050"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptPath\..\utils\test-helpers.ps1"

$script:BaseUrl = $BaseUrl

Write-TestHeader "END-TO-END INTEGRATION TESTS"

# Check server health
if (-not (Test-ServerHealth)) {
    exit 1
}

Reset-TestCounters

# ============================================================
# SCENARIO 1: Complete Patient Data Request Flow
# Hospital A requests patient data from Clinic B
# ============================================================
Write-TestSection "SCENARIO 1: Complete Patient Data Request Flow"

Write-Info "Setting up Hospital A and Clinic B..."

# Create Hospital A (requestor)
$hospitalA = @{
    providerId = "hospital-a-$(Get-Random -Minimum 1000 -Maximum 9999)"
    name = "Metro General Hospital"
    type = "HOSPITAL"
    baseUrl = "http://hospital-a.local"
    callback = @{
        patientRequest = "http://hospital-a.local/webhook/request"
        patientResponse = "http://hospital-a.local/webhook/response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $hospitalA
Assert-StatusCode -TestName "Create Hospital A" -Response $response -Expected 201
$hospitalAId = $hospitalA.providerId

# Create Clinic B (target)
$clinicB = @{
    providerId = "clinic-b-$(Get-Random -Minimum 1000 -Maximum 9999)"
    name = "Downtown Family Clinic"
    type = "CLINIC"
    baseUrl = "http://clinic-b.local"
    callback = @{
        patientRequest = "http://clinic-b.local/webhook/request"
        patientResponse = "http://clinic-b.local/webhook/response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $clinicB
Assert-StatusCode -TestName "Create Clinic B" -Response $response -Expected 201
$clinicBId = $clinicB.providerId

# Step 1: Hospital A creates a patient data request
Write-Info "Step 1: Hospital A requests patient data from Clinic B..."

$patientRequest = @{
    requestorProviderId = $hospitalAId
    targetProviderId = $clinicBId
    correlationKey = "TRANSFER-$(Get-Random -Minimum 10000 -Maximum 99999)"
    patientReference = @{
        id = "patient-jane-doe"
        identifiers = @(
            @{
                system = "urn:oid:2.16.840.1.113883.4.1"
                value = "555-12-3456"
            }
            @{
                system = "http://hospital-a.local/mrn"
                value = "MRN-2024-001"
            }
        )
    }
    fhirConstraints = @{
        resourceType = "Patient"
        version = "4.0.1"
    }
    metadata = @{
        reason = "Patient transfer - emergency admission"
        notes = "Patient referred from Downtown Family Clinic"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $patientRequest
Assert-StatusCode -TestName "Hospital A creates request" -Response $response -Expected 201

$requestId = $null
if ($response.Success -and $response.Data) {
    $requestId = $response.Data.requestId
    Assert-PropertyEquals -TestName "Request status" -Object $response.Data -Property "status" -Expected "PENDING"
    Write-Info "Request ID: $requestId"
}

# Step 2: Clinic B polls for pending requests
Write-Info "Step 2: Clinic B polls for pending requests..."

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=$clinicBId"
Assert-StatusCode -TestName "Clinic B polls pending requests" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    $pendingCount = $response.Data.count
    Write-Info "Clinic B has $pendingCount pending request(s)"
    
    if ($pendingCount -gt 0) {
        Write-Pass "Clinic B received the pending request"
        
        # Verify the request details
        $pendingRequest = $response.Data.pendingRequests | Where-Object { $_.requestId -eq $requestId }
        if ($pendingRequest) {
            Assert-PropertyEquals -TestName "Pending request" -Object $pendingRequest -Property "requestorProviderId" -Expected $hospitalAId
        }
    }
}

# Step 3: Hospital A checks request status (should be PENDING)
Write-Info "Step 3: Hospital A checks request status..."

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$requestId"
Assert-StatusCode -TestName "Hospital A checks status" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Status is PENDING" -Object $response.Data -Property "status" -Expected "PENDING"
}

# Step 4: Clinic B responds with patient data
Write-Info "Step 4: Clinic B responds with FHIR Patient data..."

$fhirPatientData = @{
    resourceType = "Patient"
    id = "patient-jane-doe-fhir"
    meta = @{
        versionId = "1"
        lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        profile = @("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
    }
    identifier = @(
        @{
            system = "urn:oid:2.16.840.1.113883.4.1"
            value = "555-12-3456"
        }
        @{
            system = "http://clinic-b.local/mrn"
            value = "CB-MRN-5678"
        }
    )
    active = $true
    name = @(
        @{
            use = "official"
            family = "Doe"
            given = @("Jane", "Marie")
        }
    )
    telecom = @(
        @{
            system = "phone"
            value = "555-867-5309"
            use = "home"
        }
        @{
            system = "email"
            value = "jane.doe@email.com"
        }
    )
    gender = "female"
    birthDate = "1990-06-15"
    address = @(
        @{
            use = "home"
            type = "physical"
            line = @("456 Oak Avenue", "Apt 2B")
            city = "Springfield"
            state = "IL"
            postalCode = "62702"
            country = "USA"
        }
    )
    maritalStatus = @{
        coding = @(
            @{
                system = "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus"
                code = "M"
                display = "Married"
            }
        )
    }
    contact = @(
        @{
            relationship = @(
                @{
                    coding = @(
                        @{
                            system = "http://terminology.hl7.org/CodeSystem/v2-0131"
                            code = "C"
                            display = "Emergency Contact"
                        }
                    )
                }
            )
            name = @{
                family = "Doe"
                given = @("John")
            }
            telecom = @(
                @{
                    system = "phone"
                    value = "555-123-4567"
                }
            )
        }
    )
}

$patientResponse = @{
    requestId = $requestId
    fromProviderId = $clinicBId
    status = "COMPLETED"
    fhirPatient = $fhirPatientData
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $patientResponse
Assert-StatusCode -TestName "Clinic B submits response" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Response status" -Object $response.Data -Property "status" -Expected "COMPLETED"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "receivedAt"
}

# Step 5: Hospital A retrieves the completed response
Write-Info "Step 5: Hospital A retrieves the patient data..."

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$requestId"
Assert-StatusCode -TestName "Hospital A gets response" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Final status" -Object $response.Data -Property "status" -Expected "COMPLETED"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "fhirPatient"
    Assert-PropertyExists -TestName "Response" -Object $response.Data -Property "completedAt"
    
    if ($response.Data.fhirPatient) {
        Write-Pass "FHIR Patient data successfully received"
        Write-Info "Patient: $($response.Data.fhirPatient.name[0].given -join ' ') $($response.Data.fhirPatient.name[0].family)"
    }
}

# Step 6: Verify request is no longer in pending queue
Write-Info "Step 6: Verify request removed from pending queue..."

$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=$clinicBId"
if ($response.Success -and $response.Data) {
    $stillPending = $response.Data.pendingRequests | Where-Object { $_.requestId -eq $requestId }
    if (-not $stillPending) {
        Write-Pass "Completed request removed from pending queue"
    } else {
        Write-Fail "Request still in pending queue" "Request should be removed after completion"
    }
}

# ============================================================
# SCENARIO 2: Failed Request Flow
# Lab requests data but target cannot find patient
# ============================================================
Write-TestSection "SCENARIO 2: Failed Request Flow"

Write-Info "Setting up Lab C..."

# Create Lab C
$labC = @{
    providerId = "lab-c-$(Get-Random -Minimum 1000 -Maximum 9999)"
    name = "Central Diagnostics Lab"
    type = "LAB"
    baseUrl = "http://lab-c.local"
    callback = @{
        patientRequest = "http://lab-c.local/webhook/request"
        patientResponse = "http://lab-c.local/webhook/response"
    }
}

$response = Test-ApiPost -Endpoint "/v1/provider" -Body $labC
Assert-StatusCode -TestName "Create Lab C" -Response $response -Expected 201
$labCId = $labC.providerId

# Lab C requests patient from Hospital A
$labRequest = @{
    requestorProviderId = $labCId
    targetProviderId = $hospitalAId
    patientReference = @{
        id = "unknown-patient-xyz"
        identifiers = @(
            @{
                system = "http://lab-c.local/specimen"
                value = "SPEC-2024-999"
            }
        )
    }
    metadata = @{
        reason = "Lab results delivery"
        notes = "Need patient demographics for specimen SPEC-2024-999"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $labRequest
Assert-StatusCode -TestName "Lab C creates request" -Response $response -Expected 201

$failedRequestId = $null
if ($response.Success -and $response.Data) {
    $failedRequestId = $response.Data.requestId
    Write-Info "Failed scenario Request ID: $failedRequestId"
}

# Hospital A responds with FAILED status
$failedResponse = @{
    requestId = $failedRequestId
    fromProviderId = $hospitalAId
    status = "FAILED"
    error = "Patient not found. No matching records for identifier SPEC-2024-999"
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $failedResponse
Assert-StatusCode -TestName "Hospital A sends FAILED response" -Response $response -Expected 200

# Verify Lab C can see the error
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$failedRequestId"
Assert-StatusCode -TestName "Lab C gets failed response" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    Assert-PropertyEquals -TestName "Status is FAILED" -Object $response.Data -Property "status" -Expected "FAILED"
    
    if ($response.Data.error) {
        Write-Pass "Error message received: '$($response.Data.error)'"
    }
}

# ============================================================
# SCENARIO 3: Multiple Concurrent Requests
# ============================================================
Write-TestSection "SCENARIO 3: Multiple Concurrent Requests"

Write-Info "Creating multiple simultaneous requests..."

$requestIds = @()

# Create 5 requests from different "patients"
for ($i = 1; $i -le 5; $i++) {
    $multiRequest = @{
        requestorProviderId = $hospitalAId
        targetProviderId = $clinicBId
        correlationKey = "BATCH-$(Get-Random -Minimum 10000 -Maximum 99999)"
        patientReference = @{
            id = "batch-patient-$i"
        }
        metadata = @{
            reason = "Batch request $i"
        }
    }
    
    $response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $multiRequest
    if ($response.StatusCode -eq 201 -and $response.Data) {
        $requestIds += $response.Data.requestId
    }
}

Write-Info "Created $($requestIds.Count) requests"
Assert-ArrayLength -TestName "Batch requests created" -Array $requestIds -MinLength 5 -MaxLength 5

# Verify all requests appear in pending queue
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=$clinicBId"
if ($response.Success -and $response.Data) {
    $pendingForBatch = $response.Data.pendingRequests | Where-Object { $_.requestId -in $requestIds }
    Assert-ArrayLength -TestName "All batch requests pending" -Array $pendingForBatch -MinLength 5
}

# Respond to all requests
foreach ($reqId in $requestIds) {
    $batchResponse = @{
        requestId = $reqId
        fromProviderId = $clinicBId
        status = "COMPLETED"
        fhirPatient = @{
            resourceType = "Patient"
            id = "batch-response-$reqId"
        }
    }
    
    $response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $batchResponse
}

Write-Pass "All $($requestIds.Count) batch requests responded"

# Verify all are completed
$allCompleted = $true
foreach ($reqId in $requestIds) {
    $response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$reqId"
    if (-not ($response.Success -and $response.Data.status -eq "COMPLETED")) {
        $allCompleted = $false
        break
    }
}

if ($allCompleted) {
    Write-Pass "All batch requests completed successfully"
} else {
    Write-Fail "Batch completion" "Not all requests were completed"
}

# ============================================================
# SCENARIO 4: Cross-Provider Network
# Multiple providers requesting from each other
# ============================================================
Write-TestSection "SCENARIO 4: Cross-Provider Network"

Write-Info "Testing bidirectional data exchange..."

# Clinic B requests data from Hospital A (reverse direction)
$reverseRequest = @{
    requestorProviderId = $clinicBId
    targetProviderId = $hospitalAId
    patientReference = @{
        id = "referred-patient-001"
    }
    metadata = @{
        reason = "Follow-up care coordination"
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/request" -Body $reverseRequest
Assert-StatusCode -TestName "Clinic B requests from Hospital A" -Response $response -Expected 201

$reverseRequestId = $null
if ($response.Success -and $response.Data) {
    $reverseRequestId = $response.Data.requestId
}

# Hospital A checks its pending requests
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/request?targetProviderId=$hospitalAId"
Assert-StatusCode -TestName "Hospital A sees pending requests" -Response $response -Expected 200

if ($response.Success -and $response.Data) {
    $hasPending = $response.Data.pendingRequests | Where-Object { $_.requestId -eq $reverseRequestId }
    if ($hasPending) {
        Write-Pass "Hospital A received request from Clinic B"
    }
}

# Hospital A responds
$reverseResponse = @{
    requestId = $reverseRequestId
    fromProviderId = $hospitalAId
    status = "COMPLETED"
    fhirPatient = @{
        resourceType = "Patient"
        id = "hospital-a-patient-data"
        name = @(@{ family = "ReferredPatient"; given = @("Test") })
    }
}

$response = Test-ApiPost -Endpoint "/v1/fhir/patient/respond" -Body $reverseResponse
Assert-StatusCode -TestName "Hospital A responds to Clinic B" -Response $response -Expected 200

# Clinic B retrieves the response
$response = Test-ApiGet -Endpoint "/v1/fhir/patient/response?requestId=$reverseRequestId"
if ($response.Success -and $response.Data.status -eq "COMPLETED") {
    Write-Pass "Bidirectional exchange completed successfully"
}

# ============================================================
# SUMMARY
# ============================================================
Write-TestSummary

if ($script:FailCount -gt 0) {
    exit 1
}
exit 0