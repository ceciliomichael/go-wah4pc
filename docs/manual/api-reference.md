# WAH4PC API Reference

Base URL: `http://localhost:3043`

---

## Provider Management

### List Providers

```
GET /v1/provider
```

**Response:**

```json
[
  {
    "providerId": "HOSPITAL_001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "baseUrl": "https://city-hospital.example.com/api",
    "endpoints": { "patientRequest": "/wah4pc/patient/request" },
    "callback": { "patientResponse": "https://city-hospital.example.com/wah4pc/patient/receive" },
    "createdAt": "2025-12-05T05:00:00Z",
    "updatedAt": "2025-12-05T05:00:00Z"
  }
]
```

---

### Register Provider

```
POST /v1/provider
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerId` | string | Yes | Unique identifier for the provider |
| `name` | string | Yes | Display name |
| `type` | string | Yes | `HOSPITAL`, `CLINIC`, `LAB`, `PHARMACY`, `OTHER` |
| `baseUrl` | string | Yes | Base URL of the provider's API |
| `endpoints.patientRequest` | string | No | Endpoint where provider receives patient requests |
| `callback.patientResponse` | string | Yes | URL where WAH4PC pushes patient responses |

**Example:**

```json
{
  "providerId": "HOSPITAL_001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "https://city-hospital.example.com/api",
  "endpoints": {
    "patientRequest": "/wah4pc/patient/request"
  },
  "callback": {
    "patientResponse": "https://city-hospital.example.com/wah4pc/patient/receive"
  }
}
```

**Response (201 Created):**

```json
{
  "providerId": "HOSPITAL_001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "https://city-hospital.example.com/api",
  "endpoints": { "patientRequest": "/wah4pc/patient/request" },
  "callback": { "patientResponse": "https://city-hospital.example.com/wah4pc/patient/receive" },
  "createdAt": "2025-12-05T05:00:00Z",
  "updatedAt": "2025-12-05T05:00:00Z"
}
```

---

## Patient Data Exchange

### Create Patient Request

Hospital requests patient data from another provider (e.g., clinic).

```
POST /v1/fhir/patient/request
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestorProviderId` | string | Yes | Provider ID of the requestor |
| `targetProviderId` | string | Yes | Provider ID of the target (who has the data) |
| `correlationKey` | string | No | External reference ID for tracking |
| `patientReference.id` | string | No | Known patient ID |
| `patientReference.identifiers` | array | No | Patient identifiers (system + value) |
| `fhirConstraints.resourceType` | string | No | Default: `Patient` |
| `fhirConstraints.version` | string | No | Default: `4.0.1` |
| `metadata.reason` | string | No | Reason for request |
| `metadata.notes` | string | No | Additional notes |

**Example:**

```json
{
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "correlationKey": "REF-12345",
  "patientReference": {
    "identifiers": [
      { "system": "NATIONAL_ID", "value": "123456789" }
    ]
  },
  "metadata": {
    "reason": "OUTPATIENT_CONSULT",
    "notes": "Patient referred from clinic"
  }
}
```

**Response (201 Created):**

```json
{
  "requestId": "REQ-20251205-0001",
  "status": "PENDING",
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "createdAt": "2025-12-05T05:10:00Z"
}
```

---

### Submit Patient Response (Target Provider)

Target provider (clinic) sends the FHIR Patient resource back to WAH4PC.

```
POST /v1/fhir/patient/receive
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestId` | string | Yes | The request ID from the original request |
| `fromProviderId` | string | Yes | Provider ID of the responder (must match target) |
| `fhirPatient` | object | Yes* | FHIR R4 Patient resource JSON |
| `status` | string | Yes | `COMPLETED` or `FAILED` |
| `error` | string | No | Error message if status is `FAILED` |

**Example (Success):**

```json
{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "CLINIC_001",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "pat-123",
    "name": [
      { "family": "Doe", "given": ["John"] }
    ],
    "gender": "male",
    "birthDate": "1990-01-15"
  },
  "status": "COMPLETED"
}
```

**Example (Failure):**

```json
{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "CLINIC_001",
  "status": "FAILED",
  "error": "Patient not found in system"
}
```

**Response (200 OK):**

```json
{
  "requestId": "REQ-20251205-0001",
  "status": "COMPLETED",
  "receivedAt": "2025-12-05T06:00:00Z"
}
```

**Side Effect:** WAH4PC automatically pushes the response to the requestor's `callback.patientResponse` URL.

---

### Pull Patient Response (Requestor)

Requestor can check status or retrieve the response manually.

```
GET /v1/fhir/patient/receive?requestId={requestId}
```

**Response (Pending):**

```json
{
  "requestId": "REQ-20251205-0001",
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "status": "PENDING"
}
```

**Response (Completed):**

```json
{
  "requestId": "REQ-20251205-0001",
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "status": "COMPLETED",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "pat-123",
    "name": [{ "family": "Doe", "given": ["John"] }]
  },
  "completedAt": "2025-12-05T06:00:00Z"
}
```

---

## Error Responses

All errors return JSON with an `error` field:

```json
{
  "error": "description of the error"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request (missing/invalid fields) |
| 404 | Resource not found |
| 500 | Internal server error |
