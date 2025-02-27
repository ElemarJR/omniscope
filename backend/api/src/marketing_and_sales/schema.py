from .models import Offer, ActiveDeal
from core.generator import generate_schema

def init():
    types = [Offer, ActiveDeal]
    schema = generate_schema(types, "MarketingAndSales", include_base_types=False)
    return schema
