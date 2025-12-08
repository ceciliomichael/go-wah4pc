import { CodeBlock } from "@/components/ui/code-block";
import { API_BASE_URL } from "@/constants/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  Section,
  Divider,
  Alert,
  EndpointCard,
  EndpointSection,
  PropertyTable,
} from "@/components/docs";

// Field definitions for reusable tables
const PROVIDER_FIELDS = [
  { name: "providerId", type: "string", required: true, description: "Unique identifier for the provider" },
  { name: "name", type: "string", required: true, description: "Display name of the organization" },
  { name: "type", type: "string", required: true, description: "HOSPITAL, CLINIC, LAB, PHARMACY, OTHER" },
  { name: "baseUrl", type: "string", required: true, description: "Base URL of the provider's API" },
  { name: "callback.patientRequest", type: "string", required: false, description: "URL to receive incoming patient data requests (for targets)" },
  { name: "callback.patientResponse", type: "string", required: false, description: "URL to receive patient data responses (for requestors)" },
];

const REQUEST_FIELDS = [
  { name: "requestorProviderId", type: "string", required: true, description: "ID of the requesting provider" },
  { name: "targetProviderId", type: "string", required: true, description: "ID of the target provider" },
  { name: "patientReference", type: "object", required: true, description: "Patient identifiers to look up" },
  { name: "correlationKey", type: "string", required: false, description: "Optional reference number for tracking" },
  { name: "metadata", type: "object", required: false, description: "Additional context (reason, notes)" },
];

const RECEIVE_FIELDS = [
  { name: "requestId", type: "string", required: true, description: "The request ID to respond to" },
  { name: "fromProviderId", type: "string", required: true, description: "Must match the original targetProviderId" },
  { name: "status", type: "string", required: true, description: "COMPLETED or FAILED" },
  { name: "fhirPatient", type: "object", required: "conditional" as const, description: "FHIR Patient resource (required if COMPLETED)" },
  { name: "error", type: "string", required: "conditional" as const, description: "Error message (required if FAILED)" },
];

const ERROR_CODES = [
  { code: "400", description: "Bad Request - Invalid input", example: "requestorProviderId and targetProviderId are required" },
  { code: "400", description: "Bad Request - Provider not found", example: "requestor provider not found" },
  { code: "400", description: "Bad Request - Invalid response", example: "fromProviderId does not match target provider" },
  { code: "404", description: "Not Found", example: "request not found" },
  { code: "409", description: "Conflict - Duplicate", example: "provider already exists" },
  { code: "500", description: "Internal Server Error", example: "internal server error" },
];

const ENDPOINTS_OVERVIEW = [
  { method: "get" as const, path: "/v1/provider", description: "List all registered providers" },
  { method: "post" as const, path: "/v1/provider", description: "Register a new provider" },
  { method: "post" as const, path: "/v1/fhir/patient/request", description: "Create a patient data request" },
  { method: "get" as const, path: "/v1/fhir/patient/request", description: "Get pending requests for a target provider" },
  { method: "post" as const, path: "/v1/fhir/patient/receive", description: "Submit patient data response" },
  { method: "get" as const, path: "/v1/fhir/patient/receive", description: "Poll for response by requestId" },
];

export default function ApiReferencePage() {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageHeader
        title="API Reference"
        description="Complete API documentation for WAH4PC Gateway."
      >
        <div className="mt-4 flex items-center gap-4">
          <div className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-mono">
            Base URL: <span className="text-brand-600">{API_BASE_URL}</span>
          </div>
        </div>
      </PageHeader>

      <Section title="Endpoints Overview" titleSize="xl">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENDPOINTS_OVERVIEW.map((endpoint, idx) => (
                <TableRow key={idx}>
                  <TableCell><Badge variant={endpoint.method}>{endpoint.method.toUpperCase()}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                  <TableCell>{endpoint.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Divider />

      {/* Provider Management */}
      <section>
        <h2 className="mb-6 scroll-m-20 text-2xl font-bold tracking-tight text-slate-900">
          Provider Management
        </h2>
        
        <div className="space-y-8">
          <EndpointCard method="get" path="/v1/provider" description="List all registered healthcare providers.">
            <EndpointSection title="Response (200 OK)">
              <CodeBlock
                language="json"
                code={`[
  {
    "providerId": "hospital-001",
    "name": "City Hospital",
    "type": "HOSPITAL",
    "baseUrl": "http://localhost:4001",
    "callback": {
      "patientResponse": "http://localhost:4001/callback/patient"
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
]`}
              />
            </EndpointSection>
          </EndpointCard>

          <EndpointCard method="post" path="/v1/provider" description="Register a new healthcare provider with WAH4PC.">
            <EndpointSection title="Request Body">
              <PropertyTable fields={PROVIDER_FIELDS} />
            </EndpointSection>

            <EndpointSection title="Example Request">
              <CodeBlock
                language="json"
                code={`{
  "providerId": "hospital-001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "http://localhost:4001",
  "callback": {
    "patientResponse": "http://localhost:4001/callback/patient"
  }
}`}
              />
            </EndpointSection>

            <EndpointSection title="Response (201 Created)">
              <CodeBlock
                language="json"
                code={`{
  "providerId": "hospital-001",
  "name": "City Hospital",
  "type": "HOSPITAL",
  "baseUrl": "http://localhost:4001",
  "callback": {
    "patientResponse": "http://localhost:4001/callback/patient"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}`}
              />
            </EndpointSection>
          </EndpointCard>
        </div>
      </section>

      <Divider />

      {/* Patient Data Exchange */}
      <section>
        <h2 className="mb-6 scroll-m-20 text-2xl font-bold tracking-tight text-slate-900">
          Patient Data Exchange
        </h2>

        <div className="space-y-8">
          <EndpointCard 
            method="post" 
            path="/v1/fhir/patient/request" 
            description="Create a patient data request. WAH4PC will push this request to the target provider's callback URL."
          >
            <EndpointSection title="Request Body">
              <PropertyTable fields={REQUEST_FIELDS} />
            </EndpointSection>

            <EndpointSection title="Example Request">
              <CodeBlock
                language="json"
                code={`{
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
}`}
              />
            </EndpointSection>

            <EndpointSection title="Response (201 Created)">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "status": "PENDING",
  "requestorProviderId": "hospital-001",
  "targetProviderId": "clinic-001",
  "createdAt": "2025-01-15T10:05:00Z"
}`}
              />
            </EndpointSection>

            <Alert variant="info" title="Automatic Push">
              After creating the request, WAH4PC automatically pushes it to the target's <code className="bg-blue-100 px-1 rounded">callback.patientRequest</code> URL.
            </Alert>
          </EndpointCard>

          <EndpointCard 
            method="get" 
            path="/v1/fhir/patient/request" 
            description="Get all pending requests for a target provider. Use this as a polling alternative if callbacks are not configured."
          >
            <EndpointSection title="Query Parameters">
              <PropertyTable 
                fields={[
                  { name: "targetProviderId", type: "string", required: true, description: "ID of the target provider to get pending requests for" }
                ]} 
              />
            </EndpointSection>

            <EndpointSection title="Example Request">
              <CodeBlock language="bash" code="GET /v1/fhir/patient/request?targetProviderId=clinic-001" />
            </EndpointSection>

            <EndpointSection title="Response (200 OK)">
              <CodeBlock
                language="json"
                code={`{
  "targetProviderId": "clinic-001",
  "pendingRequests": [
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
      "status": "PENDING",
      "createdAt": "2025-01-15T10:05:00Z"
    }
  ],
  "count": 1
}`}
              />
            </EndpointSection>
          </EndpointCard>

          <EndpointCard 
            method="post" 
            path="/v1/fhir/patient/receive" 
            description="Submit a patient data response. The target provider uses this to send FHIR Patient data back to WAH4PC."
          >
            <EndpointSection title="Request Body">
              <PropertyTable fields={RECEIVE_FIELDS} />
            </EndpointSection>

            <EndpointSection title="Example Request (Success)">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "fromProviderId": "clinic-001",
  "status": "COMPLETED",
  "fhirPatient": {
    "resourceType": "Patient",
    "id": "patient-abc-123",
    "name": [
      { "use": "official", "family": "Dela Cruz", "given": ["Juan", "Miguel"] }
    ],
    "gender": "male",
    "birthDate": "1990-05-15"
  }
}`}
              />
            </EndpointSection>

            <EndpointSection title="Example Request (Failure)">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "fromProviderId": "clinic-001",
  "status": "FAILED",
  "error": "Patient not found in system"
}`}
              />
            </EndpointSection>

            <EndpointSection title="Response (200 OK)">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "status": "COMPLETED",
  "receivedAt": "2025-01-15T10:10:00Z"
}`}
              />
            </EndpointSection>

            <Alert variant="success" title="Automatic Push">
              After receiving a COMPLETED response, WAH4PC automatically pushes the FHIR Patient data to the requestor's <code className="bg-green-100 px-1 rounded">callback.patientResponse</code> URL.
            </Alert>
          </EndpointCard>

          <EndpointCard 
            method="get" 
            path="/v1/fhir/patient/receive" 
            description="Poll for a response by requestId. Use this as a fallback if callbacks are not configured or fail."
          >
            <EndpointSection title="Query Parameters">
              <PropertyTable 
                fields={[
                  { name: "requestId", type: "string", required: true, description: "The request ID to check status for" }
                ]} 
              />
            </EndpointSection>

            <EndpointSection title="Example Request">
              <CodeBlock language="bash" code="GET /v1/fhir/patient/receive?requestId=REQ-20250115-0001" />
            </EndpointSection>

            <EndpointSection title="Response (200 OK) - Pending">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "requestorProviderId": "hospital-001",
  "targetProviderId": "clinic-001",
  "status": "PENDING"
}`}
              />
            </EndpointSection>

            <EndpointSection title="Response (200 OK) - Completed">
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
            </EndpointSection>
          </EndpointCard>
        </div>
      </section>

      <Divider />

      {/* Callback Payloads */}
      <section>
        <h2 className="mb-6 scroll-m-20 text-2xl font-bold tracking-tight text-slate-900">
          Callback Payloads
        </h2>
        <p className="text-slate-600 mb-6">
          WAH4PC pushes data to provider callback URLs. Your system must implement these endpoints to receive pushed notifications.
        </p>

        <div className="space-y-8">
          <EndpointCard 
            method="post" 
            path="callback.patientRequest" 
            description="Payload pushed to target providers when a new patient data request is created."
          >
            <EndpointSection title="Payload">
              <CodeBlock
                language="json"
                code={`{
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
    "reason": "Patient referral consultation",
    "notes": "Urgent - patient admitted to ER"
  },
  "createdAt": "2025-01-15T10:05:00Z"
}`}
              />
            </EndpointSection>

            <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200">
              <strong>Expected Response:</strong> Return <code className="bg-slate-200 px-1 rounded">200 OK</code> to acknowledge receipt. Response body is ignored.
            </div>
          </EndpointCard>

          <EndpointCard 
            method="post" 
            path="callback.patientResponse" 
            description="Payload pushed to requestor providers when a patient data response is received."
          >
            <EndpointSection title="Payload (Success)">
              <CodeBlock
                language="json"
                code={`{
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
}`}
              />
            </EndpointSection>

            <EndpointSection title="Payload (Failure)">
              <CodeBlock
                language="json"
                code={`{
  "requestId": "REQ-20250115-0001",
  "fromProviderId": "clinic-001",
  "toProviderId": "hospital-001",
  "status": "FAILED",
  "error": "Patient not found in system"
}`}
              />
            </EndpointSection>

            <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200">
              <strong>Expected Response:</strong> Return <code className="bg-slate-200 px-1 rounded">200 OK</code> to acknowledge receipt. Response body is ignored.
            </div>
          </EndpointCard>
        </div>
      </section>

      <Divider />

      {/* Error Responses */}
      <section>
        <h2 className="mb-6 scroll-m-20 text-2xl font-bold tracking-tight text-slate-900">
          Error Responses
        </h2>
        <p className="text-slate-600 mb-6">
          All error responses follow a consistent format.
        </p>

        <div className="rounded-lg border border-slate-200 overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ERROR_CODES.map((error, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono">{error.code}</TableCell>
                  <TableCell>{error.description}</TableCell>
                  <TableCell className="text-sm">{error.example}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h4 className="font-medium text-slate-900 mb-2">Error Response Format</h4>
          <CodeBlock
            language="json"
            code={`{
  "error": "requestor provider not found"
}`}
          />
        </div>
      </section>
    </div>
  );
}