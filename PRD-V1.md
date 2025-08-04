📝 PRD: AI-Powered Clinical Canvas (Hackathon Demo)
🗓️ As of: Monday, 4 August 2025
📍 Location: Subang Jaya, Selangor

📌 tl;dr
We are building a demonstration of an interactive canvas that instantly transforms a single, complex patient document (like a PDF referral) into a clear, actionable dashboard. Our demo focuses on the "magic moment" of upload-to-insight, showcasing how clinicians can understand a patient's story in seconds, not minutes. We will use a react-flow canvas as our primary "wow" factor, supported by a pre-computed AI pipeline.

🎯 Goals (for the Hackathon)

✅ Demo Goals

Demonstrate a >90% reduction in time-to-insight for a single document review.

Showcase a compelling vision for a next-gen clinical intelligence layer.

Present a fluid, visually impressive, and interactive user interface that wows the judges.

✅ User Goals (Dr. Aisha - The Clinician)

Get a clear, AI-generated summary of a dense clinical document in seconds.

Visually track key lab and vital trends extracted from the document.

Ask natural language questions (e.g., “What’s the trend in this patient’s creatinine levels?”) and get answers with direct evidence from the source document.

🚫 Non-Goals (for the Hackathon Demo)

Full EHR integration or multi-system data pulls.

Synthesizing a patient history from multiple documents simultaneously.

User authentication, account management, or layout saving.

Real-time data processing during the demo (all insights will be pre-computed).

A functional dashboard for the Analyst (Siti) persona.

👥 User Stories (Persona-Driven)

👩‍⚕️ Dr. Aisha – The Clinician (Primary Focus)

“I have 3 minutes to understand a 15-page referral. I need the bottom line, now.”

I want to select a patient case and instantly see a pre-digested summary so I can grasp the key issues immediately.

I want to see critical data like lab results automatically extracted and charted so I can spot trends without searching.

I want to drag and resize modules on the canvas so I can arrange the information in a way that makes sense for my clinical investigation.

I want to ask a specific follow-up question and see the answer highlighted in the original document so I can trust the AI's output.

🧓 Uncle Tan – The Patient (Primary Archetype)

(Indirect beneficiary via a better-informed Dr. Aisha)

I want my doctor to understand my complex history from the referral letter without having to re-read everything in front of me.

I want to trust that my doctor sees the important trends, even if they are buried on page 12 of a report.

📊 Siti – The Analyst (Future Vision)

(Future Vision) The structured data (diagnoses, vitals, risk factors) generated for Dr. Aisha would eventually feed into a public health dashboard for analysts like Siti, enabling real-time trend monitoring. This will be mentioned but not demoed.

🧭 User Experience: The Choreographed Demo

Core UI: The Pre-Seeded Canvas

Modular canvas interface using react-flow.

On demo start, the presenter will select from a list of 3-5 pre-seeded patient cases.

Selecting a patient will instantly load a pre-defined layout of modules. The heavy AI processing is done beforehand to ensure a fast, flawless demo.

Key Demo Interactions:

Patient Load: Presenter selects "Uncle Tan" from a dropdown.

Instant Canvas: A canvas with 4 pre-arranged modules appears immediately:

AI Summary Node: High-level summary of the case.

Vitals & Labs Trend Node: A chart showing key data extracted from the document.

Document Viewer Node: A view of the source PDF.

Ask AI Node: A Q&A interface.

Node Interaction: The presenter will fluidly drag and resize 1-2 nodes to show the interactivity and control of the UI.

Q&A with Citation: The presenter asks a question. The answer appears, and clicking a "source" button automatically scrolls the Document Viewer and highlights the evidence in the original PDF.

📖 Narrative for the Demo
Dr. Aisha has just been handed a dense, 15-page PDF referral for a new patient, Uncle Tan. She has three minutes before his appointment. Instead of speed-reading, she selects 'Uncle Tan' in the AI Canvas. Instantly, the screen populates with a summary of his chronic conditions, a chart showing his declining kidney function over the last year, and a view of the original document. She thinks, "I'm worried about that kidney trend." She drags the lab chart to make it bigger, then asks the AI, "What was his last eGFR value?" The AI answers "48 mL/min/1.73m²" and highlights that exact line in the lab report on page 12. She is now fully prepared to see Uncle Tan with confidence.

📊 Success Metrics (for the Demo)

Time-to-Insight: Demonstrate finding a key insight in <10 seconds, versus minutes of manual reading.

Demo "Wow" Factor: Achieve a clear moment of impressiveness when the canvas loads instantly and the Q&A citation works perfectly.

Answer Accuracy: Successfully answer a clinical question and cite the correct source text in the document live.

UI Fluidity: Demonstrate fluid drag-and-resize of canvas modules with zero lag.

🧠 Technical Considerations (Hackathon Scope)

Frontend: React + Tailwind + react-flow. Focus: building beautiful custom components (SummaryNode, ChartNode) and rendering them within a simple, pre-configured react-flow canvas.

Backend/API: FastAPI or Node.js. Primary job: To serve pre-computed JSON data for each demo patient. The API call for "Load Patient" will be a simple fetch of a static asset. The "Ask AI" endpoint will query a pre-built vector index for that patient.

AI/ML Strategy:

Pre-computation is Key: All documents for the 3-5 demo patients will be pre-processed before the demo (OCR, chunking, embedding, summary generation).

RAG Focus: The pipeline (using LangChain/LlamaIndex) will be optimized for high-quality Retrieval-Augmented Generation with accurate source citation. This is the core AI task.

Tech: pdfplumber/Tesseract -> BAAI/bge-large-en-v1.5 -> FAISS -> LLaMA 3 via Ollama.

🔐 Privacy & Security

All demo data will be 100% synthetic and created for the hackathon. No real PHI will be used.

The architecture demonstrates best practices by design (e.g., orchestration that could be hosted securely).

📦 Hackathon Demo: "Must-Have" Features Checklist
Patient Selector: A simple dropdown to switch between 3 pre-seeded patient cases.

Instant Canvas Load: Loads a pre-defined, pre-computed layout of modules for the selected patient in under a second.

Core Canvas Modules:

AI Summary node displaying generated text.

Vitals & Labs Trend node displaying a simple chart.

Document Viewer node displaying the source PDF.

Ask AI node for user input and generated answers.

Fluid Canvas Interaction: Smooth drag-and-drop and resizing of the modules.

Q&A with Source Citation: The ability to ask a question and have the AI provide an answer that links back to and highlights the specific text in the Document Viewer node. This is the primary technical "wow" feature.