

## Plan: Restore All Question Data Files

### Current State
- `public/data/` has 10 English JSON files (batch 1)
- `public/data/math/` is **empty** — all math files are missing
- 13 English files are still missing (batch 2 uploaded previously + 3 new ones)

### Files to Copy

**Batch 2 English files (uploaded previously):**

| Upload | Target |
|--------|--------|
| overall_structure-2.json | public/data/overall_structure.json |
| parallel_structure.json | public/data/parallel_structure.json |
| pronoun-4.json | public/data/pronoun.json |
| quotation-2.json | public/data/quotation.json |
| rhetorical_synthesis-2.json | public/data/rhetorical_synthesis.json |
| subject_verb_agreement.json | public/data/subject_verb_agreement.json |
| support-2.json | public/data/support.json |
| synonyms-2.json | public/data/synonyms.json |
| transitions-2.json | public/data/transitions.json |
| underlined_purpose-2.json | public/data/underlined_purpose.json |

**Batch 3 English files (just uploaded):**

| Upload | Target |
|--------|--------|
| weaken-2.json | public/data/weaken.json |
| verb_forms.json | public/data/verb_forms.json |
| verb_tenses.json | public/data/verb_tenses.json |

**Math + Diagram (zip files):**
- `math.zip` — needs to be extracted into `public/data/math/` (21 expected files: expressions, linear_equations, etc.)
- `diagram.zip` — likely contains diagram images referenced by questions

### Implementation Steps

1. **Copy all 13 remaining English JSON files** to `public/data/` with correct names
2. **Extract `math.zip`** contents into `public/data/math/` directory
3. **Extract `diagram.zip`** contents to appropriate location (likely `public/data/` or `public/images/`)
4. **Verify** the app loads all questions correctly

### Technical Notes
- No code changes needed — `questionUtils.ts` already has loaders for all 22 English topics
- `mathQuestionUtils.ts` already expects 21 math files in `/data/math/`
- The zip files cannot be directly extracted in Lovable, so I'll need to read them to understand their contents and copy individual files
- All JSON formats are already supported by the existing loader logic

