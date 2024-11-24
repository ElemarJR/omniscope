import globals

from datetime import date, datetime
import pandas as pd

def _get_account_manager_name(case):
    if not case.client_id:
        return "N/A"
    
    client = globals.omni_models.clients.get_by_id(case.client_id)
    return client.account_manager.name if client and client.account_manager else "N/A"

def compute_regular_revenue_tracking(date_of_interest: date):
    s = datetime.combine(date(date_of_interest.year, date_of_interest.month, 1), datetime.min.time())
    e = datetime.combine(date_of_interest, datetime.max.time())
    
    timesheet = globals.omni_datasets.timesheets.get(s, e)
    df = timesheet.data
    df = df[df["Kind"] != "Internal"]
    
    case_ids = df["CaseId"].unique()
    active_cases = [globals.omni_models.cases.get_by_id(case_id) for case_id in case_ids]
    
    account_managers_names = sorted(set(_get_account_manager_name(case) for case in active_cases))
    
    by_account_manager = []
    for account_manager_name in account_managers_names:
        by_client = []
        
        client_names = sorted(set(
            case.find_client_name(globals.omni_models.clients)
            for case in active_cases
            if _get_account_manager_name(case) == account_manager_name
        ))
        
        for client_name in client_names:
            sponsors_names = sorted(set(
                case.sponsor if case.sponsor else "N/A"
                for case in active_cases
                if case.find_client_name(globals.omni_models.clients) == client_name
            ))
            
            by_sponsor = []
            for sponsor_name in sponsors_names:
                by_case = []
                for case in active_cases:
                    if case.find_client_name(globals.omni_models.clients) == client_name and case.sponsor == sponsor_name:
                        by_project = []
                        for project in case.tracker_info:
                            if project.rate and project.rate.rate:
                                project_df = df[df["ProjectId"] == project.id]
                                if len(project_df) > 0:
                                    by_project.append({
                                        "kind": project.kind,
                                        "name": project.name,
                                        "rate": project.rate.rate / 100,
                                        "hours": project_df["TimeInHs"].sum(),
                                        "fee": project_df["Revenue"].sum()
                                    })
                    
                        if len(by_project) > 0:
                            by_case.append({
                                "title": case.title,
                                "fee": sum(project["fee"] for project in by_project),
                                "by_project": sorted(by_project, key=lambda x: x["name"])
                            })
                
                if len(by_case) > 0:
                    by_sponsor.append({
                        "name": sponsor_name,
                        "by_case": by_case, 
                        "fee": sum(case["fee"] for case in by_case)
                    })
            
            if len(by_sponsor) > 0:
                by_client.append({
                    "name": client_name,
                    "by_sponsor": by_sponsor,
                    "fee": sum(sponsor["fee"] for sponsor in by_sponsor)
                })
        
        if len(by_client) > 0:
            by_account_manager.append({
                "name": account_manager_name,
                "by_client": by_client,
                "fee": sum(client["fee"] for client in by_client)
            })
            
    total = sum(account_manager["fee"] for account_manager in by_account_manager)
    
    return {
        "monthly": {
            "total": total,
            "by_account_manager": by_account_manager
        }
    }

def compute_pre_contracted_revenue_tracking():
    active_cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    account_managers_names = sorted(set(_get_account_manager_name(case) for case in active_cases))
    
    by_account_manager = []
    for account_manager_name in account_managers_names:
        by_client = []
        
        client_names = sorted(set(
            case.find_client_name(globals.omni_models.clients)
            for case in active_cases
            if _get_account_manager_name(case) == account_manager_name
        ))
        
        for client_name in client_names:
            sponsors_names = sorted(set(
                case.sponsor if case.sponsor else "N/A"
                for case in active_cases
                if case.find_client_name(globals.omni_models.clients) == client_name
            ))
            
            by_sponsor = []
            for sponsor_name in sponsors_names:
                by_case = []
                for case in active_cases:
                    if case.find_client_name(globals.omni_models.clients) == client_name and case.sponsor == sponsor_name:
                        by_project = []
                        for project in case.tracker_info:
                            if project.billing and project.billing.fee and project.billing.fee != 0:
                                by_project.append({
                                    "kind": project.kind,
                                    "name": project.name,
                                    "fee": (project.billing.fee / 100) if project.billing and project.billing.fee else 0
                                })
                    
                        if len(by_project) > 0:
                            by_case.append({
                                "title": case.title,
                                "fee": sum(project["fee"] for project in by_project),
                                "by_project": sorted(by_project, key=lambda x: x["name"])
                            })
                
                if len(by_case) > 0:
                    by_sponsor.append({
                        "name": sponsor_name,
                        "by_case": by_case, 
                        "fee": sum(case["fee"] for case in by_case)
                    })
            
            if len(by_sponsor) > 0:
                by_client.append({
                    "name": client_name,
                    "by_sponsor": by_sponsor,
                    "fee": sum(sponsor["fee"] for sponsor in by_sponsor)
                })
        
        if len(by_client) > 0:
            by_account_manager.append({
                "name": account_manager_name,
                "by_client": by_client,
                "fee": sum(client["fee"] for client in by_client)
            })
            
    total = sum(account_manager["fee"] for account_manager in by_account_manager)
    
    return {
        "monthly": {
            "total": total,
            "by_account_manager": by_account_manager
        }
    }

def resolve_revenue_tracking(root, info, date_of_interest: str | date):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, "%Y-%m-%d").date()

    year = date_of_interest.year
    month = date_of_interest.month


    
    return {
        "year": year,
        "month": month,
        "pre_contracted": compute_pre_contracted_revenue_tracking(),
        "regular": compute_regular_revenue_tracking(date_of_interest)
    }
