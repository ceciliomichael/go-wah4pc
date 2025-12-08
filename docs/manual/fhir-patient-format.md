# FHIR Patient Resource Format (PH Core)

WAH4PC uses the **PH Core Patient** profile based on FHIR R4 (4.0.1).

> **Note:** WAH4PC currently does **not validate** the FHIR format. It stores and forwards `fhirPatient` as raw JSON. Validation may be added in a future version.

---

## Profile Information

| Property | Value |
|----------|-------|
| **Profile Name** | PH Core Patient |
| **Profile URL** | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient` |
| **Base Definition** | `http://hl7.org/fhir/StructureDefinition/Patient` |
| **FHIR Version** | R4 (4.0.1) |

---

## Minimum Example

```json
{
  "resourceType": "Patient",
  "id": "patient-id",
  "extension": [
    {
      "url": "https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people",
      "valueBoolean": false
    }
  ]
}
```

> `extension` is **required** (cardinality `1..*`), and `indigenousPeople` extension is **required** (`1..1`).

---

## Complete Example

```json
{
  "resourceType": "Patient",
  "id": "pat-12345",
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
    },
    {
      "url": "https://wah4pc-validation.echosphere.cfd/StructureDefinition/occupation",
      "valueString": "Software Engineer"
    }
  ],
  "identifier": [
    {
      "system": "https://www.philhealth.gov.ph",
      "value": "PH-123456789"
    },
    {
      "system": "http://hospital.example.com/mrn",
      "value": "MRN-001234"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Dela Cruz",
      "given": ["Juan", "Miguel"]
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-15",
  "address": [
    {
      "use": "home",
      "line": ["123 Rizal Street"],
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
      "value": "juan.delacruz@example.com"
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
  }
}
```

---

## Core Properties

| Field | Type | Cardinality | Required | Description |
|-------|------|-------------|----------|-------------|
| `id` | string | 0..1 | No | Logical ID of this artifact |
| `meta` | Meta | 0..1 | No | Metadata about the resource |
| `extension` | Extension | 1..* | **Yes** | Additional content defined by implementations |
| `identifier` | Identifier | 0..* | No | An identifier for this patient |
| `active` | boolean | 0..1 | No | Whether this patient's record is in active use |
| `name` | HumanName | 0..* | No | A name associated with the patient |
| `telecom` | ContactPoint | 0..* | No | A contact detail for the individual |
| `gender` | code | 0..1 | No | `male`, `female`, `other`, `unknown` |
| `birthDate` | date | 0..1 | No | The date of birth (YYYY-MM-DD) |
| `deceased[x]` | boolean / dateTime | 0..1 | No | Indicates if the individual is deceased |
| `address` | Address | 0..* | No | An address for the individual |
| `maritalStatus` | CodeableConcept | 0..1 | No | Marital (civil) status |
| `multipleBirth[x]` | boolean / integer | 0..1 | No | Whether patient is part of a multiple birth |
| `photo` | Attachment | 0..* | No | Image of the patient |
| `contact` | BackboneElement | 0..* | No | Contact party (guardian, partner, friend) |
| `communication` | BackboneElement | 0..* | No | Languages for communication |
| `generalPractitioner` | Reference | 0..* | No | Patient's nominated primary care provider |
| `managingOrganization` | Reference | 0..1 | No | Organization custodian of the patient record |
| `link` | BackboneElement | 0..* | No | Link to another patient resource |

---

## PH Core Extensions

These extensions are specific to the PH Core profile:

| Extension | Cardinality | Required | Profile URL |
|-----------|-------------|----------|-------------|
| `indigenousPeople` | 1..1 | **Yes** | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-people` |
| `indigenousGroup` | 0..* | No | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/indigenous-group` |
| `nationality` | 0..* | No | `http://hl7.org/fhir/StructureDefinition/patient-nationality` |
| `religion` | 0..* | No | `http://hl7.org/fhir/StructureDefinition/patient-religion` |
| `occupation` | 0..* | No | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/occupation` |
| `race` | 0..1 | No | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/race` |
| `educationalAttainment` | 0..1 | No | `https://wah4pc-validation.echosphere.cfd/StructureDefinition/educational-attainment` |

---

## PH Core Identifier Slices

| Slice Name | Description |
|------------|-------------|
| `PHCorePhilHealthID` | PhilHealth ID |
| `PHCorePddRegistration` | PDD Registration Number |

---

## Address Profile

Addresses should conform to:

```
https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-address
```

---

## Value Set Bindings

| Field | Strength | Value Set |
|-------|----------|-----------|
| `language` | preferred | `http://hl7.org/fhir/ValueSet/languages` |
| `gender` | required | `http://hl7.org/fhir/ValueSet/administrative-gender` |
| `maritalStatus` | required | `http://hl7.org/fhir/ValueSet/marital-status` |

---

## References

- [FHIR R4 Patient Resource](https://hl7.org/fhir/R4/patient.html)
- [PH Core Patient Profile](https://wah4pc-validation.echosphere.cfd/StructureDefinition/ph-core-patient)
