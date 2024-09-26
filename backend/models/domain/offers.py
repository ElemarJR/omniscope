from typing import Optional, Dict
from pydantic import BaseModel

import models.helpers.slug as slug
from models.semantic import Ontology


class Offer(BaseModel):
    id: int
    name: str
    slug: str
    cover_image_url: Optional[str] = '/assets/who_is_it.jpeg'

    @property
    def omni_url(self):
        return f'/offers/{self.slug}'


class OffersRepository:
    def __init__(self, ontology: Optional[Ontology] = None):
        self.ontology = ontology or Ontology()
        self.__data: Dict[int, Offer] = None

    def __ensure_data(self):
        if self.__data is not None:
            return

        offers = sorted(self.ontology.offers.values(), key=lambda o: o.title)

        self.__data = {
            offer.id: Offer(
                id=offer.id,
                name=offer.title,
                slug=slug.generate(offer.title),
                cover_image_url=offer.cover_image_url
            )
            for offer in offers
        }

    def get_all(self) -> Dict[int, Offer]:
        self.__ensure_data()
        return self.__data

    def get_by_id(self, id: int) -> Offer:
        self.__ensure_data()
        return self.__data.get(id)

    def get_by_slug(self, slug: str) -> Offer:
        self.__ensure_data()
        all_pos = self.__data.values()
        return next((pos for pos in all_pos if pos.slug == slug), None)

    def get_by_name(self, name: str) -> Offer:
        self.__ensure_data()
        all_pos = self.__data.values()
        return next((pos for pos in all_pos if pos.name == name), None)

