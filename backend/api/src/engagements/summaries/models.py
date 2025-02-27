from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from omni_models.analytics.timeliness_models import TimelinessReview as TimelinessReviewModel
from omni_models.analytics.timeliness_models import WorkerSummary as WorkerSummaryModel


from core.generator import FilterableField

class TimelinessWorkerSummary(BaseModel):
    consultant_or_engineer_slug: Optional[str]
    entries: int
    time_in_hours: float

    @classmethod
    def from_model(cls, model: WorkerSummaryModel) -> "TimelinessWorkerSummary":
        result = cls(
            consultant_or_engineer_slug=model.worker_slug,
            entries=model.entries,
            time_in_hours=model.time_in_hours
        )
        return result

class Timeliness(BaseModel):
    total_rows: int
    total_time_in_hours: float
    
    early_rows: int
    early_time_in_hours: float
    early_percentage: float
    early_workers: List[TimelinessWorkerSummary]
    
    ok_rows: int
    ok_time_in_hours: float
    ok_percentage: float
    ok_workers: List[TimelinessWorkerSummary]
    
    acceptable_rows: int
    acceptable_time_in_hours: float
    acceptable_percentage: float
    acceptable_workers: List[TimelinessWorkerSummary]
    
    late_rows: int
    late_time_in_hours: float
    late_percentage: float
    late_workers: List[TimelinessWorkerSummary]
    
    min_date: datetime
    max_date: datetime
    filterable_fields: Optional[List[FilterableField]] = None

    @classmethod
    def from_model(cls, model: TimelinessReviewModel) -> "Timeliness":
        result = cls(
            total_rows=model.total_rows,
            total_time_in_hours=model.total_time_in_hours,
            early_rows=model.early_rows,
            early_time_in_hours=model.early_time_in_hours,
            early_percentage=model.early_percentage,
            early_workers=[TimelinessWorkerSummary.from_model(w) for w in model.early_workers],
            ok_rows=model.ok_rows,
            ok_time_in_hours=model.ok_time_in_hours,
            ok_percentage=model.ok_percentage,
            ok_workers=[TimelinessWorkerSummary.from_model(w) for w in model.ok_workers],
            acceptable_rows=model.acceptable_rows,
            acceptable_time_in_hours=model.acceptable_time_in_hours,
            acceptable_percentage=model.acceptable_percentage,
            acceptable_workers=[TimelinessWorkerSummary.from_model(w) for w in model.acceptable_workers],
            late_rows=model.late_rows,
            late_time_in_hours=model.late_time_in_hours,
            late_percentage=model.late_percentage,
            late_workers=[TimelinessWorkerSummary.from_model(w) for w in model.late_workers],
            min_date=model.min_date,
            max_date=model.max_date,
            filterable_fields=model.filterable_fields
        )
        
        return result
    
class StalelinessCaseInfo(BaseModel):
    #from team.models import ConsultantOrEngineer
    title: str
    slug: str
    last_updated: datetime | None
    days_since_update: int
    #consultants_or_engineers: List['ConsultantOrEngineer']

class Staleliness(BaseModel):
    stale_cases: List[StalelinessCaseInfo]
    stale_in_one_week_cases: List[StalelinessCaseInfo]
    stale_in_less_than_15_days_cases: List[StalelinessCaseInfo]
    no_description_cases: List[StalelinessCaseInfo]
    up_to_date_cases: List[StalelinessCaseInfo]

class DailyAllocation(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    hours: float = Field(..., description="Number of hours allocated")

class AllocationByKind(BaseModel):
    consulting: List[DailyAllocation] = Field(default_factory=list)
    internal: List[DailyAllocation] = Field(default_factory=list)
    hands_on: List[DailyAllocation] = Field(default_factory=list)
    squad: List[DailyAllocation] = Field(default_factory=list)

class Allocation(BaseModel):
    by_kind: AllocationByKind
    filterable_fields: Optional[List[FilterableField]] = None

class Holiday(BaseModel):
    date: datetime
    reason: str

class BusinessCalendar(BaseModel):
    working_days: List[datetime]
    holidays: List[Holiday]
