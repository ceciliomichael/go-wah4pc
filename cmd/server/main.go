package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/wah4pc/gateway/internal/handler"
	"github.com/wah4pc/gateway/internal/repository"
	"github.com/wah4pc/gateway/internal/service"
)

func main() {
	store, err := repository.NewJSONStore("./data")
	if err != nil {
		log.Fatalf("failed to initialize store: %v", err)
	}

	providerRepo := repository.NewProviderRepository(store)
	requestRepo := repository.NewRequestRepository(store)
	responseRepo := repository.NewResponseRepository(store)

	providerSvc := service.NewProviderService(providerRepo)
	patientSvc := service.NewPatientService(providerRepo, requestRepo, responseRepo)

	providerHandler := handler.NewProviderHandler(providerSvc)
	patientHandler := handler.NewPatientHandler(patientSvc)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/v1", func(r chi.Router) {
		r.Get("/provider", providerHandler.GetProviders)
		r.Post("/provider", providerHandler.CreateProvider)

		r.Route("/fhir/patient", func(r chi.Router) {
			r.Post("/request", patientHandler.CreateRequest)
			r.Get("/request", patientHandler.GetPendingRequests)
			r.Post("/respond", patientHandler.ReceiveResponse)
			r.Get("/response", patientHandler.GetResponse)
		})
	})

	log.Println("WAH4PC API Gateway starting on :3043")
	if err := http.ListenAndServe(":3043", r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
