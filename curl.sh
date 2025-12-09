# 1. Register providers (with required baseUrl and callback)
curl -X POST http://localhost:3043/v1/provider -H "Content-Type: application/json" -d '{
  "providerId": "HOSPITAL_001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "https://city-hospital.example.com/api",
  "endpoints": { "patientRequest": "/wah4pc/patient/request" },
  "callback": { "patientResponse": "https://city-hospital.example.com/wah4pc/patient/respond" }
}'

curl -X POST http://localhost:3043/v1/provider -H "Content-Type: application/json" -d '{
  "providerId": "CLINIC_001",
  "name": "Downtown Clinic",
  "type": "CLINIC",
  "baseUrl": "https://clinic.example.com/api",
  "endpoints": { "patientRequest": "/wah4pc/patient/request" },
  "callback": { "patientResponse": "https://clinic.example.com/wah4pc/patient/respond" }
}'

# 2. Hospital requests patient data from clinic
curl -X POST http://localhost:3043/v1/fhir/patient/request -H "Content-Type: application/json" -d '{
  "requestorProviderId": "HOSPITAL_001",
  "targetProviderId": "CLINIC_001",
  "patientReference": {
    "identifiers": [{ "system": "NATIONAL_ID", "value": "123456789" }]
  }
}'

# 3. Clinic sends response (use requestId from step 2)
# WAH4PC will automatically push to hospital's callback URL
curl -X POST http://localhost:3043/v1/fhir/patient/respond -H "Content-Type: application/json" -d '{
  "requestId": "REQ-20251205-0001",
  "fromProviderId": "CLINIC_001",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "pat-123",
    "name": [{ "family": "Doe", "given": ["John"] }]
  },
  "status": "COMPLETED"
}'

# 4. Hospital can also pull result (optional, for status check or retry)
curl "http://localhost:3043/v1/fhir/patient/responde?requestId=REQ-20251205-0001"

# 5. List all providers
curl http://localhost:3043/v1/provider