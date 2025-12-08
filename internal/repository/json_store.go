package repository

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type JSONStore struct {
	basePath string
	mu       sync.RWMutex
}

func NewJSONStore(basePath string) (*JSONStore, error) {
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return nil, err
	}
	return &JSONStore{basePath: basePath}, nil
}

func (s *JSONStore) filePath(collection string) string {
	return filepath.Join(s.basePath, collection+".json")
}

func (s *JSONStore) Load(collection string, v interface{}) error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := os.ReadFile(s.filePath(collection))
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	return json.Unmarshal(data, v)
}

func (s *JSONStore) Save(collection string, v interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filePath(collection), data, 0644)
}
