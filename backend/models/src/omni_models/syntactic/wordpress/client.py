from datetime import datetime
from collections import defaultdict
import requests
from requests.auth import HTTPBasicAuth
from typing import Union, Dict, List, Any, Optional, Type, TypeVar
from pydantic import HttpUrl

from omni_utils.decorators.cache import cache
import logging

from .models.post import Post
from .models.user import User
from .models.post_type import PostType

logger = logging.getLogger(__name__)

class Wordpress:
    def __init__(self, url, username=None, password=None):
        self.session = requests.Session()
        self.url = url
        self.username = username
        self.password = password

        if username and password:
            auth = HTTPBasicAuth(username, password)
            self.session.auth = auth

    def api_url_for_entity(self, entity_type: str) -> HttpUrl:
        return f'{self.url}/wp-json/wp/v2/{entity_type}'

    @cache(remember=True)
    def fetch_media_url(self, media_id: str) -> HttpUrl:
        url = f'{self.api_url_for_entity("media")}/{media_id}'

        response = self.session.get(url)
        response.raise_for_status()
        json = response.json()

        return json['guid']['rendered']

    def fetch(self, entity_type: str, params: Dict[str, Any] = None) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        api_url = self.api_url_for_entity(entity_type)

        if not params:
            params = {}

        params.setdefault('date_gmt', '')
        params.setdefault('per_page', 100)
        params.setdefault('_embed', 'wp:attachment')

        all_results = []
        combined_results = defaultdict(list)  # Para combinar resultados quando a resposta for dicionário
        page = 1
        total_pages = 1

        while page <= total_pages:
            params['page'] = page
            response = self.session.get(api_url, params=params)
            response.raise_for_status()

            result = response.json()

            if isinstance(result, list):
                # Se o retorno for uma lista, apenas estende o resultado
                all_results.extend(result)
            elif isinstance(result, dict):
                # Se o retorno for um dicionário, combina as chaves
                for key, value in result.items():
                    if isinstance(value, list):
                        combined_results[key].extend(value)  # Extende listas
                    else:
                        combined_results[key] = value  # Sobrescreve outros tipos

            total_pages = int(response.headers.get('X-WP-TotalPages', 1))
            page += 1

        if all_results:
            return all_results  # Retorna a lista se foi o caso
        else:
            return dict(combined_results)  # Retorna o dicionário combinado se foi o caso

    @cache
    def fetch_users(self) -> Dict[int, User]:
        json = self.fetch('users')
        result = {
            int(user_data['id']): User(**user_data)
            for user_data in json
        }
        return result

    @cache
    def fetch_post_types(self) -> List[PostType]:
        json = self.fetch('types')
        result = [PostType(**type_data) for type_data in json.values()]
        return result

    T = TypeVar('T', bound='Post')

    @cache
    def fetch_posts(self, post_type_slug: str,
                    after: Optional[datetime] = None,
                    before: Optional[datetime] = None,
                    cls: Type[T] = Post
                    ) -> List[T]:

        def instantiate(post_data):
            logger.info(f"Loading {post_type_slug} id: {post_data.get('id', None)}...")
            return cls(**post_data)

        params = {}
        if after:
            params['after'] = after.isoformat()

        if before:
            params['before'] = before.isoformat()

        json = self.fetch(post_type_slug, params)
        result = [instantiate(post_data) for post_data in json]

        if post_type_slug != 'cases' and self.password:

            params['status'] = 'private'
            json = self.fetch(post_type_slug, params)
            result_privates = [instantiate(post_data) for post_data in json]
            result = result_privates + result

            params['status'] = 'draft'
            json = self.fetch(post_type_slug, params)
            result_privates = [instantiate(post_data) for post_data in json]
            result = result_privates + result

        return result

    def api_url_for_jet_relations(self, relation_id: int) -> HttpUrl:
        endpoint = f'/wp-json/jet-rel/{relation_id}'
        return f'{self.url}{endpoint}'

    @cache
    def fetch_jet_relations(self, relation_id: int) -> Dict[int, List[int]]:
        api_url = self.api_url_for_jet_relations(relation_id)

        response = self.session.get(api_url)
        response.raise_for_status()

        input_dict = response.json()
        output_dict = {}
        for key, value in input_dict.items():
            output_dict[int(key)] = [int(item['child_object_id']) for item in value]

        return output_dict 