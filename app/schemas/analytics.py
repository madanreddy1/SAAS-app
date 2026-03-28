from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    project_count: int
    issue_count: int
    issues_by_status: dict[str, int]
