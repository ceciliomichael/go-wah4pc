package model

type ProviderType string

const (
	ProviderTypeHospital ProviderType = "HOSPITAL"
	ProviderTypeClinic   ProviderType = "CLINIC"
	ProviderTypeLab      ProviderType = "LAB"
	ProviderTypePharmacy ProviderType = "PHARMACY"
	ProviderTypeOther    ProviderType = "OTHER"
)

type ProviderEndpoints struct {
	PatientRequest string `json:"patientRequest,omitempty"`
}

type ProviderCallback struct {
	PatientRequest  string `json:"patientRequest,omitempty"`
	PatientResponse string `json:"patientResponse,omitempty"`
}

type Provider struct {
	ProviderID string            `json:"providerId"`
	Name       string            `json:"name"`
	Type       ProviderType      `json:"type"`
	BaseURL    string            `json:"baseUrl"`
	Endpoints  ProviderEndpoints `json:"endpoints,omitempty"`
	Callback   ProviderCallback  `json:"callback"`
	CreatedAt  string            `json:"createdAt"`
	UpdatedAt  string            `json:"updatedAt"`
}
