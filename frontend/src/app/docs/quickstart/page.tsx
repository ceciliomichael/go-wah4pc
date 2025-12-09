import { CodeBlock } from "@/components/ui/code-block";
import { API_BASE_URL } from "@/constants/api";
import {
  PageHeader,
  Section,
  Divider,
  Alert,
  LinkCard,
  LinkCardGrid,
  PrerequisitesBox,
  ResponseExample,
  TerminalBlock,
} from "@/components/docs";

const PREREQUISITES = [
  'WAH4PC gateway running on <code class="bg-slate-200 px-1 rounded">localhost:3043</code>',
  '<code class="bg-slate-200 px-1 rounded">curl</code> or any HTTP client',
  "(Optional) Python 3 for mock callback servers",
];

const NEXT_STEPS = [
  { href: "/docs/flow-overview", title: "Flow Overview", description: "Understand the complete request-response lifecycle" },
  { href: "/docs/api-reference", title: "API Reference", description: "Detailed documentation for all endpoints" },
  { href: "/docs/provider-integration", title: "Provider Integration", description: "How to integrate your healthcare system" },
  { href: "/docs/fhir-patient-format", title: "FHIR Patient Format", description: "PH Core Patient resource specification" },
];

export default function QuickstartPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Quickstart"
        description="Get started with WAH4PC in minutes. This guide walks you through a complete end-to-end patient data exchange between two healthcare providers."
      />

      <Alert variant="info" title="Base URL">
        <code className="bg-blue-100 px-1 rounded">{API_BASE_URL}</code>
      </Alert>

      <Section title="Prerequisites">
        <PrerequisitesBox items={PREREQUISITES} />
        <CodeBlock
          language="bash"
          code={`# Start the WAH4PC gateway
go run cmd/server/main.go

# Output: WAH4PC API Gateway starting on :3043`}
        />
      </Section>

      <Divider />

      <Section
        title="Step 1: Register the Hospital (Requestor)"
        description="Register the Hospital with a callback.patientResponse URL where it will receive FHIR patient data."
      >
        <CodeBlock
          language="bash"
          code={`curl -X POST ${API_BASE_URL}/v1/provider \\
  -H "Content-Type: application/json" \\
  -d '{
    "providerId": "hospital-001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "baseUrl": "http://localhost:4001",
    "callback": {
      "patientResponse": "http://localhost:4001/callback/patient"
    }
  }'`}
        />
        <ResponseExample
          status="201 Created"
          code={`{
  "providerId": "hospital-001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "createdAt": "2025-01-15T10:00:00Z"
}`}
        />
      </Section>

      <Divider />

      <Section
        title="Step 2: Register the Clinic (Target)"
        description="Register the Clinic with a callback.patientRequest URL where it will receive incoming data requests from WAH4PC."
      >
        <CodeBlock
          language="bash"
          code={`curl -X POST ${API_BASE_URL}/v1/provider \\
  -H "Content-Type: application/json" \\
  -d '{
    "providerId": "clinic-001",
    "name": "Downtown Clinic",
    "type": "CLINIC",
    "baseUrl": "http://localhost:4002",
    "callback": {
      "patientRequest": "http://localhost:4002/incoming/patient"
    }
  }'`}
        />
        <Alert variant="success" title="Note">
          The <code className="bg-green-100 px-1 rounded">callback.patientRequest</code> field is where WAH4PC will push incoming requests to the target provider.
        </Alert>
      </Section>

      <Divider />

      <Section
        title="Step 3: Verify Providers"
        description="List all registered providers to confirm both are registered."
      >
        <CodeBlock
          language="bash"
          code={`curl ${API_BASE_URL}/v1/provider | jq`}
        />
        <CodeBlock
          language="json"
          code={`[
  {
    "providerId": "hospital-001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "callback": { "patientResponse": "http://localhost:4001/callback/patient" }
  },
  {
    "providerId": "clinic-001",
    "name": "Downtown Clinic",
    "type": "CLINIC",
    "callback": { "patientRequest": "http://localhost:4002/incoming/patient" }
  }
]`}
        />
      </Section>

      <Divider />

      <Section
        title="Step 4: Hospital Requests Patient Data"
        description="The Hospital creates a request for patient data from the Clinic. WAH4PC will automatically push this request to the Clinic's callback URL."
      >
        <CodeBlock
          language="bash"
          code={`curl -X POST ${API_BASE_URL}/v1/fhir/patient/request \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestorProviderId": "hospital-001",
    "targetProviderId": "clinic-001",
    "patientReference": {
      "identifiers": [
        { "system": "http://clinic.example/mrn", "value": "MRN-12345" }
      ]
    },
    "metadata": {
      "reason": "Patient referral consultation",
      "notes": "Urgent - patient admitted to ER"
    }
  }'`}
        />
        <ResponseExample
          status="201 Created"
          code={`{
  "requestId": "REQ-20250115-0001",
  "status": "PENDING",
  "requestorProviderId": "hospital-001",
  "targetProviderId": "clinic-001",
  "createdAt": "2025-01-15T10:05:00Z"
}`}
        />
        <Alert variant="warning" title="Important">
          Save the <code className="bg-yellow-100 px-1 rounded">requestId</code> - you'll need it for the next steps.
        </Alert>
      </Section>

      <Divider />

      <Section
        title="Step 5: Clinic Submits Patient Data"
        description="After receiving the request (via push or polling), the Clinic submits the FHIR Patient resource back to WAH4PC."
      >
        <CodeBlock
          language="bash"
          code={`curl -X POST ${API_BASE_URL}/v1/fhir/patient/respond \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "REQ-20250115-0001",
    "fromProviderId": "clinic-001",
    "status": "COMPLETED",
    "fhirPatient": {
      "resourceType": "Patient",
      "id": "patient-abc-123",
      "meta": {
        "profile": ["https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient"]
      },
      "name": [
        { "use": "official", "family": "Dela Cruz", "given": ["Juan", "Miguel"] }
      ],
      "gender": "male",
      "birthDate": "1990-05-15",
      "identifier": [
        { "system": "http://clinic.example/mrn", "value": "MRN-12345" }
      ],
      "telecom": [
        { "system": "phone", "value": "+63-917-123-4567", "use": "mobile" }
      ],
      "address": [
        { "city": "Manila", "country": "PH" }
      ]
    }
  }'`}
        />
        <Alert variant="success" title="What happens next">
          WAH4PC automatically pushes the FHIR Patient data to the Hospital's <code className="bg-green-100 px-1 rounded">callback.patientResponse</code> URL.
        </Alert>
      </Section>

      <Divider />

      <Section
        title="Step 6: Hospital Polls for Response (Optional)"
        description="If the callback fails or isn't configured, the Hospital can poll for the response manually."
      >
        <CodeBlock
          language="bash"
          code={`curl "${API_BASE_URL}/v1/fhir/patient/response?requestId=REQ-20250115-0001" | jq`}
        />
        <CodeBlock
          language="json"
          code={`{
  "requestId": "REQ-20250115-0001",
  "requestorProviderId": "hospital-001",
  "targetProviderId": "clinic-001",
  "status": "COMPLETED",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "patient-abc-123",
    "name": [{ "family": "Dela Cruz", "given": ["Juan", "Miguel"] }],
    "gender": "male",
    "birthDate": "1990-05-15"
  },
  "completedAt": "2025-01-15T10:10:00Z"
}`}
        />
      </Section>

      <Divider />

      <Section
        title="Alternative: Clinic Polls for Pending Requests"
        description="If the Clinic doesn't have a callback configured, it can poll for pending requests instead of receiving pushes."
      >
        <CodeBlock
          language="bash"
          code={`curl "${API_BASE_URL}/v1/fhir/patient/request?targetProviderId=clinic-001" | jq`}
        />
        <CodeBlock
          language="json"
          code={`{
  "targetProviderId": "clinic-001",
  "pendingRequests": [
    {
      "requestId": "REQ-20250115-0001",
      "requestorProviderId": "hospital-001",
      "patientReference": {
        "identifiers": [{ "system": "http://clinic.example/mrn", "value": "MRN-12345" }]
      },
      "status": "PENDING",
      "createdAt": "2025-01-15T10:05:00Z"
    }
  ],
  "count": 1
}`}
        />
      </Section>

      <Divider />

      <Section
        title="Testing with Mock Callback Servers"
        description="To test the full push flow, run mock HTTP servers to receive callbacks."
      >
        <div className="space-y-4">
          <TerminalBlock
            title="Terminal 1: Hospital Callback Server"
            description="Receives FHIR Patient responses from WAH4PC:"
            code={`python3 -c "
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(length))
        print('\\n=== HOSPITAL RECEIVED RESPONSE ===')
        print(json.dumps(data, indent=2))
        self.send_response(200)
        self.end_headers()

print('Hospital callback server on :4001...')
HTTPServer(('', 4001), Handler).serve_forever()
"`}
          />
          <TerminalBlock
            title="Terminal 2: Clinic Callback Server"
            description="Receives incoming patient data requests from WAH4PC:"
            code={`python3 -c "
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(length))
        print('\\n=== CLINIC RECEIVED REQUEST ===')
        print(json.dumps(data, indent=2))
        self.send_response(200)
        self.end_headers()

print('Clinic callback server on :4002...')
HTTPServer(('', 4002), Handler).serve_forever()
"`}
          />
        </div>
      </Section>

      <Divider />

      <Section
        title="Complete Test Script"
        description="Run this complete script to test the entire flow:"
      >
        <CodeBlock
          language="bash"
          code={`#!/bin/bash
# Complete WAH4PC Test Script

BASE_URL="${API_BASE_URL}"

echo "=== Step 1: Register Hospital ==="
curl -s -X POST $BASE_URL/v1/provider \\
  -H "Content-Type: application/json" \\
  -d '{
    "providerId": "hospital-001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "baseUrl": "http://localhost:4001",
    "callback": { "patientResponse": "http://localhost:4001/callback" }
  }' | jq

echo "\\n=== Step 2: Register Clinic ==="
curl -s -X POST $BASE_URL/v1/provider \\
  -H "Content-Type: application/json" \\
  -d '{
    "providerId": "clinic-001",
    "name": "Downtown Clinic",
    "type": "CLINIC",
    "baseUrl": "http://localhost:4002",
    "callback": { "patientRequest": "http://localhost:4002/incoming" }
  }' | jq

echo "\\n=== Step 3: List Providers ==="
curl -s $BASE_URL/v1/provider | jq

echo "\\n=== Step 4: Create Request ==="
RESPONSE=$(curl -s -X POST $BASE_URL/v1/fhir/patient/request \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestorProviderId": "hospital-001",
    "targetProviderId": "clinic-001",
    "patientReference": {
      "identifiers": [{ "system": "http://clinic/mrn", "value": "MRN-12345" }]
    }
  }')
echo $RESPONSE | jq
REQUEST_ID=$(echo $RESPONSE | jq -r '.requestId')

echo "\\n=== Step 5: Submit Response ==="
curl -s -X POST $BASE_URL/v1/fhir/patient/respond \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"requestId\\": \\"$REQUEST_ID\\",
    \\"fromProviderId\\": \\"clinic-001\\",
    \\"status\\": \\"COMPLETED\\",
    \\"fhirPatient\\": {
      \\"resourceType\\": \\"Patient\\",
      \\"id\\": \\"pat-123\\",
      \\"name\\": [{ \\"family\\": \\"Smith\\", \\"given\\": [\\"John\\"] }],
      \\"gender\\": \\"male\\",
      \\"birthDate\\": \\"1990-01-15\\"
    }
  }" | jq

echo "\\n=== Step 6: Poll Response ==="
curl -s "$BASE_URL/v1/fhir/patient/response?requestId=$REQUEST_ID" | jq

echo "\\n=== Done! ==="`}
        />
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