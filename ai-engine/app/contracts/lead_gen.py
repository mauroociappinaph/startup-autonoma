from typing import Optional

from pydantic import BaseModel, Field


class LeadGenRequest(BaseModel):
    niche: str = Field(..., description="Industria o nicho de la empresa objetivo.")
    location: Optional[str] = Field(default="", description="Ubicación geográfica. Vacío implica búsqueda global.")
    limit: int = Field(default=5, ge=1, le=50, description="Cantidad máxima de leads a recuperar.")

class LeadInfo(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    industry: str = Field(...)
    location: str = Field(...)
