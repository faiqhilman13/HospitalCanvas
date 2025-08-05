# Bug Tracker

## Fixed Issues

### 2025-08-04: Population Analytics White Screen Error

**Issue**: Clicking "Patterns" or "Medications" tabs in Population Analytics node caused white screen crashes

**Error Details**:
- `AnalyticsReportNode.tsx:194` - Cannot read properties of undefined (reading 'slice')
- `AnalyticsReportNode.tsx:222` - Cannot read properties of undefined (reading 'average_cost')

**Root Cause**: Missing defensive programming for undefined API response data
- `pattern.key_indicators` was undefined
- `med.cost_analysis` was undefined

**Fix Applied**: Added optional chaining and fallback values
```typescript
// Line 194: pattern.key_indicators?.slice(0, 2).map(...) || []
// Line 222: med.cost_analysis?.average_cost || 'N/A'
```

**Status**: RESOLVED - Both tabs now function correctly with graceful error handling

## Active Issues

### 2025-08-05: RAG/AI "Ask AI" Node Returns Generic Responses

**Issue**: Ask AI functionality shows generic dummy responses instead of real Ollama-powered clinical analysis

**Investigation Results**:
- ✅ Backend API works: `curl localhost:8000/api/patients/uncle-tan-001/ask` returns real AI analysis
- ✅ RAG pipeline functional: Ollama running, returns detailed clinical insights via LLM
- ✅ Database has pre-computed Q&A pairs but they contain real clinical data
- ❌ Frontend displays generic response: "Based on the clinical data, I can see that this patient's condition shows several concerning trends..."

**Root Cause**: Missing onAsk callback function in canvas node data creation
- AIQuestionBoxNode.tsx:120 - Button disabled due to missing onAsk prop
- ClinicalCanvas.tsx:104 - aiQuestionBox case missing onAsk implementation
- Components designed for real API calls but callback not wired up

**Fix Applied**:
1. ✅ Added onAsk callback in ClinicalCanvas.tsx createNodeData()
2. ✅ Implemented real API calls to `/api/patients/{id}/ask`
3. ✅ Added data transformation from QAResponse to QAPair format
4. ✅ Enhanced error handling in AIQuestionBoxNode.tsx

**Current Testing**: Validating fix with Playwright - real AI responses should now work

**Status**: RESOLVED ✅

**Final Fix**: Changed relative URL `/api/patients/...` to use `${API_BASE_URL}/patients/...` in ClinicalCanvas.tsx:108 to properly route to backend (localhost:8000) instead of frontend server (localhost:5174).

**Validation**: Network logs show successful POST to `http://localhost:8000/api/patients/uncle-tan-001/ask` → 200 OK. Real AI responses now working.