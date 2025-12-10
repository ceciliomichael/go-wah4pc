# WAH4PC Quickstart

Get started with WAH4PC in minutes. This guide walks you through a complete end-to-end patient data exchange between two healthcare providers.

---

## Prerequisites

- WAH4PC gateway running on `localhost:3043`
- `curl` or any HTTP client
- (Optional) Python 3 for mock callback servers

**Start the WAH4PC gateway:**



---

## Step 1: Register the Hospital (Requestor)

Register the Hospital with a `callback.patientResponse` URL where it will receive FHIR patient data.



**Response (201 Created):**



---

## Step 2: Register the Clinic (Target)

Register the Clinic with a `callback.patientRequest` URL where it will receive incoming data requests from WAH4PC.



**Note:** The `callback.patientRequest` field is where WAH4PC will push incoming requests to the target provider.

---

## Step 3: Verify Providers

List all registered providers to confirm both are registered.



**Response:**



---

## Step 4: Hospital Requests Patient Data

The Hospital creates a request for patient data from the Clinic. WAH4PC will automatically push this request to the Clinic's callback URL.



**Response (201 Created):**



**Important:** Save the `requestId` - you'll need it for the next steps.

---

## Step 5: Clinic Submits Patient Data

After receiving the request (via push or polling), the Clinic submits the FHIR Patient resource back to WAH4PC.



**What happens next:** WAH4PC automatically pushes the FHIR Patient data to the Hospital's `callback.patientResponse` URL.

---

## Step 6: Hospital Polls for Response (Optional)

If the callback fails or isn't configured, the Hospital can poll for the response manually.



**Response:**



---

## Alternative: Clinic Polls for Pending Requests

If the Clinic doesn't have a callback configured, it can poll for pending requests instead of receiving pushes.



**Response:**



---

## Testing with Mock Callback Servers

To test the full push flow, run mock HTTP servers to receive callbacks.

**Terminal 1: Hospital Callback Server**

Receives FHIR Patient responses from WAH4PC:



**Terminal 2: Clinic Callback Server**

Receives incoming patient data requests from WAH4PC:



---

## Complete Test Script

Run this complete script to test the entire flow:



---

## Next Steps

- Read [Flow Overview](./flow-overview.md) to understand the complete request-response lifecycle
- Read [API Reference](./api-reference.md) for detailed documentation for all endpoints
- Read [Provider Integration](./provider-integration.md) to learn how to integrate your healthcare system
- Read [FHIR Patient Format](./fhir-patient-format.md) for PH Core Patient resource specification