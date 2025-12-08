package repository

import (
	"errors"

	"github.com/wah4pc/gateway/internal/model"
)

var ErrResponseNotFound = errors.New("response not found")

type ResponseRepository struct {
	store      *JSONStore
	collection string
}

func NewResponseRepository(store *JSONStore) *ResponseRepository {
	return &ResponseRepository{
		store:      store,
		collection: "responses",
	}
}

func (r *ResponseRepository) GetAll() ([]model.PatientResponse, error) {
	var responses []model.PatientResponse
	if err := r.store.Load(r.collection, &responses); err != nil {
		return nil, err
	}
	if responses == nil {
		responses = []model.PatientResponse{}
	}
	return responses, nil
}

func (r *ResponseRepository) GetByRequestID(requestID string) (*model.PatientResponse, error) {
	responses, err := r.GetAll()
	if err != nil {
		return nil, err
	}

	for _, resp := range responses {
		if resp.RequestID == requestID {
			return &resp, nil
		}
	}

	return nil, ErrResponseNotFound
}

func (r *ResponseRepository) Create(response model.PatientResponse) error {
	responses, err := r.GetAll()
	if err != nil {
		return err
	}

	responses = append(responses, response)
	return r.store.Save(r.collection, responses)
}
