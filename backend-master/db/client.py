from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db_client = SQLAlchemy()

def init_db(app: Flask):
    db_client.init_app(app)
