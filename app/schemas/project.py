from typing import Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: str


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True