"""
AI Configuration for Clinical Canvas Backend
Centralized configuration for AI service providers
"""

import os
from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass

class AIProvider(Enum):
    """Available AI providers"""
    OPENAI = "openai"
    OLLAMA = "ollama"
    AUTO = "auto"  # Auto-select based on availability

@dataclass
class AIConfig:
    """AI service configuration"""
    provider: AIProvider = AIProvider.AUTO
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4"
    openai_organization: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3:8b"
    max_retries: int = 3
    timeout: int = 60
    fallback_enabled: bool = True

    @classmethod
    def from_env(cls) -> 'AIConfig':
        """Create configuration from environment variables"""
        return cls(
            provider=AIProvider(os.getenv("AI_PROVIDER", "auto")),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4"),
            openai_organization=os.getenv("OPENAI_ORGANIZATION"),
            ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            ollama_model=os.getenv("OLLAMA_MODEL", "llama3:8b"),
            max_retries=int(os.getenv("AI_MAX_RETRIES", "3")),
            timeout=int(os.getenv("AI_TIMEOUT", "60")),
            fallback_enabled=os.getenv("AI_FALLBACK_ENABLED", "true").lower() == "true"
        )

    def get_provider_config(self) -> Dict[str, Any]:
        """Get provider-specific configuration"""
        if self.provider == AIProvider.OPENAI:
            return {
                "api_key": self.openai_api_key,
                "model": self.openai_model,
                "organization": self.openai_organization,
                "max_retries": self.max_retries,
                "timeout": self.timeout
            }
        elif self.provider == AIProvider.OLLAMA:
            return {
                "base_url": self.ollama_base_url,
                "model": self.ollama_model
            }
        else:  # AUTO
            return {
                "openai": {
                    "api_key": self.openai_api_key,
                    "model": self.openai_model,
                    "organization": self.openai_organization,
                    "max_retries": self.max_retries,
                    "timeout": self.timeout
                },
                "ollama": {
                    "base_url": self.ollama_base_url,
                    "model": self.ollama_model
                }
            }

class AIServiceFactory:
    """Factory for creating AI service instances"""
    
    def __init__(self, config: AIConfig = None):
        self.config = config or AIConfig.from_env()
        self._openai_service = None
        self._ollama_service = None
        self._rag_pipeline = None

    def get_ai_service(self):
        """Get the configured AI service"""
        if self.config.provider == AIProvider.OPENAI:
            return self._get_openai_service()
        elif self.config.provider == AIProvider.OLLAMA:
            return self._get_ollama_service()
        else:  # AUTO
            # Try OpenAI first, fallback to Ollama
            openai_service = self._get_openai_service()
            if openai_service and openai_service.is_available():
                return openai_service
            else:
                return self._get_ollama_service()

    def _get_openai_service(self):
        """Get OpenAI service instance"""
        if not self._openai_service:
            try:
                from .openai_service import OpenAIService
                config = self.config.get_provider_config()
                if self.config.provider == AIProvider.AUTO:
                    config = config["openai"]
                
                if config.get("api_key"):
                    self._openai_service = OpenAIService(**config)
                else:
                    print("OpenAI API key not provided")
                    return None
            except ImportError as e:
                print(f"OpenAI service not available: {e}")
                return None
            except Exception as e:
                print(f"Error initializing OpenAI service: {e}")
                return None
        
        return self._openai_service

    def _get_ollama_service(self):
        """Get Ollama service instance"""
        if not self._ollama_service:
            try:
                import sys
                from pathlib import Path
                
                # Add ai-pipeline to path
                ai_pipeline_path = Path(__file__).parent.parent.parent / "ai-pipeline"
                sys.path.append(str(ai_pipeline_path))
                
                from ollama_client import OllamaClient
                config = self.config.get_provider_config()
                if self.config.provider == AIProvider.AUTO:
                    config = config["ollama"]
                
                self._ollama_service = OllamaClient(config.get("base_url", "http://localhost:11434"))
                self._ollama_service.model = config.get("model", "llama3:8b")
            except ImportError as e:
                print(f"Ollama service not available: {e}")
                return None
            except Exception as e:
                print(f"Error initializing Ollama service: {e}")
                return None
        
        return self._ollama_service

    def get_rag_pipeline(self, db_path: str):
        """Get RAG pipeline instance"""
        if not self._rag_pipeline:
            try:
                from .rag_openai import RAGPipelineOpenAI
                
                # Determine if we should use OpenAI
                use_openai = False
                openai_model = self.config.openai_model
                
                if self.config.provider == AIProvider.OPENAI:
                    use_openai = True
                elif self.config.provider == AIProvider.AUTO:
                    # Check if OpenAI is available and configured
                    if self.config.openai_api_key:
                        openai_service = self._get_openai_service()
                        use_openai = openai_service and openai_service.is_available()
                
                self._rag_pipeline = RAGPipelineOpenAI(
                    db_path=db_path,
                    use_openai=use_openai,
                    openai_model=openai_model
                )
            except Exception as e:
                print(f"Error initializing RAG pipeline: {e}")
                # Fallback to original RAG pipeline
                try:
                    import sys
                    from pathlib import Path
                    ai_pipeline_path = Path(__file__).parent.parent.parent / "ai-pipeline"
                    sys.path.append(str(ai_pipeline_path))
                    
                    from rag_pipeline import RAGPipeline
                    use_ollama = self.config.provider != AIProvider.OPENAI
                    self._rag_pipeline = RAGPipeline(db_path, use_ollama=use_ollama)
                except Exception as fallback_e:
                    print(f"Fallback RAG pipeline also failed: {fallback_e}")
                    self._rag_pipeline = None
        
        return self._rag_pipeline

    def get_service_status(self) -> Dict[str, Any]:
        """Get status of all available services"""
        status = {
            "configured_provider": self.config.provider.value,
            "openai": {
                "configured": bool(self.config.openai_api_key),
                "available": False,
                "model": self.config.openai_model
            },
            "ollama": {
                "configured": True,
                "available": False,
                "model": self.config.ollama_model,
                "url": self.config.ollama_base_url
            }
        }
        
        # Test OpenAI availability
        try:
            openai_service = self._get_openai_service()
            if openai_service:
                status["openai"]["available"] = openai_service.is_available()
        except Exception:
            pass
        
        # Test Ollama availability
        try:
            ollama_service = self._get_ollama_service()
            if ollama_service:
                status["ollama"]["available"] = ollama_service.is_available()
        except Exception:
            pass
        
        return status


# Global factory instance
_ai_factory = None

def get_ai_factory() -> AIServiceFactory:
    """Get the global AI factory instance"""
    global _ai_factory
    if _ai_factory is None:
        _ai_factory = AIServiceFactory()
    return _ai_factory

def get_ai_service():
    """Convenience function to get the configured AI service"""
    return get_ai_factory().get_ai_service()

def get_rag_pipeline(db_path: str):
    """Convenience function to get the RAG pipeline"""
    return get_ai_factory().get_rag_pipeline(db_path)

def get_service_status() -> Dict[str, Any]:
    """Convenience function to get service status"""
    return get_ai_factory().get_service_status()


if __name__ == "__main__":
    print("Testing AI Configuration...")
    
    # Test configuration
    config = AIConfig.from_env()
    print(f"Provider: {config.provider.value}")
    print(f"OpenAI Model: {config.openai_model}")
    print(f"OpenAI Key Configured: {'Yes' if config.openai_api_key else 'No'}")
    print(f"Ollama URL: {config.ollama_base_url}")
    
    # Test factory
    factory = AIServiceFactory(config)
    status = factory.get_service_status()
    
    print("\nService Status:")
    for service, info in status.items():
        if isinstance(info, dict):
            available = "✅" if info.get("available") else "❌"
            configured = "✅" if info.get("configured") else "❌"
            print(f"  {service}: Configured: {configured}, Available: {available}")
        else:
            print(f"  {service}: {info}")
    
    # Test service creation
    ai_service = factory.get_ai_service()
    if ai_service:
        print(f"\n✅ AI service created: {type(ai_service).__name__}")
    else:
        print("\n❌ No AI service available")