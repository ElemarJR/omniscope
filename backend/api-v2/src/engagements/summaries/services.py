from datetime import datetime
from omni_shared import globals

def compute_staleliness(worker_slug: str = None):
    from .models import Staleliness, StalelinessCaseInfo
    from team.models import ConsultantOrEngineer
    
    cases = globals.omni_models.cases.get_all().values()
    cases = [case for case in cases if case.is_active]
    
    timesheet = globals.omni_datasets.get_by_slug('timesheet-last-six-weeks')
    timesheet_df = timesheet.data
    
    result = {
        'stale_cases': [],
        'stale_in_one_week_cases': [], 
        'stale_in_less_than_15_days_cases': [],
        'no_description_cases': [],
        'up_to_date_cases': []
    }

    now = datetime.now().date()
        
    for case in cases:
        case_dict = StalelinessCaseInfo(
            title=case.title,
            slug=case.slug,
            last_updated=case.last_updated,
            days_since_update=0,
            consultants_or_engineers=[]
        )
            
        # Get workers from timesheet
        workers_set = set()
        if timesheet_df is not None:
            case_timesheet = timesheet_df[timesheet_df['CaseTitle'] == case.title]
            #workers = case_timesheet[['WorkerName', 'WorkerSlug']].drop_duplicates()
            
            # case_dict.consultants_or_engineers = [
            #     ConsultantOrEngineer.from_domain(
            #         globals.omni_models.workers.get_by_slug(row['WorkerSlug'])
            #     )
            #     for _, row in workers.iterrows()
            # ]
            
            workers = case_timesheet['WorkerSlug'].drop_duplicates()
            workers_set.update(workers)
        # Skip if workerSlug is provided and worker is not in case
        if worker_slug and worker_slug not in workers_set:
            continue
            
        days_since_update = None
        days_since_start = None
        
        if case.last_updated:
            days_since_update = (now - case.last_updated.date()).days
            case_dict.days_since_update = days_since_update
            
        if case.start_of_contract:
            days_since_start = (now - case.start_of_contract).days
        
        # New case (less than 30 days) without updates is considered up to date
        if days_since_start is not None and days_since_start < 30 and not case.last_updated:
            result['up_to_date_cases'].append(case_dict)
        # No description cases
        elif not case.has_description:
            result['no_description_cases'].append(case_dict)
        # Stale cases (more than 30 days)
        elif days_since_update and days_since_update > 30:
            result['stale_cases'].append(case_dict)
        # Will be stale in one week (21-30 days)
        elif days_since_update and days_since_update >= 21:
            result['stale_in_one_week_cases'].append(case_dict)
        # Will be stale in 15 days (15-20 days)
        elif days_since_update and days_since_update >= 15:
            result['stale_in_less_than_15_days_cases'].append(case_dict)
        # Up to date cases
        else:
            result['up_to_date_cases'].append(case_dict)
            
    return Staleliness(**result)