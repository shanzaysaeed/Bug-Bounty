from flask import Flask
from minio import Minio
import os

from api import users_bp, admin_bp, requests_bp, reports_bp
from db.client import db_client, init_db
from middleware.logger import init_logger
import seed.seed_db as seed_db
from util.rate_limiter import init_rate_limiting

def init_minio():
    # TODO: refactor into own file
    client = Minio("minio:9000",
        access_key=os.environ['MINIO_ROOT_USER'],
        secret_key=os.environ['MINIO_ROOT_PASSWORD'],
        secure=False
    )
    return client

def test_minio(minio_client: Minio):
    # The file to upload, change this path if needed
    source_file = "requirements.txt"

    # The destination bucket and filename on the MinIO server
    bucket_name = "python-test-bucket"
    destination_file = "requirements-uploaded.txt"

    # Make the bucket if it doesn't exist.
    found = minio_client.bucket_exists(bucket_name)
    if not found:
        minio_client.make_bucket(bucket_name)
        print("Created bucket", bucket_name)
    else:
        print("Bucket", bucket_name, "already exists")

    # Upload the file, renaming it in the process
    minio_client.fput_object(
        bucket_name, destination_file, source_file,
    )
    print(
        source_file, "successfully uploaded as object",
        destination_file, "to bucket", bucket_name,
    )


def create_app():
    # app client
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://postgres:{os.environ['POSTGRES_PASSWORD']}@postgres:5432/postgres"
    
    # blueprints
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(requests_bp, url_prefix='/api/requests')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')

    # init stuff
    init_logger(app)
    init_rate_limiting(app)
    init_db(app)
    with app.app_context():
        db_client.create_all()
        seed_db.seed_all(db_client.session)

    return app
    
app = create_app()
# minio_client = init_minio()

# test_minio(minio_client)
