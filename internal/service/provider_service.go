package service

import (
	"time"

	"github.com/wah4pc/gateway/internal/model"
	"github.com/wah4pc/gateway/internal/repository"
)

type ProviderService struct {
	repo *repository.ProviderRepository
}

func NewProviderService(repo *repository.ProviderRepository) *ProviderService {
	return &ProviderService{repo: repo}
}

func (s *ProviderService) GetAllProviders() ([]model.Provider, error) {
	return s.repo.GetAll()
}

func (s *ProviderService) GetProvider(providerID string) (*model.Provider, error) {
	return s.repo.GetByID(providerID)
}

type CreateProviderInput struct {
	ProviderID string
	Name       string
	Type       model.ProviderType
	BaseURL    string
	Endpoints  model.ProviderEndpoints
	Callback   model.ProviderCallback
}

func (s *ProviderService) CreateProvider(input CreateProviderInput) (*model.Provider, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	if input.Type == "" {
		input.Type = model.ProviderTypeOther
	}

	provider := model.Provider{
		ProviderID: input.ProviderID,
		Name:       input.Name,
		Type:       input.Type,
		BaseURL:    input.BaseURL,
		Endpoints:  input.Endpoints,
		Callback:   input.Callback,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := s.repo.Create(provider); err != nil {
		return nil, err
	}

	return &provider, nil
}

func (s *ProviderService) ProviderExists(providerID string) bool {
	return s.repo.Exists(providerID)
}
