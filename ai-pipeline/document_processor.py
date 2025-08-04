"""
Document Processing Pipeline
Handles PDF text extraction, chunking, and embedding generation
"""

import pdfplumber
import numpy as np
from typing import List, Dict, Any, Optional
from pathlib import Path
import re
import hashlib

class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap
        
    def extract_text_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF file"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                pages = []
                full_text = ""
                
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text() or ""
                    pages.append({
                        "page_number": page_num,
                        "text": page_text,
                        "char_count": len(page_text)
                    })
                    full_text += f"\n\n--- Page {page_num} ---\n\n{page_text}"
                
                return {
                    "success": True,
                    "filename": Path(pdf_path).name,
                    "total_pages": len(pages),
                    "pages": pages,
                    "full_text": full_text,
                    "total_chars": len(full_text)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to extract text from PDF: {str(e)}",
                "filename": Path(pdf_path).name
            }
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep medical abbreviations
        text = re.sub(r'[^\w\s\-\.\,\;\:\(\)\/\%]', '', text)
        
        # Normalize line breaks
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        return text.strip()
    
    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        clean_text = self.clean_text(text)
        words = clean_text.split()
        chunks = []
        
        for i in range(0, len(words), self.chunk_size - self.overlap):
            chunk_words = words[i:i + self.chunk_size]
            chunk_text = ' '.join(chunk_words)
            
            # Generate chunk ID
            chunk_id = hashlib.md5(chunk_text.encode()).hexdigest()[:12]
            
            chunk_data = {
                "id": chunk_id,
                "text": chunk_text,
                "word_count": len(chunk_words),
                "char_count": len(chunk_text),
                "chunk_index": len(chunks),
                "start_word": i,
                "end_word": min(i + self.chunk_size, len(words))
            }
            
            # Add metadata if provided
            if metadata:
                chunk_data.update(metadata)
            
            chunks.append(chunk_data)
            
            # Stop if we've covered all words
            if i + self.chunk_size >= len(words):
                break
        
        return chunks
    
    def process_clinical_document(self, pdf_path: str, document_id: str, patient_id: str) -> Dict[str, Any]:
        """Process a clinical document end-to-end"""
        print(f"Processing document: {pdf_path}")
        
        # Extract text from PDF
        extraction_result = self.extract_text_from_pdf(pdf_path)
        
        if not extraction_result["success"]:
            return extraction_result
        
        # Process each page
        all_chunks = []
        
        for page in extraction_result["pages"]:
            if not page["text"].strip():
                continue
                
            page_metadata = {
                "document_id": document_id,
                "patient_id": patient_id,
                "page_number": page["page_number"],
                "filename": extraction_result["filename"]
            }
            
            # Chunk the page text
            page_chunks = self.chunk_text(page["text"], page_metadata)
            all_chunks.extend(page_chunks)
        
        return {
            "success": True,
            "document_id": document_id,
            "patient_id": patient_id,
            "filename": extraction_result["filename"],
            "total_pages": extraction_result["total_pages"],
            "total_chunks": len(all_chunks),
            "chunks": all_chunks,
            "processing_stats": {
                "total_chars": extraction_result["total_chars"],
                "total_words": sum(chunk["word_count"] for chunk in all_chunks),
                "avg_chunk_size": np.mean([chunk["word_count"] for chunk in all_chunks]) if all_chunks else 0
            }
        }
    
    def find_relevant_chunks(self, chunks: List[Dict[str, Any]], query: str, max_chunks: int = 5) -> List[Dict[str, Any]]:
        """Find chunks most relevant to a query (simple keyword matching)"""
        if not chunks or not query:
            return []
        
        query_words = set(query.lower().split())
        scored_chunks = []
        
        for chunk in chunks:
            chunk_words = set(chunk["text"].lower().split())
            
            # Simple scoring based on word overlap
            overlap = len(query_words.intersection(chunk_words))
            score = overlap / len(query_words) if query_words else 0
            
            if score > 0:
                scored_chunks.append({
                    **chunk,
                    "relevance_score": score
                })
        
        # Sort by relevance score and return top chunks
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_chunks[:max_chunks]


class MockEmbeddingService:
    """Mock embedding service for demo purposes"""
    
    def __init__(self):
        self.model_name = "mock-embeddings"
        self.embedding_dim = 384  # Typical sentence transformer dimension
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate mock embeddings (random vectors for demo)"""
        np.random.seed(42)  # For reproducible "embeddings"
        return np.random.rand(len(texts), self.embedding_dim)
    
    def find_similar_chunks(self, query_embedding: np.ndarray, chunk_embeddings: np.ndarray, top_k: int = 5) -> List[int]:
        """Find most similar chunks using cosine similarity"""
        # Normalize vectors
        query_norm = query_embedding / np.linalg.norm(query_embedding)
        chunk_norms = chunk_embeddings / np.linalg.norm(chunk_embeddings, axis=1, keepdims=True)
        
        # Calculate cosine similarity
        similarities = np.dot(chunk_norms, query_norm)
        
        # Get top k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return top_indices.tolist()


def test_document_processing():
    """Test document processing with mock data"""
    processor = DocumentProcessor()
    
    # Create a mock text document for testing
    mock_text = """
    Patient: Uncle Tan
    Age: 68 years
    
    Laboratory Results:
    - Creatinine: 4.2 mg/dL (Normal: 0.7-1.3 mg/dL) - ELEVATED
    - eGFR: 18 mL/min/1.73m² (Normal: >60 mL/min/1.73m²) - SEVERELY DECREASED
    - BUN: 68 mg/dL (Normal: 6-24 mg/dL) - ELEVATED
    
    Clinical Assessment:
    The patient presents with Stage 4 chronic kidney disease with severely reduced kidney function.
    Immediate nephrology consultation is recommended.
    
    Recommendations:
    1. Urgent nephrology referral
    2. Monitor electrolytes closely
    3. Adjust medications for renal function
    4. Consider renal replacement therapy options
    """
    
    # Test text chunking
    chunks = processor.chunk_text(mock_text, {
        "document_id": "test-doc-001",
        "patient_id": "uncle-tan-001",
        "page_number": 1
    })
    
    print(f"✅ Generated {len(chunks)} chunks from mock document")
    
    # Test chunk relevance finding
    relevant_chunks = processor.find_relevant_chunks(chunks, "kidney function creatinine")
    
    print(f"✅ Found {len(relevant_chunks)} relevant chunks for query")
    
    if relevant_chunks:
        print(f"   Top chunk (score: {relevant_chunks[0]['relevance_score']:.2f}):")
        print(f"   {relevant_chunks[0]['text'][:100]}...")
    
    return True


if __name__ == "__main__":
    print("🧪 Testing Document Processing Pipeline...")
    
    if test_document_processing():
        print("\n🎉 Document processing is working!")
    else:
        print("\n❌ Document processing failed")