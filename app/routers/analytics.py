from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.issue import Issue
from app.schemas.analytics import AnalyticsSummary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project_count = (
        db.query(Project).filter(Project.owner_id == current_user.id).count()
    )

    base_issue = (
        db.query(Issue)
        .join(Project)
        .filter(Project.owner_id == current_user.id)
    )

    issue_count = base_issue.count()

    rows = (
        db.query(Issue.status, func.count(Issue.id))
        .join(Project)
        .filter(Project.owner_id == current_user.id)
        .group_by(Issue.status)
        .all()
    )

    issues_by_status = {status: int(count) for status, count in rows}

    return AnalyticsSummary(
        project_count=project_count,
        issue_count=issue_count,
        issues_by_status=issues_by_status,
    )
