

## Plan: Restore Reading & Writing JSON Files (Batch 1 of N)

You've uploaded 10 JSON files. I'll copy them into `public/data/` where the app expects them.

### Uploaded files → Target mapping

| Upload | Target Path | Topic |
|--------|------------|-------|
| boundaries-5.json | public/data/boundaries.json | Boundaries |
| cross_text_connections-2.json | public/data/cross_text_connections.json | Cross-Text Connections |
| detailed_questions-2.json | public/data/detailed_questions.json | Detail Questions |
| gap_fillings-2.json | public/data/gap_fillings.json | Gap Fillings |
| graphs-2.json | public/data/graphs.json | Graphs |
| inference-2.json | public/data/inference.json | Inferences |
| main_ideas-2.json | public/data/main_ideas.json | Main Ideas |
| main_purpose-2.json | public/data/main_purpose.json | Main Purpose |
| miscellaneous_topics.json | public/data/miscellaneous_topics.json | Miscellaneous Topics |
| modifiers_questions.json | public/data/modifiers_questions.json | Modifiers |

### Still missing (for next batches)

The loader in `questionUtils.ts` expects these additional files:
1. `subject_verb_agreement.json`
2. `verb_tenses.json`
3. `verb_forms.json`
4. `pronoun.json`
5. `parallel_structure.json`
6. `transitions.json`
7. `overall_structure.json`
8. `underlined_purpose.json`
9. `synonyms.json`
10. `support.json`
11. `weaken.json`
12. `quotation.json`
13. `rhetorical_synthesis.json`

### Implementation

Single step: Copy all 10 uploaded files to `public/data/` with the correct names (stripping the `-2`, `-5` suffixes).

No code changes needed — the existing `questionUtils.ts` loader already handles all these formats.

