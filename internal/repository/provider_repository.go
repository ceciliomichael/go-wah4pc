package repository

import (
	"errors"

	"github.com/wah4pc/gateway/internal/model"
)

var (
	ErrProviderNotFound      = errors.New("provider not found")
	ErrProviderAlreadyExists = errors.New("provider with this ID already exists")
)

type ProviderRepository struct {
	store      *JSONStore
	collection string
}

func NewProviderRepository(store *JSONStore) *ProviderRepository {
	return &ProviderRepository{
		store:      store,
		collection: "providers",
	}
}

func (r *ProviderRepository) GetAll() ([]model.Provider, error) {
	var providers []model.Provider
	if err := r.store.Load(r.collection, &providers); err != nil {
		return nil, err
	}
	if providers == nil {
		providers = []model.Provider{}
	}
	return providers, nil
}

func (r *ProviderRepository) GetByID(providerID string) (*model.Provider, error) {
	providers, err := r.GetAll()
	if err != nil {
		return nil, err
	}

	for _, p := range providers {
		if p.ProviderID == providerID {
			return &p, nil
		}
	}

	return nil, ErrProviderNotFound
}

func (r *ProviderRepository) Create(provider model.Provider) error {
	providers, err := r.GetAll()
	if err != nil {
		return err
	}

	// Check for duplicate provider ID
	for _, p := range providers {
		if p.ProviderID == provider.ProviderID {
			return ErrProviderAlreadyExists
		}
	}

	providers = append(providers, provider)
	return r.store.Save(r.collection, providers)
}

func (r *ProviderRepository) Exists(providerID string) bool {
	_, err := r.GetByID(providerID)
	return err == nil
}
