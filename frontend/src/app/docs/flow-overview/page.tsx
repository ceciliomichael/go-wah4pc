import { Mermaid } from "@/components/ui/mermaid";
import {
  PageHeader,
  Section,
  Divider,
  StepCard,
  InfoBox,
  CallbackBox,
  StatusCard,
} from "@/components/docs";

const FLOW_PHASES = [
  {
    step: 1,
    title: "Provider Registration",
    description:
      "Both the requestor (e.g., Hospital) and target (e.g., Clinic) must register with WAH4PC before exchanging data. Registration includes callback URLs for receiving pushed notifications.",
    callbacks: [
      { label: "callback.patientRequest", description: "URL where WAH4PC pushes incoming requests (for targets)" },
      { label: "callback.patientResponse", description: "URL where WAH4PC pushes responses (for requestors)" },
    ],
  },
  {
    step: 2,
    title: "Request Creation",
    description:
      "The requestor creates a patient data request specifying the target provider and patient identifiers. WAH4PC validates both providers exist, generates a unique requestId, and stores the request with PENDING status.",
  },
  {
    step: 3,
    title: "Push to Target",
    description:
      "WAH4PC immediately pushes the request to the target provider's callback.patientRequest URL. If the target doesn't have a callback configured, they can poll for pending requests instead.",
  },
  {
    step: 4,
    title: "Async Processing",
    description:
      "The target provider processes the request asynchronously. This may involve manual review, data retrieval from internal systems, or approval workflows. This phase can take minutes, hours, or even days.",
  },
  {
    step: 5,
    title: "Response Submission",
    description:
      "The target submits the FHIR Patient resource back to WAH4PC. The gateway validates that the fromProviderId matches the original target, stores the response, and updates the request status to COMPLETED or FAILED.",
  },
  {
    step: 6,
    title: "Push to Requestor",
    description:
      "WAH4PC automatically pushes the FHIR Patient data to the requestor's callback.patientResponse URL. The requestor can also poll for the response if the callback fails or isn't configured.",
  },
];

const KEY_CONCEPTS = [
  {
    title: "Async by Default",
    description:
      "Healthcare requests often require manual review or approval. WAH4PC is designed to handle long-running transactions where responses may take hours or days.",
  },
  {
    title: "Bidirectional Push",
    description:
      "WAH4PC pushes requests to targets AND responses to requestors. Both directions support polling as a fallback mechanism.",
  },
  {
    title: "FHIR R4 Standard",
    description:
      "All patient data is exchanged using the HL7 FHIR R4 (4.0.1) Patient resource format to ensure interoperability between different healthcare systems.",
  },
  {
    title: "Provider Validation",
    description:
      "WAH4PC validates that both requestor and target providers are registered, and that responses come from the correct target provider.",
  },
];

const STATUS_LIFECYCLE = [
  { status: "pending" as const, description: "Request created, awaiting response from target" },
  { status: "completed" as const, description: "Target submitted FHIR Patient data successfully" },
  { status: "failed" as const, description: "Target could not fulfill the request" },
];

const ARCHITECTURE_DIAGRAM = `sequenceDiagram
    participant Providers as Healthcare Providers<br/>(Hospital, Clinic, Lab)
    participant API as REST API
    participant Store as Request Store
    participant Push as Push Engine
    
    Note over Providers,Push: Registration Phase
    Providers->>API: Register with callback URLs
    API->>Store: Save provider config
    
    Note over Providers,Push: Request Phase
    Providers->>API: POST /v1/fhir/patient/request
    API->>Store: Store request (PENDING)
    API->>Push: Trigger push to target
    Push->>Providers: POST to callback.patientRequest
    
    Note over Providers,Push: Response Phase
    Providers->>API: POST /v1/fhir/patient/respond
    API->>Store: Update status (COMPLETED)
    API->>Push: Trigger callback to requestor
    Push->>Providers: POST to callback.patientResponse`;

const SEQUENCE_DIAGRAM = `sequenceDiagram
    participant H as Hospital (Requestor)
    participant W as WAH4PC Gateway
    participant C as Clinic (Target)

    Note over H,C: Phase 1: Provider Registration
    H->>W: POST /v1/provider
    Note right of H: callback.patientResponse = "http://hospital/callback"
    W-->>H: 201 Created
    C->>W: POST /v1/provider
    Note right of C: callback.patientRequest = "http://clinic/incoming"
    W-->>C: 201 Created

    Note over H,C: Phase 2: Patient Data Request
    H->>W: POST /v1/fhir/patient/request
    W->>W: Validate providers exist
    W->>W: Generate requestId (REQ-YYYYMMDD-NNNN)
    W->>W: Store request (status: PENDING)
    W-->>H: {requestId, status: "PENDING"}

    Note over W,C: Phase 3: Push Request to Target
    W->>C: POST to callback.patientRequest
    Note left of W: {requestId, patientReference, fhirConstraints}
    C-->>W: 200 OK

    alt Target polls instead of receiving push
        C->>W: GET /v1/fhir/patient/request?targetProviderId=...
        W-->>C: {pendingRequests: [...]}
    end

    Note over C: Phase 4: Target Processes Request (async)

    Note over H,C: Phase 5: Response Submission
    C->>W: POST /v1/fhir/patient/respond
    Note right of C: {requestId, fhirPatient, status: "COMPLETED"}
    W->>W: Validate fromProviderId matches target
    W->>W: Store response, update status
    W-->>C: 200 OK

    Note over H,C: Phase 6: Push Response to Requestor
    W->>H: POST to callback.patientResponse
    Note left of W: {requestId, fhirPatient, status}
    H-->>W: 200 OK

    alt Requestor polls instead of callback
        H->>W: GET /v1/fhir/patient/respond?requestId=...
        W-->>H: {fhirPatient, status}
    end`;

const STATUS_STATE_DIAGRAM = `stateDiagram-v2
    [*] --> PENDING: Request Created
    PENDING --> COMPLETED: Target submits fhirPatient
    PENDING --> FAILED: Target submits error
    COMPLETED --> [*]
    FAILED --> [*]`;

export default function FlowOverviewPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Flow Overview"
        description="WAH4PC acts as a central hub for secure, standardized FHIR patient data exchange between healthcare systems."
      />

      <Section
        title="Architecture Overview"
        description="WAH4PC is a Go-based API gateway that orchestrates asynchronous patient data exchange between registered healthcare providers (hospitals, clinics, labs, pharmacies)."
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <Mermaid chart={ARCHITECTURE_DIAGRAM} />
        </div>
      </Section>

      <Divider />

      <Section title="Complete Sequence Diagram">
        <p className="text-slate-700 mb-4">
          The full request-response flow showing all phases of the data exchange:
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 overflow-x-auto">
          <Mermaid chart={SEQUENCE_DIAGRAM} />
        </div>
      </Section>

      <Divider />

      <Section title="Flow Phases Explained" className="space-y-6">
        <div className="space-y-4">
          {FLOW_PHASES.map((phase) => (
            <StepCard key={phase.step} step={phase.step} title={phase.title}>
              <p className="text-slate-600 text-sm leading-relaxed">
                {phase.description}
              </p>
              {phase.callbacks && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {phase.callbacks.map((cb) => (
                    <CallbackBox key={cb.label} label={cb.label} description={cb.description} />
                  ))}
                </div>
              )}
            </StepCard>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title="Key Concepts" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {KEY_CONCEPTS.map((concept) => (
            <InfoBox key={concept.title} title={concept.title} variant="muted">
              <p className="text-slate-600 text-sm leading-relaxed">
                {concept.description}
              </p>
            </InfoBox>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title="Request Status Lifecycle" className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <Mermaid chart={STATUS_STATE_DIAGRAM} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STATUS_LIFECYCLE.map((item) => (
            <StatusCard key={item.status} status={item.status} description={item.description} />
          ))}
        </div>
      </Section>
    </div>
  );
}