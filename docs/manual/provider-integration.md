# Provider Integration Guide

Learn how to integrate your hospital, clinic, or lab system with WAH4PC as either a requestor, target, or both.

---

## Integration Overview

WAH4PC supports two provider roles. Your system can act as one or both:

### Requestor Role

Your system requests patient data from other providers. You need to:
- Register with `callback.patientResponse`
- Call `POST /v1/fhir/patient/request`
- Implement callback endpoint to receive responses

### Target Role

Your system receives requests and provides patient data. You need to:
- Register with `callback.patientRequest`
- Implement callback endpoint to receive requests
- Call `POST /v1/fhir/patient/respond`

---

## Step 1: Register Your System

Before exchanging data, register your system with WAH4PC. Configure callback URLs based on your role.

### Registration as Requestor (e.g., Hospital)



### Registration as Target (e.g., Clinic)



### Registration as Both Roles



### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerId` | string | Yes | Unique identifier for your system (you define this) |
| `type` | string | Yes | HOSPITAL, CLINIC, LAB, PHARMACY, or OTHER |
| `callback.patientRequest` | string | No | URL where WAH4PC pushes incoming requests (for targets) |
| `callback.patientResponse` | string | No | URL where WAH4PC pushes responses (for requestors) |

---

## Step 2: Implement Callback Endpoints

Your system must expose HTTP endpoints to receive pushed data from WAH4PC.

### For Requestors: Receive Patient Response

When another provider responds to your request, WAH4PC POSTs to your `callback.patientResponse` URL:



**Your Response:** Return `200 OK` to acknowledge receipt.

### For Targets: Receive Patient Request

When another provider requests patient data from you, WAH4PC POSTs to your `callback.patientRequest` URL:



**Your Response:** Return `200 OK` to acknowledge receipt. Then process the request and submit the response.

---

## Step 3: Handle the Data Flow

### As a Requestor

1. Call `POST /v1/fhir/patient/request` with patient identifiers
2. Store the returned `requestId` for tracking
3. Wait for WAH4PC to push the response to your callback URL
4. Process the FHIR Patient data when received
5. (Optional) Poll `GET /v1/fhir/patient/response?requestId=...` as fallback

### As a Target

1. Receive the request via your callback endpoint (or poll for pending requests)
2. Look up the patient using the provided identifiers
3. Prepare the FHIR Patient resource
4. Call `POST /v1/fhir/patient/respond` with the data
5. WAH4PC automatically pushes the response to the requestor

---

## Polling as Fallback

If callbacks are not configured or fail, both requestors and targets can poll for data.

### Targets: Poll for Pending Requests



Returns all PENDING requests where your system is the target.

### Requestors: Poll for Response



Returns the current status and FHIR data if available.

---

## Example: Node.js Callback Server

A simple Express.js server that handles both callback types:



---

## Integration Checklist

### General

- [ ] Register your system via `POST /v1/provider`
- [ ] Ensure callback URLs are publicly accessible (or use tunneling for dev)

### As Requestor

- [ ] Configure `callback.patientResponse` URL
- [ ] Implement endpoint to receive COMPLETED/FAILED responses
- [ ] Store `requestId` when creating requests
- [ ] Handle both success and error responses

### As Target

- [ ] Configure `callback.patientRequest` URL
- [ ] Implement endpoint to receive incoming requests
- [ ] Look up patients using provided identifiers
- [ ] Submit FHIR Patient data via `POST /v1/fhir/patient/respond`
- [ ] Handle cases where patient is not found (submit FAILED status)

---

## Next Steps

- Read [API Reference](./api-reference.md) for complete endpoint documentation
- Read [FHIR Patient Format](./fhir-patient-format.md) for PH Core Patient resource specification