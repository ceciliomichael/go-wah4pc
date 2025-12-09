# WAH4PC Quickstart

Get WAH4PC running and test the full patient data exchange flow.

---

## 1. Start the Server

```bash
# Build
go build -o wah4pc.exe ./cmd/server

# Run
./wah4pc.exe
```

Server starts on `http://localhost:3043`.

---

## 2. Register Providers

Register a hospital and a clinic:

```bash
# Hospital
curl -X POST http://localhost:3043/v1/provider \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "HOSPITAL_001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "baseUrl": "https://city-hospital.example.com/api",
    "endpoints": { "patientRequest": "/wah4pc/patient/request" },
    "callback": { "patientResponse": "https://city-hospital.example.com/wah4pc/patient/respond" }
  }'

# Clinic
curl -X POST http://localhost:3043/v1/provider \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "CLINIC_001",
    "name": "Downtown Clinic",
    "type": "CLINIC",
    "baseUrl": "https://clinic.example.com/api",
    "endpoints": { "patientRequest": "/wah4pc/patient/request" },
    "callback": { "patientResponse": "https://clinic.example.com/wah4pc/patient/respond" }
  }'
```

---

## 3. Hospital Requests Patient Data

```bash
curl -X POST http://localhost:3043/v1/fhir/patient/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestorProviderId": "HOSPITAL_001",
    "targetProviderId": "CLINIC_001",
    "patientReference": {
      "identifiers": [{ "system": "NATIONAL_ID", "value": "123456789" }]
    }
  }'
```

Response:

```json
{
  "requestId": "REQ-20251205-0001",
  "status": "PENDING",
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "createdAt": "2025-12-05T05:00:00Z"
}
```

---

## 4. Clinic Sends Response

```bash
curl -X POST http://localhost:3043/v1/fhir/patient/respond \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQ-20251205-0001",
    "fromProviderId": "CLINIC_001",
    "fhirPatient": {
      "resourceType": "Patient",
      "id": "pat-123",
      "name": [{ "family": "Doe", "given": ["John"] }],
      "gender": "male",
      "birthDate": "1990-01-15"
    },
    "status": "COMPLETED"
  }'
```

WAH4PC will:
1. Store the response
2. Push to hospital's callback URL (logged in server console)

---

## 5. Hospital Pulls Result (Optional)

```bash
curl "http://localhost:3043/v1/fhir/patient/respond?requestId=REQ-20251205-0001"
```

Response:

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

## 6. List All Providers

```bash
curl http://localhost:3043/v1/provider
```

---

## Data Storage

All data is stored in JSON files under `./data/`:

| File | Contents |
|------|----------|
| `providers.json` | Registered providers |
| `requests.json` | Patient data requests |
| `responses.json` | FHIR Patient responses |

---

## Next Steps

- Read [API Reference](./api-reference.md) for full endpoint details
- Read [Provider Integration](./provider-integration.md) to integrate your system
- Read [FHIR Patient Format](./fhir-patient-format.md) for resource structure
