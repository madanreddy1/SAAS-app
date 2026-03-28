from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Issue(Base):
    __tablename__ = 'issues'

    id=Column(Integer,primary_key=True,index=True)
    title=Column(String)
    description=Column(String)
    status=Column(String,default='Todo')
    project_id=Column(Integer,ForeignKey('projects.id'))
    project=relationship('Project',back_populates='issues')