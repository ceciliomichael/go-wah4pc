package repository

import (
	"errors"

	"github.com/wah4pc/gateway/internal/model"
)

var ErrRequestNotFound = errors.New("request not found")

type RequestRepository struct {
	store      *JSONStore
	collection string
}

func NewRequestRepository(store *JSONStore) *RequestRepository {
	return &RequestRepository{
		store:      store,
		collection: "requests",
	}
}

func (r *RequestRepository) GetAll() ([]model.PatientRequest, error) {
	var requests []model.PatientRequest
	if err := r.store.Load(r.collection, &requests); err != nil {
		return nil, err
	}
	if requests == nil {
		requests = []model.PatientRequest{}
	}
	return requests, nil
}

func (r *RequestRepository) GetByID(requestID string) (*model.PatientRequest, error) {
	requests, err := r.GetAll()
	if err != nil {
		return nil, err
	}

	for _, req := range requests {
		if req.RequestID == requestID {
			return &req, nil
		}
	}

	return nil, ErrRequestNotFound
}

func (r *RequestRepository) GetByTargetProvider(targetProviderID string, status model.RequestStatus) ([]model.PatientRequest, error) {
	requests, err := r.GetAll()
	if err != nil {
		return nil, err
	}

	var filtered []model.PatientRequest
	for _, req := range requests {
		if req.TargetProviderID == targetProviderID && req.Status == status {
			filtered = append(filtered, req)
		}
	}

	return filtered, nil
}

func (r *RequestRepository) Create(request model.PatientRequest) error {
	requests, err := r.GetAll()
	if err != nil {
		return err
	}

	requests = append(requests, request)
	return r.store.Save(r.collection, requests)
}

func (r *RequestRepository) Update(request model.PatientRequest) error {
	requests, err := r.GetAll()
	if err != nil {
		return err
	}

	for i, req := range requests {
		if req.RequestID == request.RequestID {
			requests[i] = request
			return r.store.Save(r.collection, requests)
		}
	}

	return ErrRequestNotFound
}
