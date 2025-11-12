from flask import jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis_lib.client import url as redis_url

def get_key():
    session_id = request.cookies.get("session_id")
    if session_id:
        return session_id
    return get_remote_address()

# TODO: override default limits for public endpoints before users are authenticated using @limiter.limit("200 per minute")
limiter: Limiter = Limiter(
    key_func=get_key,
    default_limits=["10 per second", "60 per minute"],
    # default_limits=["2 per minute"],
    storage_uri=redis_url,
    storage_options={"socket_connect_timeout": 30},
    strategy="fixed-window",
)

def init_rate_limiting(app):
    if app.config.get("TESTING"):
        limiter.enabled = False
        return
    app.config['RATELIMIT_HEADERS_ENABLED'] = False

    # disable default rate limiter error message (which includes the limit details)
    @app.errorhandler(429)
    def ratelimit_error(e):
        return jsonify({
            "error": "Too many requests",
            "message": "Please try again later."
        }), 429

    limiter.init_app(app)
