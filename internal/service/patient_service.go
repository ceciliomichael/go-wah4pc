package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/wah4pc/gateway/internal/model"
	"github.com/wah4pc/gateway/internal/repository"
	"github.com/wah4pc/gateway/pkg/httpclient"
)

var (
	ErrRequestorNotFound   = errors.New("requestor provider not found")
	ErrTargetNotFound      = errors.New("target provider not found")
	ErrInvalidFromProvider = errors.New("response fromProviderId does not match request targetProviderId")
)

type PatientService struct {
	providerRepo   *repository.ProviderRepository
	requestRepo    *repository.RequestRepository
	responseRepo   *repository.ResponseRepository
	requestCounter int
}

func NewPatientService(
	providerRepo *repository.ProviderRepository,
	requestRepo *repository.RequestRepository,
	responseRepo *repository.ResponseRepository,
) *PatientService {
	return &PatientService{
		providerRepo:   providerRepo,
		requestRepo:    requestRepo,
		responseRepo:   responseRepo,
		requestCounter: 0,
	}
}

type CreateRequestInput struct {
	RequestorProviderID string
	TargetProviderID    string
	CorrelationKey      string
	PatientReference    model.PatientReference
	FHIRConstraints     model.FHIRConstraints
	Metadata            model.RequestMetadata
}

func (s *PatientService) CreateRequest(input CreateRequestInput) (*model.PatientRequest, error) {
	if !s.providerRepo.Exists(input.RequestorProviderID) {
		return nil, ErrRequestorNotFound
	}

	if !s.providerRepo.Exists(input.TargetProviderID) {
		return nil, ErrTargetNotFound
	}

	now := time.Now().UTC()
	s.requestCounter++
	requestID := fmt.Sprintf("REQ-%s-%04d", now.Format("20060102"), s.requestCounter)

	if input.FHIRConstraints.ResourceType == "" {
		input.FHIRConstraints.ResourceType = "Patient"
	}
	if input.FHIRConstraints.Version == "" {
		input.FHIRConstraints.Version = "4.0.1"
	}

	request := model.PatientRequest{
		RequestID:           requestID,
		RequestorProviderID: input.RequestorProviderID,
		TargetProviderID:    input.TargetProviderID,
		CorrelationKey:      input.CorrelationKey,
		PatientReference:    input.PatientReference,
		FHIRConstraints:     input.FHIRConstraints,
		Metadata:            input.Metadata,
		Status:              model.RequestStatusPending,
		CreatedAt:           now.Format(time.RFC3339),
		UpdatedAt:           now.Format(time.RFC3339),
	}

	if err := s.requestRepo.Create(request); err != nil {
		return nil, err
	}

	// Push request to target provider
	go s.pushToTarget(&request)

	return &request, nil
}

// RequestCallbackPayload is the payload sent to target provider when a new request is created
type RequestCallbackPayload struct {
	RequestID           string                 `json:"requestId"`
	RequestorProviderID string                 `json:"requestorProviderId"`
	TargetProviderID    string                 `json:"targetProviderId"`
	PatientReference    model.PatientReference `json:"patientReference"`
	FHIRConstraints     model.FHIRConstraints  `json:"fhirConstraints"`
	Metadata            model.RequestMetadata  `json:"metadata,omitempty"`
	CreatedAt           string                 `json:"createdAt"`
}

func (s *PatientService) pushToTarget(request *model.PatientRequest) {
	target, err := s.providerRepo.GetByID(request.TargetProviderID)
	if err != nil {
		log.Printf("push to target: failed to get target provider %s: %v", request.TargetProviderID, err)
		return
	}

	if target.Callback.PatientRequest == "" {
		log.Printf("push to target: target %s has no patientRequest callback URL configured", request.TargetProviderID)
		return
	}

	payload := RequestCallbackPayload{
		RequestID:           request.RequestID,
		RequestorProviderID: request.RequestorProviderID,
		TargetProviderID:    request.TargetProviderID,
		PatientReference:    request.PatientReference,
		FHIRConstraints:     request.FHIRConstraints,
		Metadata:            request.Metadata,
		CreatedAt:           request.CreatedAt,
	}

	if err := httpclient.PostJSON(target.Callback.PatientRequest, payload); err != nil {
		log.Printf("push to target: failed to POST to %s: %v", target.Callback.PatientRequest, err)
		return
	}

	log.Printf("push to target: successfully sent request %s to %s", request.RequestID, target.Callback.PatientRequest)
}

type ReceiveResponseInput struct {
	RequestID      string
	FromProviderID string
	FHIRPatient    json.RawMessage
	Status         model.RequestStatus
	Error          string
}

func (s *PatientService) ReceiveResponse(input ReceiveResponseInput) (*model.PatientResponse, error) {
	request, err := s.requestRepo.GetByID(input.RequestID)
	if err != nil {
		return nil, err
	}

	if request.TargetProviderID != input.FromProviderID {
		return nil, ErrInvalidFromProvider
	}

	now := time.Now().UTC()

	response := model.PatientResponse{
		RequestID:      input.RequestID,
		FromProviderID: input.FromProviderID,
		FHIRPatient:    input.FHIRPatient,
		Status:         input.Status,
		Error:          input.Error,
		ReceivedAt:     now.Format(time.RFC3339),
	}

	if err := s.responseRepo.Create(response); err != nil {
		return nil, err
	}

	request.Status = input.Status
	request.UpdatedAt = now.Format(time.RFC3339)
	if err := s.requestRepo.Update(*request); err != nil {
		return nil, err
	}

	// Push callback to requestor if status is COMPLETED
	if input.Status == model.RequestStatusCompleted {
		s.pushToRequestor(request.RequestorProviderID, &response)
	}

	return &response, nil
}

type CallbackPayload struct {
	RequestID      string              `json:"requestId"`
	FromProviderID string              `json:"fromProviderId"`
	ToProviderID   string              `json:"toProviderId"`
	Status         model.RequestStatus `json:"status"`
	FHIRPatient    json.RawMessage     `json:"fhirPatient,omitempty"`
	Error          string              `json:"error,omitempty"`
}

func (s *PatientService) pushToRequestor(requestorProviderID string, response *model.PatientResponse) {
	requestor, err := s.providerRepo.GetByID(requestorProviderID)
	if err != nil {
		log.Printf("push callback: failed to get requestor provider %s: %v", requestorProviderID, err)
		return
	}

	if requestor.Callback.PatientResponse == "" {
		log.Printf("push callback: requestor %s has no callback URL configured", requestorProviderID)
		return
	}

	payload := CallbackPayload{
		RequestID:      response.RequestID,
		FromProviderID: response.FromProviderID,
		ToProviderID:   requestorProviderID,
		Status:         response.Status,
		FHIRPatient:    response.FHIRPatient,
		Error:          response.Error,
	}

	if err := httpclient.PostJSON(requestor.Callback.PatientResponse, payload); err != nil {
		log.Printf("push callback: failed to POST to %s: %v", requestor.Callback.PatientResponse, err)
		return
	}

	log.Printf("push callback: successfully sent to %s for request %s", requestor.Callback.PatientResponse, response.RequestID)
}

type GetResponseResult struct {
	RequestID           string              `json:"requestId"`
	RequestorProviderID string              `json:"requestorProviderId"`
	TargetProviderID    string              `json:"targetProviderId"`
	Status              model.RequestStatus `json:"status"`
	FHIRPatient         json.RawMessage     `json:"fhirPatient,omitempty"`
	Error               string              `json:"error,omitempty"`
	CompletedAt         string              `json:"completedAt,omitempty"`
}

func (s *PatientService) GetResponse(requestID string) (*GetResponseResult, error) {
	request, err := s.requestRepo.GetByID(requestID)
	if err != nil {
		return nil, err
	}

	result := &GetResponseResult{
		RequestID:           request.RequestID,
		RequestorProviderID: request.RequestorProviderID,
		TargetProviderID:    request.TargetProviderID,
		Status:              request.Status,
	}

	if request.Status == model.RequestStatusPending {
		return result, nil
	}

	response, err := s.responseRepo.GetByRequestID(requestID)
	if err != nil {
		return result, nil
	}

	result.FHIRPatient = response.FHIRPatient
	result.Error = response.Error
	result.CompletedAt = response.ReceivedAt

	return result, nil
}

// GetPendingRequestsForTarget returns all pending requests for a target provider (polling endpoint)
func (s *PatientService) GetPendingRequestsForTarget(targetProviderID string) ([]model.PatientRequest, error) {
	if !s.providerRepo.Exists(targetProviderID) {
		return nil, ErrTargetNotFound
	}

	requests, err := s.requestRepo.GetByTargetProvider(targetProviderID, model.RequestStatusPending)
	if err != nil {
		return nil, err
	}

	if requests == nil {
		requests = []model.PatientRequest{}
	}

	return requests, nil
}
