from flask import Blueprint, request, jsonify
from db.models import AuthStage, User, Role
from db.client import db_client
from middleware.auth import SessionAuthStage, check_auth_stage, authenticate, check_roles
from middleware.logger import ignore_fields_for_logging
from util.auth import generate_salt, generate_totp_secret, get_totp_auth_uri, hash_password, verify_password, verify_totp
from json import dumps, loads
from util.rate_limiter import limiter
import re
from redis_lib import session, tokens as redis_tokens
from util.gmail_service import send_email

users_bp = Blueprint('users', __name__)

login_error = {"error": "Error logging in"}
login_error_code = 401

@users_bp.route('/login-password', methods=['POST'])
@ignore_fields_for_logging(["password"])
def login_password():
    data = request.json
    email: str = data.get('email')
    password: str = data.get('password')

    if not email or not password:
        return jsonify(login_error), login_error_code

    user = db_client.session.query(User).filter_by(email=email).first()
    print('user', user)
    if not user:
        return jsonify(login_error), login_error_code
    
    ref = request.headers.get('Referer', '')

    if ref.endswith('org') and user.role != Role.ORGANIZATION:
        return jsonify(login_error), login_error_code
    
    if not ref.endswith('org') and user.role == Role.ORGANIZATION:
        return jsonify(login_error), login_error_code

    if ref.endswith('admin') and user.role != Role.ADMIN:
        return jsonify(login_error), login_error_code

    if not verify_password(user.password, password, user.salt):
        return jsonify(login_error), login_error_code
    
    try:
        if user.role != Role.ADMIN:
            session_id = session.set_session_pending_mfa(user.id)
        else:
            # admin uses passcode instead of regular passwords with MFA
            session_id = session.set_session_pending_mfa(user.id)
            session.set_session_mfa_verified(session_id)
    except:
        return jsonify({"error": "Try again later"}), 429
    response = jsonify({"message": "Logged in"})
    response.set_cookie('session_id', session_id, httponly=True, secure=True) # FIXME: Get rid of secure=True as development server does not support HTTPS
    return response, 200


@users_bp.route('/verify-email', methods=['GET'])
@authenticate()
@check_auth_stage() # users must do MFA before email verification
def verify_email():
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Invalid token"}), 400
    user: User = request.user
    if token != redis_tokens.get_user_verification_token(user.id):
        return jsonify({"error": "Invalid token"}), 400
    user.auth_stage = AuthStage.EMAIL_VERIFIED
    db_client.session.commit()
    return jsonify({"message": "Email verified"}), 200
    
    
def send_verification_email(user: User):
    token = redis_tokens.set_user_verification_token(user.id)
    verification_link = f"http://localhost/api/users/verify-email?token={token}"
    content = f"Click the link to verify your email: {verification_link}"
    send_email(
        user.email,
        "ByteBreakers Email Verification",
        content,
    )

@users_bp.route('/send-verification-email', methods=['POST'])
@authenticate()
@check_auth_stage()
def send_verification_email_route():
    user: User = request.user
    try:
        send_verification_email(user)
    except:
        return jsonify({"error": "Error sending verification email"}), 500
    return jsonify({"message": "Verification email sent"}), 200

# @limiter.limit("1 per 10 minute")
# @users_bp.route('/forgot-password', methods=['POST'])
# @authenticate()
# def forgot_password():
#     user: User = request.user
#     token = email_verification.set_verification_token(user.id)
#     verification_link = f"http://localhost/api/users/reset-password?token={token}"
#     content = f"Click the link to reset your password: {verification_link}"
#     send_email(
#         user.email,
#         content,
#         "ByteBreakers Password Reset"
#     )
#     return jsonify({"message": "Password reset email sent"}), 200


@users_bp.route('/login-mfa', methods=['POST'])
@ignore_fields_for_logging(["code"])
@authenticate()
@check_auth_stage(auth_stage=AuthStage.PENDING_MFA, session_auth_stage=SessionAuthStage.PASSWORD)
def login_mfa():
    data = request.json
    code: str = data.get('code')
    if not code:
        return jsonify(login_error), login_error_code

    user: User = request.user
    session_id = request.session_id
    if not user.totp_secret:
        return jsonify(login_error), login_error_code
    if not verify_totp(user.totp_secret, code):
        return jsonify(login_error), login_error_code
    
    if user.auth_stage == AuthStage.PENDING_MFA:
        user.auth_stage = AuthStage.MFA_VERIFIED
        db_client.session.commit()
        try:
            send_verification_email(user)
        except:
            print("Error sending verification email")
    session.set_session_mfa_verified(session_id)
    return jsonify({"message": "Logged in"}), 200

@limiter.limit("1 per minute")
@users_bp.route('/register', methods=['POST'])
@ignore_fields_for_logging(["password"])
def register():
    data = request.json
    name: str = data.get('name')
    email: str = data.get('email')
    password: str = data.get('password')
    if (len(password) < 10 or len(password) > 64):
        return jsonify({"error": "Password must be between 10 to 64 characters"}), 400
    if not re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').match(email):
        return jsonify({"error": "Invalid email format"}), 400
    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400
    if db_client.session.query(User).filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    salt = generate_salt()
    print('generated', password, salt)
    hashed_password = hash_password(password, salt)
    user = User(name=name, email=email, password=hashed_password, salt=salt, role=Role.RESEARCHER, md='{}')

    try:
        db_client.session.add(user)
        db_client.session.commit()
    except:
        return jsonify({"error": "Error registering"}), 400
    
    try:
        session_id = session.set_session_pending_mfa(user.id)
    except:
        return jsonify({"error": "Try again later"}), 429
    response = jsonify({"message": "Registered"})
    response.set_cookie('session_id', session_id, httponly=True, secure=True) # FIXME: Get rid of secure=True as development server does not support HTTPS
    return response, 200

@users_bp.route("/change-password", methods=['PUT'])
@ignore_fields_for_logging(["old_password", "password"])
@authenticate(check_csrf=True)
def change_password():
    data = request.json
    old_password: str = data.get('old_password')
    password: str = data.get('password')
    user: User = request.user

    if (len(password) < 10 or len(password) > 64):
        return jsonify({"error": "New password must be between 10 to 64 characters"}), 400
    if (len(old_password) < 10 or len(old_password) > 64):
        return jsonify({"error": "Old password should be between 10 to 64 characters"}), 400

    if not verify_password(user.password, old_password, user.salt):
        return jsonify({"error": "old password incorrect"}), 400

    salt = generate_salt()
    hashed_new_password = hash_password(password, salt)

    try:
        user.password = hashed_new_password
        user.salt = salt
        db_client.session.commit()
    except:
        return jsonify({"error": "Error updating password"}), 400

    return jsonify({"message": "Password updated successfully"}), 200

@users_bp.route("/update-org-logo", methods=['PUT'])
@authenticate(check_csrf=True)
def update_org_logo():
    data = request.json
    logo_url: str = data.get('logo_url')
    user: User = request.user

    try:
        user.md = dumps({'approved': loads(user.md)["approved"], 'logo_url': logo_url})
        db_client.session.commit()
    except:
        return jsonify({"error": "Error updating Company Logo"}), 400

    return jsonify({"message": "Logo URL updated"}), 200

@limiter.limit("200 per minute")
@users_bp.route('/register-org', methods=['POST'])
@ignore_fields_for_logging(["password"])
def register_org():
    data = request.json
    name: str = data.get('name')
    email: str = data.get('email')
    password: str = data.get('password')
    if (len(password) < 10 or len(password) > 64):
        return jsonify({"error": "Password must be between 10 to 64 characters"}), 400
    if not re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').match(email):
        return jsonify({"error": "Invalid email format"}), 400
    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400
    if db_client.session.query(User).filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    salt = generate_salt()
    hashed_password = hash_password(password, salt)
    user = User(name=name, email=email, password=hashed_password, salt=salt, role=Role.ORGANIZATION, md=dumps({'approved': False, 'logo_url': None}))

    try:
        db_client.session.add(user)
        db_client.session.commit()
    except:
        return jsonify({"error": "Error registering"}), 400
    
    try:
        session_id = session.set_session_pending_mfa(user.id)
    except:
        return jsonify({"error": "Try again later"}), 429
    response = jsonify({"message": "Registered"})
    response.set_cookie('session_id', session_id, httponly=True, secure=True) # FIXME: Get rid of secure=True as development server does not support HTTPS
    return response, 200


@users_bp.route('/register-mfa', methods=['POST'])
@authenticate()
def register_mfa():
    user: User = request.user
    secret = generate_totp_secret()
    uri = get_totp_auth_uri(user.email, secret)

    user.totp_secret = secret
    user.auth_stage = AuthStage.PENDING_MFA
    db_client.session.commit()
    return jsonify({"uri": uri}), 200


@users_bp.route('/logout', methods=['POST'])
@authenticate(check_csrf=True)
def logout():
    session.delete_session(request.session_id)
    return jsonify({"message": "Logged out"}), 200


@users_bp.route('/me', methods=['GET'])
@authenticate()
def me():
    user: User = request.user
    return jsonify({
        "name": user.name, 
        "email": user.email, 
        "role": user.role.value,
        "auth_stage": user.auth_stage.value,
        "metadata": loads(user.md)
    }), 200

@users_bp.route('/get-csrf', methods=['GET'])
@authenticate()
def get_csrf():
    session: dict = request.session
    return jsonify({"csrf_token": session["csrf_token"]}), 200

# sanity check routes
@users_bp.route('/check-admin-researcher', methods=['GET'])
@authenticate()
@check_roles([Role.ADMIN, Role.RESEARCHER])
def researcher_and_admin():
    return jsonify({"message": "Researcher and Admin"}), 200

@users_bp.route('/check-admin', methods=['GET'])
@authenticate()
@check_roles([Role.ADMIN])
def admin_only():
    return jsonify({"message": "Admin only"}), 200

@users_bp.route('/auth-stage', methods=['GET'])
@authenticate()
def auth_stage():
    user: User = request.user
    session: dict = request.session
    return jsonify({"auth_stage": user.auth_stage.value, "session_auth_stage": session["auth_stage"]}), 200
