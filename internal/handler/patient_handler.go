package handler

import (
	"encoding/json"
	"net/http"

	"github.com/wah4pc/gateway/internal/model"
	"github.com/wah4pc/gateway/internal/repository"
	"github.com/wah4pc/gateway/internal/service"
)

type PatientHandler struct {
	svc *service.PatientService
}

func NewPatientHandler(svc *service.PatientService) *PatientHandler {
	return &PatientHandler{svc: svc}
}

type PatientRequestBody struct {
	RequestorProviderID string                 `json:"requestorProviderId"`
	TargetProviderID    string                 `json:"targetProviderId"`
	CorrelationKey      string                 `json:"correlationKey,omitempty"`
	PatientReference    model.PatientReference `json:"patientReference"`
	FHIRConstraints     model.FHIRConstraints  `json:"fhirConstraints,omitempty"`
	Metadata            model.RequestMetadata  `json:"metadata,omitempty"`
}

func (h *PatientHandler) CreateRequest(w http.ResponseWriter, r *http.Request) {
	var req PatientRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RequestorProviderID == "" || req.TargetProviderID == "" {
		writeError(w, http.StatusBadRequest, "requestorProviderId and targetProviderId are required")
		return
	}

	input := service.CreateRequestInput{
		RequestorProviderID: req.RequestorProviderID,
		TargetProviderID:    req.TargetProviderID,
		CorrelationKey:      req.CorrelationKey,
		PatientReference:    req.PatientReference,
		FHIRConstraints:     req.FHIRConstraints,
		Metadata:            req.Metadata,
	}

	request, err := h.svc.CreateRequest(input)
	if err != nil {
		switch err {
		case service.ErrRequestorNotFound:
			writeError(w, http.StatusBadRequest, "requestor provider not found")
		case service.ErrTargetNotFound:
			writeError(w, http.StatusBadRequest, "target provider not found")
		default:
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"requestId":           request.RequestID,
		"status":              request.Status,
		"requestorProviderId": request.RequestorProviderID,
		"targetProviderId":    request.TargetProviderID,
		"createdAt":           request.CreatedAt,
	})
}

type ReceiveRequestBody struct {
	RequestID      string              `json:"requestId"`
	FromProviderID string              `json:"fromProviderId"`
	FHIRPatient    json.RawMessage     `json:"fhirPatient,omitempty"`
	Status         model.RequestStatus `json:"status"`
	Error          string              `json:"error,omitempty"`
}

func (h *PatientHandler) ReceiveResponse(w http.ResponseWriter, r *http.Request) {
	var req ReceiveRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RequestID == "" || req.FromProviderID == "" {
		writeError(w, http.StatusBadRequest, "requestId and fromProviderId are required")
		return
	}

	if req.Status == "" {
		req.Status = model.RequestStatusCompleted
	}

	input := service.ReceiveResponseInput{
		RequestID:      req.RequestID,
		FromProviderID: req.FromProviderID,
		FHIRPatient:    req.FHIRPatient,
		Status:         req.Status,
		Error:          req.Error,
	}

	response, err := h.svc.ReceiveResponse(input)
	if err != nil {
		switch err {
		case repository.ErrRequestNotFound:
			writeError(w, http.StatusNotFound, "request not found")
		case service.ErrInvalidFromProvider:
			writeError(w, http.StatusBadRequest, "fromProviderId does not match target provider")
		default:
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"requestId":  response.RequestID,
		"status":     response.Status,
		"receivedAt": response.ReceivedAt,
	})
}

func (h *PatientHandler) GetResponse(w http.ResponseWriter, r *http.Request) {
	requestID := r.URL.Query().Get("requestId")
	if requestID == "" {
		writeError(w, http.StatusBadRequest, "requestId query parameter is required")
		return
	}

	result, err := h.svc.GetResponse(requestID)
	if err != nil {
		switch err {
		case repository.ErrRequestNotFound:
			writeError(w, http.StatusNotFound, "request not found")
		default:
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// GetPendingRequests returns all pending requests for a target provider (polling endpoint)
func (h *PatientHandler) GetPendingRequests(w http.ResponseWriter, r *http.Request) {
	targetProviderID := r.URL.Query().Get("targetProviderId")
	if targetProviderID == "" {
		writeError(w, http.StatusBadRequest, "targetProviderId query parameter is required")
		return
	}

	requests, err := h.svc.GetPendingRequestsForTarget(targetProviderID)
	if err != nil {
		switch err {
		case service.ErrTargetNotFound:
			writeError(w, http.StatusNotFound, "target provider not found")
		default:
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"targetProviderId": targetProviderID,
		"pendingRequests":  requests,
		"count":            len(requests),
	})
}
