from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.issue import Issue
from app.models.project import Project
from app.schemas.issue import IssueCreate, IssueResponse, IssueUpdate
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import Optional


router = APIRouter()

@router.post('/projects/{project_id}',response_model=IssueResponse)
def create_issue(project_id:int, issue: IssueCreate, db:Session=Depends(get_db),current_user: User=Depends(get_current_user)):
    project=db.query(Project).filter(Project.id==project_id,Project.owner_id==current_user.id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_issue = Issue(
        title=issue.title,
        description=issue.description,
        project_id=project_id
    )

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return new_issue

@router.get('/projects/{project_id}', response_model=list[IssueResponse])
def get_issues(
    project_id: int,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Issue).join(Project).filter(Project.id==project_id,Project.owner_id==current_user.id)
    if status:
        query = query.filter(Issue.status==status)
    if search:
        query = query.filter(Issue.title.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.put('/{issue_id}', response_model=IssueResponse)
def update_issue(issue_id:int, issue: IssueUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_issue = db.query(Issue).join(Project).filter(
        Issue.id==issue_id, Project.owner_id==current_user.id
    ).first()

    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    for key, value in issue.model_dump(exclude_unset=True).items():
        setattr(db_issue, key, value)

    db.commit()
    db.refresh(db_issue)

    return db_issue
    
@router.delete("/{issue_id}")
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_issue = db.query(Issue).join(Project).filter(
        Issue.id == issue_id,
        Project.owner_id == current_user.id
    ).first()

    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    db.delete(db_issue)
    db.commit()

    return {"message": "Issue deleted successfully"}