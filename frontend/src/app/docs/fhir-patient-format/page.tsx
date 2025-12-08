import { CodeBlock } from "@/components/ui/code-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  Section,
  Divider,
  Alert,
  InfoBox,
  LinkCardGrid,
  PropertyTable,
  SimpleTable,
  StatusBadge,
  DataTypeExample,
} from "@/components/docs";

// Supported resources data
const SUPPORTED_RESOURCES = [
  { name: "Patient", status: "supported" as const, profile: "PH Core Patient", description: "Demographics and administrative information about a patient" },
  { name: "Observation", status: "planned" as const, profile: "-", description: "Measurements and simple assertions (vitals, lab results)" },
  { name: "Encounter", status: "planned" as const, profile: "-", description: "Healthcare interactions (visits, admissions)" },
  { name: "Condition", status: "planned" as const, profile: "-", description: "Clinical conditions, problems, diagnoses" },
  { name: "MedicationRequest", status: "planned" as const, profile: "-", description: "Prescription and medication orders" },
  { name: "DiagnosticReport", status: "planned" as const, profile: "-", description: "Lab reports, imaging studies, pathology" },
];

// Patient profile info
const PATIENT_PROFILE_INFO = [
  { label: "Profile Name", value: "PH Core Patient" },
  { label: "Profile URL", value: "https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient", valueClassName: "font-mono text-xs break-all" },
  { label: "Base Definition", value: "http://hl7.org/fhir/StructureDefinition/Patient", valueClassName: "font-mono text-xs" },
  { label: "FHIR Version", value: "R4 (4.0.1)" },
];

// Core properties
const CORE_PROPERTIES = [
  { name: "resourceType", type: "string", required: true, description: 'Must be "Patient"' },
  { name: "id", type: "string", required: false, description: "Logical id of this resource" },
  { name: "meta.profile", type: "uri[]", required: false, description: "Profiles this resource claims to conform to" },
  { name: "identifier", type: "Identifier[]", required: false, description: "Patient identifiers (MRN, PhilHealth ID, etc.)" },
  { name: "name", type: "HumanName[]", required: false, description: "Names associated with the patient" },
  { name: "gender", type: "code", required: false, description: "male | female | other | unknown" },
  { name: "birthDate", type: "date", required: false, description: "Date of birth (YYYY-MM-DD)" },
  { name: "address", type: "Address[]", required: false, description: "Addresses for the patient" },
  { name: "telecom", type: "ContactPoint[]", required: false, description: "Contact details (phone, email)" },
  { name: "maritalStatus", type: "CodeableConcept", required: false, description: "Marital status of the patient" },
  { name: "contact", type: "BackboneElement[]", required: false, description: "Emergency contacts and next-of-kin" },
  { name: "extension", type: "Extension[]", required: false, description: "Additional content (PH Core extensions)" },
];

// PH Core extensions
const PH_EXTENSIONS = [
  { name: "Indigenous People", url: "https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people", type: "boolean", description: "Whether the patient belongs to an indigenous group" },
  { name: "Nationality", url: "http://hl7.org/fhir/StructureDefinition/patient-nationality", type: "CodeableConcept", description: "Patient's nationality using ISO 3166 country codes" },
];

// Data type examples
const DATA_TYPES = [
  {
    title: "HumanName",
    description: "Represents a person's name with structured components.",
    code: `{
  "use": "official",
  "family": "Dela Cruz",
  "given": ["Juan", "Miguel"],
  "prefix": ["Dr."],
  "suffix": ["Jr."]
}`,
  },
  {
    title: "Identifier",
    description: "A unique identifier with a system namespace.",
    code: `{
  "system": "https://www.philhealth.gov.ph",
  "value": "PH-123456789"
}`,
  },
  {
    title: "Address",
    description: "Physical or postal address.",
    code: `{
  "use": "home",
  "line": ["123 Rizal Street"],
  "city": "Manila",
  "state": "Metro Manila",
  "postalCode": "1000",
  "country": "PH"
}`,
  },
  {
    title: "ContactPoint",
    description: "Contact details like phone or email.",
    code: `{
  "system": "phone",
  "value": "+63-917-123-4567",
  "use": "mobile"
}`,
  },
  {
    title: "CodeableConcept",
    description: "A coded value with optional text representation.",
    code: `{
  "coding": [
    {
      "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
      "code": "M",
      "display": "Married"
    }
  ],
  "text": "Married"
}`,
  },
];

// Future resources
const FUTURE_RESOURCES = [
  { title: "Observation", description: "Vital signs, lab results, and clinical measurements. Enables sharing of diagnostic data between providers." },
  { title: "Encounter", description: "Patient visits, admissions, and healthcare interactions. Tracks the context of care delivery." },
  { title: "Condition", description: "Diagnoses, problems, and health concerns. Enables sharing of clinical problem lists." },
  { title: "MedicationRequest", description: "Prescriptions and medication orders. Supports medication reconciliation across providers." },
  { title: "DiagnosticReport", description: "Lab reports, imaging studies, and pathology results. Enables sharing of diagnostic findings." },
  { title: "AllergyIntolerance", description: "Allergies and adverse reactions. Critical for patient safety across care settings." },
];

// External resources
const EXTERNAL_RESOURCES = [
  { href: "https://hl7.org/fhir/R4/patient.html", title: "HL7 FHIR Patient", description: "Official FHIR R4 Patient resource specification" },
  { href: "https://hl7.org/fhir/R4/datatypes.html", title: "FHIR Data Types", description: "Complete reference for FHIR data types" },
];

// Code examples
const COMPLETE_PATIENT_EXAMPLE = `{
  "resourceType": "Patient",
  "id": "patient-12345",
  "meta": {
    "profile": [
      "https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient"
    ]
  },
  "extension": [
    {
      "url": "https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people",
      "valueBoolean": false
    },
    {
      "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
      "extension": [
        {
          "url": "code",
          "valueCodeableConcept": {
            "coding": [
              {
                "system": "urn:iso:std:iso:3166",
                "code": "PH",
                "display": "Philippines"
              }
            ]
          }
        }
      ]
    }
  ],
  "identifier": [
    {
      "system": "https://www.philhealth.gov.ph",
      "value": "PH-123456789"
    },
    {
      "system": "http://hospital.example/mrn",
      "value": "MRN-ABC-12345"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Dela Cruz",
      "given": ["Juan", "Miguel"],
      "suffix": ["Jr."]
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-15",
  "address": [
    {
      "use": "home",
      "line": ["123 Rizal Street", "Barangay San Antonio"],
      "city": "Manila",
      "state": "Metro Manila",
      "postalCode": "1000",
      "country": "PH"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+63-917-123-4567",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "juan.delacruz@email.com",
      "use": "home"
    }
  ],
  "maritalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        "code": "M",
        "display": "Married"
      }
    ]
  },
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "N",
              "display": "Next-of-Kin"
            }
          ]
        }
      ],
      "name": {
        "family": "Dela Cruz",
        "given": ["Maria"]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+63-918-987-6543"
        }
      ]
    }
  ]
}`;

const MINIMAL_PATIENT_EXAMPLE = `{
  "resourceType": "Patient",
  "id": "patient-minimal",
  "name": [
    {
      "family": "Santos",
      "given": ["Maria"]
    }
  ],
  "gender": "female",
  "birthDate": "1985-03-20"
}`;

const INDIGENOUS_EXTENSION_EXAMPLE = `{
  "url": "https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people",
  "valueBoolean": true
}`;

const NATIONALITY_EXTENSION_EXAMPLE = `{
  "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
  "extension": [
    {
      "url": "code",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:iso:std:iso:3166",
            "code": "PH",
            "display": "Philippines"
          }
        ]
      }
    }
  ]
}`;

export default function FhirPatientFormatPage() {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageHeader
        title="FHIR Resource Formats"
        description="WAH4PC exchanges healthcare data using HL7 FHIR R4 (4.0.1) resources. This page documents the supported resource formats and profiles."
      />

      <Section
        title="Supported Resources"
        description="WAH4PC currently supports the following FHIR resources. Additional resources will be added in future versions."
      >
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUPPORTED_RESOURCES.map((resource) => (
                <TableRow key={resource.name}>
                  <TableCell className={`font-mono font-medium ${resource.status === "planned" ? "text-slate-400" : ""}`}>
                    {resource.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={resource.status} />
                  </TableCell>
                  <TableCell className={`text-xs ${resource.status === "planned" ? "text-slate-400" : ""}`}>
                    {resource.profile}
                  </TableCell>
                  <TableCell className={resource.status === "planned" ? "text-slate-400" : ""}>
                    {resource.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Alert variant="info" title="Note">
          WAH4PC currently stores and forwards FHIR resources as raw JSON without validation. Server-side validation against profiles may be added in a future version.
        </Alert>
      </Section>

      <Divider />

      <Section title="Patient Resource">
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status="supported" />
        </div>
        <p className="text-slate-700 mb-4">
          The Patient resource covers data about patients involved in healthcare processes. WAH4PC uses the PH Core Patient profile based on FHIR R4.
        </p>
        <SimpleTable rows={PATIENT_PROFILE_INFO} />
      </Section>

      <Divider />

      <Section
        title="Patient: Complete Example"
        description="A fully populated Patient resource with PH Core extensions:"
      >
        <CodeBlock language="json" code={COMPLETE_PATIENT_EXAMPLE} />
      </Section>

      <Divider />

      <Section title="Patient: Core Properties">
        <PropertyTable fields={CORE_PROPERTIES} showRequired={false} />
      </Section>

      <Divider />

      <Section
        title="Patient: PH Core Extensions"
        description="These extensions are specific to the PH Core Patient profile for Philippine healthcare:"
      >
        <div className="rounded-lg border border-slate-200 overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Extension</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PH_EXTENSIONS.map((ext) => (
                <TableRow key={ext.name}>
                  <TableCell className="font-medium">{ext.name}</TableCell>
                  <TableCell className="font-mono text-xs break-all">{ext.url}</TableCell>
                  <TableCell>{ext.type}</TableCell>
                  <TableCell>{ext.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-slate-900">Extension Examples</h3>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Indigenous People Extension</h4>
            <CodeBlock language="json" code={INDIGENOUS_EXTENSION_EXAMPLE} />
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Nationality Extension</h4>
            <CodeBlock language="json" code={NATIONALITY_EXTENSION_EXAMPLE} />
          </div>
        </div>
      </Section>

      <Divider />

      <Section
        title="Patient: Minimal Example"
        description="A minimal Patient resource with only the essential fields:"
      >
        <CodeBlock language="json" code={MINIMAL_PATIENT_EXAMPLE} />
      </Section>

      <Divider />

      <Section
        title="Common Data Types"
        description="FHIR uses complex data types for structured information. Here are the most commonly used types in Patient resources:"
      >
        <div className="space-y-6">
          {DATA_TYPES.map((dataType) => (
            <DataTypeExample
              key={dataType.title}
              title={dataType.title}
              description={dataType.description}
              code={dataType.code}
            />
          ))}
        </div>
      </Section>

      <Divider />

      <Section
        title="Future Resources"
        description="The following FHIR resources are planned for future WAH4PC releases:"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {FUTURE_RESOURCES.map((resource) => (
            <InfoBox key={resource.title} title={resource.title} variant="muted">
              <p className="text-sm text-slate-600">{resource.description}</p>
            </InfoBox>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title="Resources">
        <LinkCardGrid>
          {EXTERNAL_RESOURCES.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900 mb-1">{resource.title}</h3>
              <p className="text-sm text-slate-600">{resource.description}</p>
            </a>
          ))}
        </LinkCardGrid>
      </Section>
    </div>
  );
}