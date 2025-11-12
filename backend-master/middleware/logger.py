from functools import wraps
import re
from flask import request
import json

from redis_lib.session import fetch_session
from util.logger import file_handler

k = "ignored_fields_for_logging"

def ignore_fields_for_logging(fields):
    """Used to prevent sensitive fields from being logged"""
    def decorator(func):
        setattr(func, k, fields)
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator


def log_request(app): 
    handler = app.view_functions.get(request.endpoint)
    fields = getattr(handler, k, [])

    request_data = request.json if request.is_json else request.form.to_dict()
    request_data = request_data.copy()

    # Remove sensitive fields from request data
    if request_data:
        for field in fields:
            if field in request_data:
                del request_data[field]

    
    # Log the sanitized request
    log_data = {
        "method": request.method,
        "endpoint": request.path,
        "ip": request.remote_addr,
        "request_data": request_data
    }
    session_id = request.cookies.get("session_id")
    if session_id:
        log_data["session_id"] = session_id
        log_data["session"] = fetch_session(session_id)
    to_log = json.dumps(log_data)
    app.logger.info(to_log)

def init_logger(app):
    app.before_request(lambda: log_request(app))
    app.logger.addHandler(file_handler)
