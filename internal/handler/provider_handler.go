package handler

import (
	"encoding/json"
	"net/http"

	"github.com/wah4pc/gateway/internal/model"
	"github.com/wah4pc/gateway/internal/service"
)

type ProviderHandler struct {
	svc *service.ProviderService
}

func NewProviderHandler(svc *service.ProviderService) *ProviderHandler {
	return &ProviderHandler{svc: svc}
}

func (h *ProviderHandler) GetProviders(w http.ResponseWriter, r *http.Request) {
	providers, err := h.svc.GetAllProviders()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, providers)
}

type CreateProviderRequest struct {
	ProviderID string                  `json:"providerId"`
	Name       string                  `json:"name"`
	Type       model.ProviderType      `json:"type"`
	BaseURL    string                  `json:"baseUrl"`
	Endpoints  model.ProviderEndpoints `json:"endpoints"`
	Callback   model.ProviderCallback  `json:"callback"`
}

func (h *ProviderHandler) CreateProvider(w http.ResponseWriter, r *http.Request) {
	var req CreateProviderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ProviderID == "" || req.Name == "" {
		writeError(w, http.StatusBadRequest, "providerId and name are required")
		return
	}

	if req.BaseURL == "" {
		writeError(w, http.StatusBadRequest, "baseUrl is required")
		return
	}

	if req.Callback.PatientResponse == "" {
		writeError(w, http.StatusBadRequest, "callback.patientResponse is required")
		return
	}

	input := service.CreateProviderInput{
		ProviderID: req.ProviderID,
		Name:       req.Name,
		Type:       req.Type,
		BaseURL:    req.BaseURL,
		Endpoints:  req.Endpoints,
		Callback:   req.Callback,
	}

	provider, err := h.svc.CreateProvider(input)
	if err != nil {
		switch err {
		case service.ErrProviderAlreadyExists:
			writeError(w, http.StatusConflict, "provider with this ID already exists")
		default:
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusCreated, provider)
}
