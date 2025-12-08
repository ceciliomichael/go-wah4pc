# WAH4PC - Healthcare Interoperability Gateway

## Purpose

WAH4PC (Web API Hub for Patient Care) is a Go-based API gateway designed for healthcare interoperability. It serves as a secure proxy layer between healthcare applications and FHIR (Fast Healthcare Interoperability Resources) servers.

## What It Does

The gateway provides a centralized entry point for accessing FHIR resources from multiple backend healthcare servers. Its core responsibilities include:

1. **API Key Authentication** - Validates client requests using API keys before allowing access to healthcare data
2. **Multi-Target Routing** - Routes requests to different FHIR servers based on URL path patterns (e.g., `/Patient/*`, `/Observation/*`)
3. **Request Correlation** - Generates unique correlation IDs for end-to-end request tracing across services
4. **Request/Response Logging** - Structured logging for observability and debugging
5. **Proxying** - Forwards authenticated requests to target FHIR servers and streams responses back

## Use Case

A healthcare application (EHR, patient portal, clinical tool) connects to this gateway instead of directly to FHIR servers. The gateway:

- Authenticates the client
- Determines which backend FHIR server handles the request
- Forwards the request with proper headers and correlation tracking
- Returns the FHIR response (Patient records, Observations, Encounters, etc.)

## FHIR Resources Supported

The gateway is configured to route common FHIR R4 resources:

- Patient demographics
- Observations (vitals, lab results)
- Encounters (visits, admissions)
- Conditions (diagnoses)
- Procedures
- Medication requests
- Diagnostic reports
- Allergies
- Immunizations
- Documents
- Capability statements (metadata)

## Technology

- **Language**: Go
- **Framework**: Standard library `net/http`
- **Config**: YAML-based configuration
- **Protocol**: FHIR R4 over REST/JSON