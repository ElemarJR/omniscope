from .models import User, CacheItem
from core.generator import generate_schema
from .mutations import Mutations


def init():
    types = [User, CacheItem]
    schema = generate_schema(types, "Admin", include_base_types=False, mutation_classes=[Mutations])
    return schema
