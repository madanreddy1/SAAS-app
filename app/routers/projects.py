from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.issue import Issue
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_project = Project(
        title=project.title,
        description=project.description,
        owner_id=current_user.id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@router.get("/", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    return projects


def _apply_project_update(
    project_id: int,
    body: ProjectUpdate,
    db: Session,
    current_user: User,
) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data = body.model_dump(exclude_unset=True)
    if not data:
        return project

    if "title" in data:
        project.title = data["title"]
    if "description" in data:
        project.description = data["description"]

    db.commit()
    db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _apply_project_update(project_id, body, db, current_user)


@router.put("/{project_id}", response_model=ProjectResponse)
def put_project(
    project_id: int,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Same as PATCH — PUT avoids some proxies that mishandle PATCH bodies."""
    return _apply_project_update(project_id, body, db, current_user)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.query(Issue).filter(Issue.project_id == project_id).delete(
        synchronize_session=False
    )
    db.delete(project)
    db.commit()
    return {"ok": True}