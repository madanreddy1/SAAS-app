from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='projects')
    issues = relationship("Issue", back_populates="project")