import { CodeBlock } from "@/components/ui/code-block";
import { Mermaid } from "@/components/ui/mermaid";
import {
  PageHeader,
  Section,
  Divider,
  Alert,
  InfoBox,
  LinkCard,
  LinkCardGrid,
  PropertyTable,
  ChecklistContainer,
  ChecklistGroup,
  ChecklistItem,
  CodeExample,
} from "@/components/docs";

const REGISTRATION_FIELDS = [
  { name: "providerId", type: "string", required: true, description: "Unique identifier for your system (you define this)" },
  { name: "type", type: "string", required: true, description: "HOSPITAL, CLINIC, LAB, PHARMACY, or OTHER" },
  { name: "callback.patientRequest", type: "string", required: false, description: "URL where WAH4PC pushes incoming requests (for targets)" },
  { name: "callback.patientResponse", type: "string", required: false, description: "URL where WAH4PC pushes responses (for requestors)" },
];

const NEXT_STEPS = [
  { href: "/docs/api-reference", title: "API Reference", description: "Complete endpoint documentation" },
  { href: "/docs/fhir-patient-format", title: "FHIR Patient Format", description: "PH Core Patient resource specification" },
];

const INTEGRATION_FLOW_DIAGRAM = `sequenceDiagram
    participant YS as Your System
    participant W as WAH4PC
    participant OP as Other Provider

    Note over YS,OP: As Requestor
    YS->>W: POST /v1/fhir/patient/request
    W-->>YS: {requestId, status: PENDING}
    Note over OP: Other provider processes...
    W->>YS: POST to callback.patientResponse
    Note right of YS: Store fhirPatient data

    Note over YS,OP: As Target
    W->>YS: POST to callback.patientRequest
    Note right of YS: Look up patient, prepare FHIR
    YS->>W: POST /v1/fhir/patient/receive
    W-->>YS: 200 OK`;

const REQUESTOR_REGISTRATION = `{
  "providerId": "hospital-001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "https://hospital.example.com/api",
  "callback": {
    "patientResponse": "https://hospital.example.com/wah4pc/patient/response"
  }
}`;

const TARGET_REGISTRATION = `{
  "providerId": "clinic-001",
  "name": "Downtown Clinic",
  "type": "CLINIC",
  "baseUrl": "https://clinic.example.com/api",
  "callback": {
    "patientRequest": "https://clinic.example.com/wah4pc/patient/request"
  }
}`;

const BOTH_ROLES_REGISTRATION = `{
  "providerId": "medical-center-001",
  "name": "Regional Medical Center",
  "type": "HOSPITAL",
  "baseUrl": "https://medical-center.example.com/api",
  "callback": {
    "patientRequest": "https://medical-center.example.com/wah4pc/incoming",
    "patientResponse": "https://medical-center.example.com/wah4pc/response"
  }
}`;

const RESPONSE_CALLBACK_PAYLOAD = `// Incoming payload to your callback endpoint
{
  "requestId": "REQ-20250115-0001",
  "fromProviderId": "clinic-001",
  "toProviderId": "hospital-001",
  "status": "COMPLETED",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "patient-abc-123",
    "name": [{ "family": "Dela Cruz", "given": ["Juan", "Miguel"] }],
    "gender": "male",
    "birthDate": "1990-05-15"
  }
}`;

const REQUEST_CALLBACK_PAYLOAD = `// Incoming payload to your callback endpoint
{
  "requestId": "REQ-20250115-0001",
  "requestorProviderId": "hospital-001",
  "targetProviderId": "clinic-001",
  "patientReference": {
    "identifiers": [
      { "system": "http://clinic.example/mrn", "value": "MRN-12345" }
    ]
  },
  "fhirConstraints": {
    "resourceType": "Patient",
    "version": "4.0.1"
  },
  "metadata": {
    "reason": "Patient referral consultation"
  },
  "createdAt": "2025-01-15T10:05:00Z"
}`;

const NODEJS_CALLBACK_SERVER = `const express = require('express');
const app = express();
app.use(express.json());

// Callback for receiving patient data responses (as requestor)
app.post('/wah4pc/patient/response', (req, res) => {
  const { requestId, status, fhirPatient, error } = req.body;
  
  console.log(\`Received response for \${requestId}: \${status}\`);
  
  if (status === 'COMPLETED') {
    // Store the FHIR Patient data in your system
    console.log('Patient:', fhirPatient.name[0]);
    // savePatientToDatabase(requestId, fhirPatient);
  } else if (status === 'FAILED') {
    console.error('Request failed:', error);
    // handleFailedRequest(requestId, error);
  }
  
  res.status(200).send('OK');
});

// Callback for receiving patient data requests (as target)
app.post('/wah4pc/patient/request', async (req, res) => {
  const { requestId, patientReference, requestorProviderId } = req.body;
  
  console.log(\`Received request \${requestId} from \${requestorProviderId}\`);
  
  // Acknowledge receipt immediately
  res.status(200).send('OK');
  
  // Process asynchronously
  processPatientRequest(requestId, patientReference);
});

async function processPatientRequest(requestId, patientReference) {
  try {
    // Look up patient in your system
    const patient = await findPatient(patientReference.identifiers);
    
    // Submit response to WAH4PC
    await fetch('http://localhost:3043/v1/fhir/patient/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        fromProviderId: 'clinic-001',
        status: 'COMPLETED',
        fhirPatient: patient
      })
    });
  } catch (error) {
    // Submit error response
    await fetch('http://localhost:3043/v1/fhir/patient/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        fromProviderId: 'clinic-001',
        status: 'FAILED',
        error: error.message
      })
    });
  }
}

app.listen(4002, () => console.log('Callback server on :4002'));`;

export default function ProviderIntegrationPage() {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageHeader
        title="Provider Integration Guide"
        description="Learn how to integrate your hospital, clinic, or lab system with WAH4PC as either a requestor, target, or both."
      />

      <Section
        title="Integration Overview"
        description="WAH4PC supports two provider roles. Your system can act as one or both:"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBox title="Requestor Role">
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Your system requests patient data from other providers. You need to:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Register with <code className="bg-slate-200 px-1 rounded text-xs">callback.patientResponse</code></li>
              <li>Call <code className="bg-slate-200 px-1 rounded text-xs">POST /v1/fhir/patient/request</code></li>
              <li>Implement callback endpoint to receive responses</li>
            </ul>
          </InfoBox>
          <InfoBox title="Target Role">
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Your system receives requests and provides patient data. You need to:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Register with <code className="bg-slate-200 px-1 rounded text-xs">callback.patientRequest</code></li>
              <li>Implement callback endpoint to receive requests</li>
              <li>Call <code className="bg-slate-200 px-1 rounded text-xs">POST /v1/fhir/patient/receive</code></li>
            </ul>
          </InfoBox>
        </div>
      </Section>

      <Divider />

      <Section
        title="Step 1: Register Your System"
        description="Before exchanging data, register your system with WAH4PC. Configure callback URLs based on your role."
      >
        <div className="space-y-4">
          <CodeExample title="Registration as Requestor (e.g., Hospital)" language="json" code={REQUESTOR_REGISTRATION} />
          <CodeExample title="Registration as Target (e.g., Clinic)" language="json" code={TARGET_REGISTRATION} />
          <CodeExample title="Registration as Both Roles" language="json" code={BOTH_ROLES_REGISTRATION} />
        </div>
        <PropertyTable fields={REGISTRATION_FIELDS} />
      </Section>

      <Divider />

      <Section
        title="Step 2: Implement Callback Endpoints"
        description="Your system must expose HTTP endpoints to receive pushed data from WAH4PC."
      >
        <div className="space-y-6">
          <InfoBox title="For Requestors: Receive Patient Response">
            <p className="text-sm text-slate-600 mb-4">
              When another provider responds to your request, WAH4PC POSTs to your <code className="bg-slate-100 px-1 rounded">callback.patientResponse</code> URL:
            </p>
            <CodeBlock language="json" code={RESPONSE_CALLBACK_PAYLOAD} />
            <Alert variant="success" title="Your Response">
              Return <code className="bg-green-100 px-1 rounded">200 OK</code> to acknowledge receipt.
            </Alert>
          </InfoBox>

          <InfoBox title="For Targets: Receive Patient Request">
            <p className="text-sm text-slate-600 mb-4">
              When another provider requests patient data from you, WAH4PC POSTs to your <code className="bg-slate-100 px-1 rounded">callback.patientRequest</code> URL:
            </p>
            <CodeBlock language="json" code={REQUEST_CALLBACK_PAYLOAD} />
            <Alert variant="success" title="Your Response">
              Return <code className="bg-green-100 px-1 rounded">200 OK</code> to acknowledge receipt. Then process the request and submit the response.
            </Alert>
          </InfoBox>
        </div>
      </Section>

      <Divider />

      <Section title="Step 3: Handle the Data Flow">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <Mermaid chart={INTEGRATION_FLOW_DIAGRAM} />
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">As a Requestor</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
              <li>Call <code className="bg-slate-100 px-1 rounded">POST /v1/fhir/patient/request</code> with patient identifiers</li>
              <li>Store the returned <code className="bg-slate-100 px-1 rounded">requestId</code> for tracking</li>
              <li>Wait for WAH4PC to push the response to your callback URL</li>
              <li>Process the FHIR Patient data when received</li>
              <li>(Optional) Poll <code className="bg-slate-100 px-1 rounded">GET /v1/fhir/patient/receive?requestId=...</code> as fallback</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-slate-900 mb-2">As a Target</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
              <li>Receive the request via your callback endpoint (or poll for pending requests)</li>
              <li>Look up the patient using the provided identifiers</li>
              <li>Prepare the FHIR Patient resource</li>
              <li>Call <code className="bg-slate-100 px-1 rounded">POST /v1/fhir/patient/receive</code> with the data</li>
              <li>WAH4PC automatically pushes the response to the requestor</li>
            </ol>
          </div>
        </div>
      </Section>

      <Divider />

      <Section
        title="Polling as Fallback"
        description="If callbacks are not configured or fail, both requestors and targets can poll for data."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBox title="Targets: Poll for Pending Requests">
            <CodeBlock language="bash" code="GET /v1/fhir/patient/request?targetProviderId=clinic-001" />
            <p className="text-sm text-slate-600 mt-3">
              Returns all PENDING requests where your system is the target.
            </p>
          </InfoBox>

          <InfoBox title="Requestors: Poll for Response">
            <CodeBlock language="bash" code="GET /v1/fhir/patient/receive?requestId=REQ-20250115-0001" />
            <p className="text-sm text-slate-600 mt-3">
              Returns the current status and FHIR data if available.
            </p>
          </InfoBox>
        </div>
      </Section>

      <Divider />

      <Section
        title="Example: Node.js Callback Server"
        description="A simple Express.js server that handles both callback types:"
      >
        <CodeBlock language="javascript" code={NODEJS_CALLBACK_SERVER} />
      </Section>

      <Divider />

      <Section title="Integration Checklist">
        <ChecklistContainer>
          <ChecklistGroup title="General">
            <ChecklistItem>
              Register your system via <code className="bg-slate-200 px-1 rounded">POST /v1/provider</code>
            </ChecklistItem>
            <ChecklistItem>
              Ensure callback URLs are publicly accessible (or use tunneling for dev)
            </ChecklistItem>
          </ChecklistGroup>

          <ChecklistGroup title="As Requestor">
            <ChecklistItem>
              Configure <code className="bg-slate-200 px-1 rounded">callback.patientResponse</code> URL
            </ChecklistItem>
            <ChecklistItem>
              Implement endpoint to receive COMPLETED/FAILED responses
            </ChecklistItem>
            <ChecklistItem>
              Store <code className="bg-slate-200 px-1 rounded">requestId</code> when creating requests
            </ChecklistItem>
            <ChecklistItem>Handle both success and error responses</ChecklistItem>
          </ChecklistGroup>

          <ChecklistGroup title="As Target">
            <ChecklistItem>
              Configure <code className="bg-slate-200 px-1 rounded">callback.patientRequest</code> URL
            </ChecklistItem>
            <ChecklistItem>Implement endpoint to receive incoming requests</ChecklistItem>
            <ChecklistItem>Look up patients using provided identifiers</ChecklistItem>
            <ChecklistItem>
              Submit FHIR Patient data via <code className="bg-slate-200 px-1 rounded">POST /v1/fhir/patient/receive</code>
            </ChecklistItem>
            <ChecklistItem>Handle cases where patient is not found (submit FAILED status)</ChecklistItem>
          </ChecklistGroup>
        </ChecklistContainer>
      </Section>

      <Divider />

      <Section title="Next Steps">
        <LinkCardGrid>
          {NEXT_STEPS.map((link) => (
            <LinkCard key={link.href} {...link} />
          ))}
        </LinkCardGrid>
      </Section>
    </div>
  );
}