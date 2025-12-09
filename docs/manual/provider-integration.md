# Provider Integration Guide

This guide explains how external healthcare systems (hospitals, clinics, labs, etc.) integrate with WAH4PC.

---

## Requirements

To use WAH4PC, your system must:

1. **Register as a provider** with WAH4PC
2. **Implement a callback endpoint** to receive pushed FHIR responses
3. **Use WAH4PC's JSON format** for all requests/responses

---

## 1. Register Your System

Before exchanging data, register your system with WAH4PC:

```
POST /v1/provider
Content-Type: application/json
```

```json
{
  "providerId": "YOUR_UNIQUE_ID",
  "name": "Your Organization Name",
  "type": "HOSPITAL",
  "baseUrl": "https://your-system.example.com/api",
  "endpoints": {
    "patientRequest": "/wah4pc/patient/request"
  },
  "callback": {
    "patientResponse": "https://your-system.example.com/wah4pc/patient/respond"
  }
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `providerId` | Unique identifier for your system (you define this) |
| `name` | Human-readable name |
| `type` | One of: `HOSPITAL`, `CLINIC`, `LAB`, `PHARMACY`, `OTHER` |
| `baseUrl` | Base URL of your API |
| `endpoints.patientRequest` | Where you receive incoming patient requests (future) |
| `callback.patientResponse` | Where WAH4PC pushes responses when you are the requestor |

---

## 2. Implement Callback Endpoint

Your system must expose an endpoint to receive pushed FHIR responses.

### Endpoint Specification

```
POST {your callback.patientResponse URL}
Content-Type: application/json
```

### Incoming Payload

When another provider responds to your request, WAH4PC will POST:

```json
{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "CLINIC_001",
  "toProviderId": "YOUR_PROVIDER_ID",
  "status": "COMPLETED",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "pat-123",
    "name": [{ "family": "Doe", "given": ["John"] }],
    "gender": "male",
    "birthDate": "1990-01-15"
  },
  "error": ""
}
```

### Expected Response

Return `200 OK` to acknowledge receipt. Body content is ignored.

### Handling Failures

If your callback is unreachable or returns an error:
- WAH4PC logs the failure
- The response is still stored in WAH4PC
- You can retrieve it later via `GET /v1/fhir/patient/respond?requestId=...`

---

## 3. Request Patient Data

To request patient data from another provider:

```
POST /v1/fhir/patient/request
Content-Type: application/json
```

```json
{
  "requestorProviderId": "YOUR_PROVIDER_ID",
  "targetProviderId": "TARGET_PROVIDER_ID",
  "patientReference": {
    "identifiers": [
      { "system": "NATIONAL_ID", "value": "123456789" }
    ]
  }
}
```

### Response

```json
{
  "requestId": "REQ-20251205-0001",
  "status": "PENDING",
  "requestorProviderId": "YOUR_PROVIDER_ID",
  "targetProviderId": "TARGET_PROVIDER_ID",
  "createdAt": "2025-12-05T05:00:00Z"
}
```

Store the `requestId` to correlate with the incoming callback.

---

## 4. Respond to Patient Requests

When you are the **target** of a request, send the FHIR Patient back:

```
POST /v1/fhir/patient/respond
Content-Type: application/json
```

```json
{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "YOUR_PROVIDER_ID",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "local-patient-id",
    "name": [{ "family": "Smith", "given": ["Jane"] }],
    "gender": "female",
    "birthDate": "1985-03-20"
  },
  "status": "COMPLETED"
}
```

If you cannot fulfill the request:

```json
{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "YOUR_PROVIDER_ID",
  "status": "FAILED",
  "error": "Patient not found"
}
```

---

## 5. Check Request Status (Optional)

You can always check the status of a request:

```
GET /v1/fhir/patient/respond?requestId=REQ-20251205-0001
```

This is useful for:
- Checking if a response has arrived
- Retrying if your callback was down
- Debugging integration issues

---

## Integration Checklist

- [ ] Register your system via `POST /v1/provider`
- [ ] Implement callback endpoint at your `callback.patientResponse` URL
- [ ] Handle incoming `COMPLETED` and `FAILED` statuses
- [ ] Store `requestId` when creating requests
- [ ] Test full flow with another registered provider
