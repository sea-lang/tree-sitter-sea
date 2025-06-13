package tree_sitter_sea_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_sea "github.com/sea-lang/tree-sitter-sea/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_sea.Language())
	if language == nil {
		t.Errorf("Error loading Sea grammar")
	}
}
