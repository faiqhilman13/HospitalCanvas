📝 PRD: AI-Powered Clinical Canvas for Decision Support
📌 tl;dr
We're building an interactive, canvas-based dashboard that gives clinicians intelligent, context-aware summaries of a patient’s complete history — pulling together scanned documents, EHR data, vitals, and labs. By combining OCR, semantic search, LLMs, and visual workflows, this tool reduces clinical admin burden and supports smarter, faster decisions at the point of care.

The product is focused on empowering clinicians like Dr. Aisha, indirectly improving care for patients like Uncle Tan, and unlocking structured insights for analysts like Siti.

🎯 Goals
✅ Business Goals
Reduce time spent on chart reviews by 50%+

Improve clinical outcomes by surfacing critical insights faster

Position the platform as a next-gen clinical intelligence layer

Lay groundwork for future clinical and public health data integration

✅ User Goals
Clinicians get a clear, summarized view of patient history in seconds

Automatically generate SOAP notes from structured and unstructured data

Visually track lab and vital trends over time

Ask natural language questions like: “What’s changed since last visit?”

Public health analysts get access to structured clinical metadata

🚫 Non-Goals
Replacing or replicating full EHR functionality

Providing patient-facing interfaces (for now)

Real-time device integrations or emergency alerting

👥 User Stories (Persona-Driven)
👩‍⚕️ Dr. Aisha – The Clinician
“I'm drowning in information and starving for insight.”

I want to see a single patient summary from across multiple systems so I don’t waste time clicking through EHR tabs.

I want the system to flag critical changes in vitals, meds, or labs so I can focus on what matters most.

I want to auto-generate a SOAP note so I can cut down on documentation time and spend more time with my patients.

I want to ask natural-language questions like “Has this patient’s kidney function worsened?” and get direct, clear answers backed by evidence.

🧓 Uncle Tan – The Patient
“I don’t know who to talk to, what I’m supposed to do next, or why.”

(Indirect beneficiary via better-informed clinicians.)

I want my doctor to know my full medical story, even if I’ve visited different clinics.

I want fewer repeated questions during visits, because my data is already in the system.

I want to trust that my doctor sees what’s important, even if I forget to mention it.

📊 Siti – The Analyst
“By the time I get the full picture, it’s already too late.”

I want structured summaries and metadata (e.g., flagged symptoms, diagnoses) from clinical notes so I can spot health trends without manual review.

I want access to de-identified, structured outputs from the AI Canvas that help track diseases, medication usage, or care quality over time.

I want to see patterns early (e.g., rise in respiratory cases), based on what clinicians are documenting in real-time.

🧭 User Experience
Dashboard Canvas (Core UI)
Modular canvas interface using react-konva or react-flow-renderer

Drag-and-drop modules: “Vitals Summary”, “Lab Trends”, “SOAP Generator”, “Patient Timeline”, “Uploaded Docs”, “Ask AI”

Customizable layouts per user or clinical workflow

Key Interactions:
Patient Load: clinician selects a patient → system loads records

Summary Card: high-level AI-generated summary (last visit, meds, risks)

Vitals + Labs Modules: charts with trendlines, color-coded alerts

Ask AI: natural language Q&A → direct answer + referenced context

SOAP Generator: editable AI-generated note, structured in SOAP format

Document Viewer: OCR-parsed scans + highlights of relevant info

📖 Narrative
Dr. Aisha walks into clinic with only five minutes to review a complex patient. Instead of clicking through multiple EHRs, she opens the AI Canvas. Instantly, she sees a summary of the last three visits, abnormal labs flagged in red, and vitals trending upward. She clicks “Generate SOAP” — and edits the AI-generated note in seconds. A quick question — “Any new risk factors?” — returns a concise summary citing lab shifts and recent meds. She’s ready to see Uncle Tan with full context and confidence.

Meanwhile, Siti at the Ministry sees structured metadata showing a regional uptick in new diabetes diagnoses based on SOAP notes — days before the hospitals officially report it.

📊 Success Metrics
🕐 Avg. time to review patient pre-visit → ↓ 50%

✅ SOAP note auto-fill accuracy → >85% usable without major edits

📈 % of patient summaries with accurate references → >95%

🙋‍♀️ Clinician satisfaction (survey/NPS) → 8.5+

🔁 Retention (canvas users who return weekly) → >70%

📊 Time-to-insight for analysts like Siti → ↓ 75%

🧠 Technical Considerations
Frontend
React + Tailwind + react-konva/react-flow-renderer for modular canvas

Component-driven UI with support for real-time updates and layout persistence

Responsive design with touch interactions for tablets

Backend/API
FastAPI or Node.js to orchestrate queries and serve APIs

Secure upload for PDFs and images

API endpoints for embeddings, vector search, AI generation, and document retrieval

Role-based access via Firebase Auth or Clerk

AI/ML Stack
Function	Tools Used
Document Parsing	pdfplumber, Tesseract OCR
Embedding Model	BAAI/bge-large-en-v1.5 or GTE-large
Vector Store	FAISS (local) or Weaviate (hosted)
Reranking	cross-encoder/ms-marco-MiniLM-L-6-v2
LLM for Generation	LLaMA 3 via Ollama or Together.ai
Orchestration	LangChain or LlamaIndex

Prompt Use Cases:
Patient summary generation

SOAP note creation

Timeline construction

Natural language Q&A with chunk citations

🔐 Privacy & Security
Store documents in encrypted format (S3 or secure blob)

PHI-safe by default with access logging

De-identification options for analyst/public health use

RBAC and audit logs for clinical governance

No third-party API calls unless explicitly whitelisted

🛠️ Milestones & Sequencing
Phase 1: MVP (XX weeks)
Canvas UI with draggable modules

Upload PDF → OCR → Vector embedding → retrieval

Summary generator (LLM)

Ask-AI module

Vitals + labs chart module (with sample data)

SOAP generator (basic)

Phase 2: Real Data & Refinement (XX weeks)
FHIR/HL7 parsing

Improved LLM prompts and response accuracy

Editable note fields with traceable citations

Initial public health dashboard (for Siti)

Clinician feedback loop

Phase 3: Pilot Deployment (XX weeks)
Partner hospital or clinic rollout (sandbox data)

HIPAA/PDPA compliance audit

Feedback integration & fine-tuning

Integration with limited EHRs for live pull

📦 Key Features to Include
🔍 Contextual Patient Summarizer – Instant insight across systems

✍️ SOAP Note Generator – Converts history, vitals, labs into structured output

📊 Vitals + Labs Trends Visualizer – Interactive, time-based view

🔗 Multi-source Sync – PDF scans, labs, EHR data in one view

🧠 Decision Assist Agent – Ask-AI to handle clinical queries on the fly

