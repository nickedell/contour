// /data/defaultPlaybook.js
// Default, exact-match fallback for the Data Playbook (kept in sync with flat_index.jsx)
const defaultPlaybook = {
  meta: {
	breadcrumb: "EDA + Vector Personas Playbook",
	version: "1.1",
	author: "Nick Edell",
	org: "Infosys Consulting",
	date: "24 Sept 2025"
  },
  intro: {
	drawerTitle: "Data Playbook — Introduction",
	title: "From Survey Data to Decision-Ready Personas.\nAn AI-powered playbook.",
	body: [
	  "EDA → Personas → Decision Engine Framework",
	  "We have created a repeatable playbook that takes attitudinal and behavioural survey data (e.g. PTSB’s Reflecting Ireland survey) and transforms it into decision-ready personas.",
	  "Why this is useful:",
	  "• Evidence-based: Personas are grounded in actual data, not workshop anecdotes.",
	  "• Machine + human legibility: Personas are stored in JSON — the same file can be read by AI systems and rendered for humans via a lightweight UI.",
	  "• Consistency: All personas share the same schema, which makes them comparable, editable and versionable.",
	  "• Nuanced matching: Instead of rigid buckets, users are matched probabilistically to multiple personas via attribute weightings, enabling more personalised pathways.",
	  "• Extendable: The framework is not limited to surveys. Additional data sources (aggregated, anonymised transactional data) can enrich the attributes and sharpen the personas.",
	  "How to use it:",
	  "• Run EDA on incoming survey data to extract patterns and theme summaries.",
	  "• Define or refine the persona schema (single JSON template).",
	  "• Build personas by clustering building blocks, drafting narratives and filling schema attributes.",
	  "• Store personas as JSON and render them in a simple UI for stakeholders.",
	  "• Use the personas as inputs to a decision engine that recommends personalised, motivating playbooks.",
	  "A single source of truth that bridges design and data science: one framework that serves strategy workshops, client communications and AI-powered decision engines."
	]
  },
  sections: [
	{
	  key: "eda",
	  title: "EXPLORATORY DATA ANALYSIS (EDA)",
	  steps: [
		{
		  id: "eda-cleaning",
		  title: "1. Data Cleaning",
		  purpose: "Ensure comparability and avoid misleading results.",
		  activity:
			"Check for blanks, duplicates, inconsistent scales. Clean up region codes using the lookup table (Dublin, Rest of Leinster, Munster, Connacht, Ulster).",
		  output: "cleaned_data.xlsx",
		  llm_prompt: ""
		},
		{
		  id: "eda-categorise",
		  title: "2. Categorise Questions",
		  purpose: "Bring order to the survey.",
		  activity:
			"Tag each question as Demographic, Behavioural, Attitudinal, or Contextual. Group them into 5–6 themes (Budgeting, Saving, Housing, Digital, etc.). Use an LLM to speed up classification.",
		  output: "question_catalog.csv with categories and themes.",
		  llm_prompt:
			"Classify each of these survey questions into one of four categories (Demographic, Behavioural, Attitudinal, Contextual) and suggest a theme (e.g. Budgeting, Saving, Housing, Digital). Return results as a CSV with columns: question_id, question_text, category, theme."
		},
		{
		  id: "eda-visualise",
		  title: "3. Visualise Responses",
		  purpose: "Make the survey legible.",
		  activity:
			"Per-question bar charts by age. Per-theme line charts across age groups (lifecycle curves). Heatmaps of all questions × ages for pattern scanning.",
		  output: "/charts/ folder with images, ready for review",
		  llm_prompt: ""
		},
		{
		  id: "eda-insights",
		  title: "4. Extract Insights",
		  purpose: "Turn visuals into meaning.",
		  activity:
			"Review charts and note obvious patterns. Use an LLM to surface less obvious trends (“hidden correlations”).",
		  output: "“Findings Digest” — a 1–2 page bullet summary.",
		  llm_prompt:
			"Review the following survey charts and data. Identify clear patterns (obvious trends) and subtle correlations (less obvious). Summarise in 10 bullet points: 5 obvious, 5 subtle."
		},
		{
		  id: "eda-themes",
		  title: "5. Summarise Themes",
		  purpose: "Create compact building blocks.",
		  activity:
			"Write 1–2 sentences per theme describing overall patterns (e.g. “Budgeting discipline rises with age; optimism falls”).",
		  output: "theme_summaries.docx with 5–6 theme summaries.",
		  llm_prompt: ""
		}
	  ]
	},
	{
	  key: "personas",
	  title: "PERSONA CREATION",
	  steps: [
		{
		  id: "schema",
		  title: "6. Define Persona Schema (bridge step)",
		  purpose:
			"Translate EDA insights into a structured, machine-readable model.",
		  activity:
			"Decide what fields every persona must have (attributes, concerns, motivations, hooks, playbooks, lifecycle transitions). Fix scales for each attribute (e.g. 0–1, or low/med/high). Confirm JSON as the single source of truth.",
		  output: "persona_schema.json",
		  llm_prompt:
			"Based on these themes and attributes from EDA, propose a JSON schema for personas that includes attributes (0–1 scores), concerns, motivations, hooks, long-term benefits and recommended playbooks."
		},
		{
		  id: "blocks",
		  title: "7. Gather Building Blocks",
		  purpose:
			"Move from abstract theme insights to concrete persona ingredients.",
		  activity:
			"For each age stage, extract 5–6 distinctive behaviours, attitudes and motivations from the EDA summaries.",
		  output: "“Building blocks” table per age stage.",
		  llm_prompt: ""
		},
		{
		  id: "archetypes",
		  title: "8. Identify Archetypes",
		  purpose:
			"Cluster building blocks into recognisable, distinct personas.",
		  activity:
			"Group patterns into 4–6 archetypes per age stage. Give each a memorable name (e.g. “Carefree Digital Starter”, “Deposit-Focused Upgrader”).",
		  output: "Draft list of persona labels with defining features.",
		  llm_prompt: ""
		},
		{
		  id: "narratives",
		  title: "9. Draft Narratives",
		  purpose:
			"Humanise the data while keeping schema consistency.",
		  activity:
			"Use an LLM to generate 100–150 word persona stories based on the building blocks and attributes. Edit for clarity and tone. Add these narratives as the description field in the JSON schema.",
		  output: "Narrative fields embedded directly in personas.json.",
		  llm_prompt:
			"Write a 150-word persona narrative for a [age stage] individual who shows these attributes: [list attributes with scores]. Ensure the persona is relatable, consistent with data and focused on financial behaviours."
		},
		{
		  id: "populate",
		  title: "10. Populate Schema (JSON)",
		  purpose: "Create the machine-usable persona set.",
		  activity:
			"Fill each persona’s attributes, concerns, hooks and recommended playbooks into the schema. Ensure all personas share the same structure (schema).",
		  output: "personas_v1.json",
		  llm_prompt:
			"Fill this JSON template with values based on the following building blocks and narrative: [paste building blocks + draft narrative]. Ensure all numeric attributes are between 0–1 and playbooks are weighted appropriately."
		},
		{
		  id: "validate",
		  title: "11. Validate Personas",
		  purpose: "Check plausibility, distinctiveness and alignment with evidence.",
		  activity:
			"Internal review against EDA findings: do the numbers and narratives align? Confirm that personas are distinct but not caricatures. Ensure attributes add up to coherent behavioural profiles.",
		  output: "Refined persona set in JSON.",
		  llm_prompt:
			"Review this set of personas. Are they distinct from each other? Do the numeric attributes match the narrative descriptions? Suggest adjustments for plausibility and balance."
		},
		{
		  id: "transitions",
		  title: "12. Map Lifecycle Transitions",
		  purpose: "Connect personas across age and life stages.",
		  activity:
			"Sketch how personas may evolve across ages (linear and branching). Represent transitions in charts (Sankey, chord) and/or as structured JSON references (likely_transitions field).",
		  output: "Lifecycle map visual + transition fields in JSON.",
		  llm_prompt:
			"Given this set of personas across age stages, suggest likely lifecycle transitions between them. Represent these as a table of persona_id → persona_id mappings with probabilities."
		}
	  ]
	},
	{
	  key: "deploy",
	  title: "HUMAN REVIEW / SYSTEM DEPLOYMENT",
	  steps: [
		{
		  id: "ui-admin",
		  title: "13. Build UI & Admin Suite",
		  purpose:
			"Make the JSON legible for humans and editable for the team.",
		  activity:
			"Build a lightweight front-end (static site or Next.js app) to render persona cards directly from the JSON. /admin route provides a simple editor (form fields linked to JSON schema). On save, allow download of updated JSON (no database, no sensitive data).",
		  output:
			"Stakeholder-facing UI for workshops and presentations; Admin panel to create/update personas, producing fresh JSON.",
		  llm_prompt: ""
		},
		{
		  id: "version",
		  title: "14. Store & Version JSON",
		  purpose:
			"Maintain one single source of truth, traceable across iterations.",
		  activity:
			"Save persona JSON in GitHub (or equivalent) with version numbers (personas_v1.json, personas_v2.json). Tag releases when personas are updated for major milestones.",
		  output:
			"/personas/ folder in repo containing versioned JSON.",
		  llm_prompt: ""
		}
	  ]
	},
	{
	  key: "appendix",
	  title: "APPENDIX",
	  steps: [
		{
		  id: "assets",
		  title: "Assets List",
		  summary: "Templates and example files referenced by the playbook.",
		  purpose: "",
		  activity:
			"EDA Support: EDA Explainer.pdf; question_catalog.csv (blank template); reflecting_ireland_eda_template.xlsx.\nPersona Schema: persona_schema.json.\nPersona Data: personas_example.json (sample personas like “Snappy Saver”).\nPrompt library (.md): prompt_library.md",
		  output: "",
		  llm_prompt: ""
		},
		{
		  id: "cleaning-guide",
		  title: "Data cleaning guide (PTSB Data)",
		  summary: "Reference guide for cleaning the PTSB survey.",
		  purpose: "",
		  activity:
			"Use the region lookup (Dublin, Rest of Leinster, Munster, Connacht, Ulster), normalise scales, remove duplicates/blanks, and align question ids to the question_catalog.csv.",
		  output: "",
		  llm_prompt: ""
		},
		{
		  id: "survey-design",
		  title: "Design Guidance for Future Surveys",
		  summary: "Make future surveys more analysis-friendly.",
		  purpose: "",
		  activity:
			"• Prefer consistent Likert scales; avoid double-barrel questions.\n• Include demographic anchors enabling stratification (age bands, region).\n• Add a small set of behavioural questions to tie attitudes to actions.\n• Pre-tag questions with provisional category/theme where possible.",
		  output: "",
		  llm_prompt: ""
		}
	  ]
	}
  ]
};

export default defaultPlaybook;
