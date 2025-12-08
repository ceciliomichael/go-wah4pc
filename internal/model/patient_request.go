package model

import "encoding/json"

type RequestStatus string

const (
	RequestStatusPending   RequestStatus = "PENDING"
	RequestStatusCompleted RequestStatus = "COMPLETED"
	RequestStatusFailed    RequestStatus = "FAILED"
)

type PatientIdentifier struct {
	System string `json:"system"`
	Value  string `json:"value"`
}

type PatientReference struct {
	ID          string              `json:"id,omitempty"`
	Identifiers []PatientIdentifier `json:"identifiers,omitempty"`
}

type FHIRConstraints struct {
	ResourceType string `json:"resourceType"`
	Version      string `json:"version"`
}

type RequestMetadata struct {
	Reason string `json:"reason,omitempty"`
	Notes  string `json:"notes,omitempty"`
}

type PatientRequest struct {
	RequestID           string           `json:"requestId"`
	RequestorProviderID string           `json:"requestorProviderId"`
	TargetProviderID    string           `json:"targetProviderId"`
	CorrelationKey      string           `json:"correlationKey,omitempty"`
	PatientReference    PatientReference `json:"patientReference"`
	FHIRConstraints     FHIRConstraints  `json:"fhirConstraints"`
	Metadata            RequestMetadata  `json:"metadata,omitempty"`
	Status              RequestStatus    `json:"status"`
	CreatedAt           string           `json:"createdAt"`
	UpdatedAt           string           `json:"updatedAt"`
}

type PatientResponse struct {
	RequestID      string          `json:"requestId"`
	FromProviderID string          `json:"fromProviderId"`
	FHIRPatient    json.RawMessage `json:"fhirPatient,omitempty"`
	Status         RequestStatus   `json:"status"`
	Error          string          `json:"error,omitempty"`
	ReceivedAt     string          `json:"receivedAt"`
}
