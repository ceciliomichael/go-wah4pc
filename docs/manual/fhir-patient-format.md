# FHIR Resource Formats

WAH4PC exchanges healthcare data using HL7 FHIR R4 (4.0.1) resources. This page documents the supported resource formats and profiles.

---

## Supported Resources

WAH4PC currently supports the following FHIR resources. Additional resources will be added in future versions.

| Resource | Status | Profile | Description |
|----------|--------|---------|-------------|
| Patient | Supported | PH Core Patient | Demographics and administrative information about a patient |
| Observation | Planned | - | Measurements and simple assertions (vitals, lab results) |
| Encounter | Planned | - | Healthcare interactions (visits, admissions) |
| Condition | Planned | - | Clinical conditions, problems, diagnoses |
| MedicationRequest | Planned | - | Prescription and medication orders |
| DiagnosticReport | Planned | - | Lab reports, imaging studies, pathology |

**Note:** WAH4PC currently stores and forwards FHIR resources as raw JSON without validation. Server-side validation against profiles may be added in a future version.

---

## Patient Resource

The Patient resource covers data about patients involved in healthcare processes. WAH4PC uses the PH Core Patient profile based on FHIR R4.

### Profile Information

| Property | Value |
|----------|-------|
| **Profile Name** | PH Core Patient |
| **Profile URL** | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient` |
| **Base Definition** | `http://hl7.org/fhir/StructureDefinition/Patient` |
| **FHIR Version** | R4 (4.0.1) |

---

## Patient: Complete Example

A fully populated Patient resource with PH Core extensions:



---

## Patient: Core Properties

| Field | Type | Cardinality | Required | Description |
|-------|------|-------------|----------|-------------|
| `resourceType` | string | 1..1 | Yes | Must be "Patient" |
| `id` | string | 0..1 | No | Logical id of this resource |
| `meta.profile` | uri[] | 0..* | No | Profiles this resource claims to conform to |
| `identifier` | Identifier[] | 0..* | No | Patient identifiers (MRN, PhilHealth ID, etc.) |
| `name` | HumanName[] | 0..* | No | Names associated with the patient |
| `gender` | code | 0..1 | No | male \| female \| other \| unknown |
| `birthDate` | date | 0..1 | No | Date of birth (YYYY-MM-DD) |
| `address` | Address[] | 0..* | No | Addresses for the patient |
| `telecom` | ContactPoint[] | 0..* | No | Contact details (phone, email) |
| `maritalStatus` | CodeableConcept | 0..1 | No | Marital status of the patient |
| `contact` | BackboneElement[] | 0..* | No | Emergency contacts and next-of-kin |
| `extension` | Extension[] | 0..* | No | Additional content (PH Core extensions) |

---

## Patient: PH Core Extensions

These extensions are specific to the PH Core Patient profile for Philippine healthcare:

| Extension | URL | Type | Description |
|-----------|-----|------|-------------|
| Indigenous People | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people` | boolean | Whether the patient belongs to an indigenous group |
| Nationality | `http://hl7.org/fhir/StructureDefinition/patient-nationality` | CodeableConcept | Patient's nationality using ISO 3166 country codes |

### Extension Examples

**Indigenous People Extension:**



**Nationality Extension:**



---

## Patient: Minimal Example

A minimal Patient resource with only the essential fields:



---

## Common Data Types

FHIR uses complex data types for structured information. Here are the most commonly used types in Patient resources:

### HumanName

Represents a person's name with structured components.



### Identifier

A unique identifier with a system namespace.



### Address

Physical or postal address.



### ContactPoint

Contact details like phone or email.



### CodeableConcept

A coded value with optional text representation.



---

## Future Resources

The following FHIR resources are planned for future WAH4PC releases:

| Resource | Description |
|----------|-------------|
| **Observation** | Vital signs, lab results, and clinical measurements. Enables sharing of diagnostic data between providers. |
| **Encounter** | Patient visits, admissions, and healthcare interactions. Tracks the context of care delivery. |
| **Condition** | Diagnoses, problems, and health concerns. Enables sharing of clinical problem lists. |
| **MedicationRequest** | Prescriptions and medication orders. Supports medication reconciliation across providers. |
| **DiagnosticReport** | Lab reports, imaging studies, and pathology results. Enables sharing of diagnostic findings. |
| **AllergyIntolerance** | Allergies and adverse reactions. Critical for patient safety across care settings. |

---

## External Resources

- [HL7 FHIR Patient](https://hl7.org/fhir/R4/patient.html) - Official FHIR R4 Patient resource specification
- [FHIR Data Types](https://hl7.org/fhir/R4/datatypes.html) - Complete reference for FHIR data types