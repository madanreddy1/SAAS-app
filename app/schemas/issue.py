from pydantic import BaseModel
from typing import Optional

class IssueCreate(BaseModel):
    title:str
    description:str

class IssueResponse(BaseModel):
    id:int
    title:str
    description:str
    status:str
    project_id:int

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes= True