"""
Simplified Document Processing for Railway deployment
Core functionality without heavy ML dependencies
"""

import numpy as np
from typing import List, Dict, Any, Optional
import re


class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def find_relevant_chunks(self, chunks: List[Dict[str, Any]], query: str, max_chunks: int = 3) -> List[Dict[str, Any]]:
        """Find relevant chunks using simple keyword matching"""
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        scored_chunks = []
        
        for chunk in chunks:
            text_lower = chunk["text"].lower()
            text_words = set(text_lower.split())
            
            # Simple relevance scoring
            common_words = query_words.intersection(text_words)
            relevance_score = len(common_words) / len(query_words) if query_words else 0
            
            # Boost score if query appears as phrase
            if query_lower in text_lower:
                relevance_score += 0.5
            
            chunk_copy = chunk.copy()
            chunk_copy["relevance_score"] = relevance_score
            scored_chunks.append(chunk_copy)
        
        # Sort by relevance and return top chunks
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_chunks[:max_chunks]


class MockEmbeddingService:
    """Mock embedding service for Railway deployment"""
    
    def generate_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """Generate mock embeddings (simple hash-based vectors)"""
        embeddings = []
        for text in texts:
            # Create deterministic "embedding" from text hash
            hash_val = hash(text) % (2**32)
            # Create 384-dimensional vector (common embedding size)
            np.random.seed(hash_val)
            embedding = np.random.normal(0, 1, 384)
            embeddings.append(embedding)
        return embeddings