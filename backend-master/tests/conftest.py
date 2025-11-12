import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import pytest

from app import create_app
from db.client import db_client
from db.models import User
import redis_lib.session as session

import consts

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        db_client.drop_all()
        db_client.create_all()

        # Seed test data
        db_client.session.add(User(**consts.RESEARCHER))
        db_client.session.add(User(**consts.ORGANIZATION))
        db_client.session.add(User(**consts.ADMIN))
        db_client.session.commit()

    yield app

@pytest.fixture()
def client(app):
    session.clear()
    return app.test_client()
