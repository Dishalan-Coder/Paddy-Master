"""Small in-memory database fixture for API tests."""

from copy import deepcopy
from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.db import mongodb


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_args, **_kwargs):
        return self

    def skip(self, amount):
        self.documents = self.documents[amount:]
        return self

    def limit(self, amount):
        self.documents = self.documents[:amount]
        return self

    async def to_list(self, length):
        return deepcopy(self.documents[:length])


class FakeCollection:
    def __init__(self):
        self.documents = []

    @staticmethod
    def _matches(document, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(
                    FakeCollection._matches(document, option) for option in expected
                ):
                    return False
            elif isinstance(expected, dict) and "$ne" in expected:
                if document.get(key) == expected["$ne"]:
                    return False
            elif document.get(key) != expected:
                return False
        return True

    async def find_one(self, query, projection=None, **_kwargs):
        for document in self.documents:
            if self._matches(document, query):
                result = deepcopy(document)
                if projection:
                    included = {key for key, value in projection.items() if value}
                    excluded = {key for key, value in projection.items() if not value}
                    if included:
                        result = {
                            key: value
                            for key, value in result.items()
                            if key in included or key == "_id"
                        }
                    for key in excluded:
                        result.pop(key, None)
                return result
        return None

    async def insert_one(self, document):
        stored = deepcopy(document)
        stored["_id"] = ObjectId()
        self.documents.append(stored)
        return SimpleNamespace(inserted_id=stored["_id"])

    async def find_one_and_update(self, query, update, **_kwargs):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                stored = deepcopy(document)
                if "$set" in update:
                    stored.update(deepcopy(update["$set"]))
                self.documents[index] = stored
                return deepcopy(stored)
        return None

    async def update_one(self, query, update, **_kwargs):
        matched = 0
        modified = 0
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                matched = 1
                stored = deepcopy(document)
                if "$set" in update:
                    stored.update(deepcopy(update["$set"]))
                    modified = 1
                self.documents[index] = stored
                break
        return SimpleNamespace(matched_count=matched, modified_count=modified)

    async def count_documents(self, query):
        return sum(self._matches(document, query) for document in self.documents)

    def find(self, query=None, projection=None):
        query = query or {}
        documents = [
            deepcopy(document)
            for document in self.documents
            if self._matches(document, query)
        ]
        if projection:
            for document in documents:
                for key, value in projection.items():
                    if not value:
                        document.pop(key, None)
        return FakeCursor(documents)


class FakeDatabase:
    def __init__(self):
        self.users = FakeCollection()
        self.crops = FakeCollection()
        self.products = FakeCollection()
        self.orders = FakeCollection()
        self.farms = FakeCollection()
        self.expenses = FakeCollection()
        self.messages = FakeCollection()
        self.market_prices = FakeCollection()
        self.notifications = FakeCollection()
        self.reviews = FakeCollection()


@pytest.fixture(autouse=True)
def fake_database(monkeypatch):
    database = FakeDatabase()
    monkeypatch.setattr(mongodb, "db", database)
    yield database
    monkeypatch.setattr(mongodb, "db", None)
