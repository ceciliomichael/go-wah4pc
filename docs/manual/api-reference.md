# WAH4PC API Reference

Base URL: `http://localhost:3043`

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/provider` | List all registered providers |
| POST | `/v1/provider` | Register a new provider |
| POST | `/v1/fhir/patient/request` | Create a patient data request |
| GET | `/v1/fhir/patient/request` | Get pending requests for a target provider |
| POST | `/v1/fhir/patient/respond` | Submit patient data response |
| GET | `/v1/fhir/patient/response` | Poll for response by requestId |

---

## Provider Management

### List Providers



**Response (200 OK):**



---

### Register Provider



**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerId` | string | Yes | Unique identifier for the provider |
| `name` | string | Yes | Display name of the organization |
| `type` | string | Yes | HOSPITAL, CLINIC, LAB, PHARMACY, OTHER |
| `baseUrl` | string | Yes | Base URL of the provider's API |
| `callback.patientRequest` | string | No | URL to receive incoming patient data requests (for targets) |
| `callback.patientResponse` | string | No | URL to receive patient data responses (for requestors) |

**Example Request:**



**Response (201 Created):**



---

## Patient Data Exchange

### Create Patient Request



Create a patient data request. WAH4PC will push this request to the target provider's callback URL.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestorProviderId` | string | Yes | ID of the requesting provider |
| `targetProviderId` | string | Yes | ID of the target provider |
| `patientReference` | object | Yes | Patient identifiers to look up |
| `correlationKey` | string | No | Optional reference number for tracking |
| `metadata` | object | No | Additional context (reason, notes) |

**Example Request:**



**Response (201 Created):**



**Note:** After creating the request, WAH4PC automatically pushes it to the target's `callback.patientRequest` URL.

---

### Get Pending Requests



Get all pending requests for a target provider. Use this as a polling alternative if callbacks are not configured.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetProviderId` | string | Yes | ID of the target provider to get pending requests for |

**Example Request:**



**Response (200 OK):**



---

### Submit Patient Response



Submit a patient data response. The target provider uses this to send FHIR Patient data back to WAH4PC.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestId` | string | Yes | The request ID to respond to |
| `fromProviderId` | string | Yes | Must match the original targetProviderId |
| `status` | string | Yes | COMPLETED or FAILED |
| `fhirPatient` | object | Conditional | FHIR Patient resource (required if COMPLETED) |
| `error` | string | Conditional | Error message (required if FAILED) |

**Example Request (Success):**



**Example Request (Failure):**



**Response (200 OK):**



**Note:** After receiving a COMPLETED response, WAH4PC automatically pushes the FHIR Patient data to the requestor's `callback.patientResponse` URL.

---

### Poll for Response



Poll for a response by requestId. Use this as a fallback if callbacks are not configured or fail.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requestId` | string | Yes | The request ID to check status for |

**Example Request:**



**Response (200 OK) - Pending:**



**Response (200 OK) - Completed:**



---

## Callback Payloads

WAH4PC pushes data to provider callback URLs. Your system must implement these endpoints to receive pushed notifications.

### Callback: Patient Request

**Payload pushed to target providers when a new patient data request is created.**



**Payload:**



**Expected Response:** Return `200 OK` to acknowledge receipt. Response body is ignored.

---

### Callback: Patient Response

**Payload pushed to requestor providers when a patient data response is received.**



**Payload (Success):**



**Payload (Failure):**



**Expected Response:** Return `200 OK` to acknowledge receipt. Response body is ignored.

---

## Error Responses

All error responses follow a consistent format.

| Status Code | Description | Example Error |
|-------------|-------------|----------------|
| 400 | Bad Request - Invalid input | requestorProviderId and targetProviderId are required |
| 400 | Bad Request - Provider not found | requestor provider not found |
| 400 | Bad Request - Invalid response | fromProviderId does not match target provider |
| 404 | Not Found | request not found |
| 409 | Conflict - Duplicate | provider already exists |
| 500 | Internal Server Error | internal server error |

**Error Response Format:**

