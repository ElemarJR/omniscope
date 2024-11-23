import globals

from datetime import date, datetime

def resolve_revenue_tracking(root, info, date_of_interest: str | date):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, "%Y-%m-%d").date()

    year = date_of_interest.year
    month = date_of_interest.month

    active_cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    def get_account_manager_name(case):
        if not case.client_id:
            return "N/A"
        
        client = globals.omni_models.clients.get_by_id(case.client_id)
        return client.account_manager.name if client and client.account_manager else "N/A"
    
    account_managers_names = sorted(set(get_account_manager_name(case) for case in active_cases))
    
    by_account_manager = []
    for account_manager_name in account_managers_names:
        by_client = []
        
        client_names = sorted(set(
            case.find_client_name(globals.omni_models.clients)
            for case in active_cases
            if get_account_manager_name(case) == account_manager_name
        ))
        
        for client_name in client_names:
            by_case = []
            for case in active_cases:
                if case.find_client_name(globals.omni_models.clients) == client_name:
                    if case.fixed_fee != 0:
                        by_case.append({
                            "title": case.title,
                            "fee": case.fixed_fee,
                            "by_project": sorted([
                                {
                                    "kind": project.kind,
                                    "name": project.name,
                                    "fee": (project.billing.fee / 100) if project.billing and project.billing.fee else 0
                                }
                                for project in case.tracker_info
                                if project.billing and project.billing.fee and project.billing.fee != 0
                            ], key=lambda x: x["name"])
                        })
        
            if len(by_case) > 0:
                by_client.append({
                    "name": client_name,
                    "by_case": by_case, 
                    "fee": sum(case["fee"] for case in by_case)
                })
        
        if len(by_client) > 0:
            by_account_manager.append({
                "name": account_manager_name,
                "by_client": by_client,
                "fee": sum(client["fee"] for client in by_client)
            })
    
    return {
        "year": year,
        "month": month,
        "fixed": { 
            "monthly": { 
                "total": sum(account_manager["fee"] for account_manager in by_account_manager), 
                "by_account_manager": by_account_manager
            } 
        }
    }
