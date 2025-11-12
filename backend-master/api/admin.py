from flask import Blueprint, request, jsonify
from db.models import AuthStage, User, Role, JobRequest, JobRequestState
from db.client import db_client
from middleware.auth import SessionAuthStage, check_auth_stage, authenticate, check_roles
from json import dumps, loads

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/delete-user', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ADMIN])
def delete_user():
    data = request.json
    user_id: str = data.get('user_id')
    if not user_id:
        return jsonify({"error": "No ID provided"}), 400
    user = db_client.session.query(User).filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    db_client.session.delete(user)
    db_client.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route('/researchers', methods=['GET'])
@authenticate()
@check_roles([Role.ADMIN])
@check_auth_stage()
def researchers():
    users = db_client.session.query(User).filter_by(role=Role.RESEARCHER).all()
    return jsonify([{"name": user.name, "email": user.email, "id": user.id} for user in users]), 200

@admin_bp.route('/organizations', methods=['GET'])
@authenticate()
@check_auth_stage(session_auth_stage = SessionAuthStage.PASSWORD)
@check_roles([Role.ADMIN])
def organizations():
    users = db_client.session.query(User).filter_by(role=Role.ORGANIZATION).all()
    return jsonify([{"name": user.name, "email": user.email, "id": user.id, "metadata": loads(user.md)} for user in users]), 200

@admin_bp.route('/submitted-postings', methods=['GET'])
@authenticate()
@check_auth_stage(session_auth_stage = SessionAuthStage.PASSWORD)
@check_roles([Role.ADMIN])
def submitted_job_postings():
    job_requests = db_client.session.query(JobRequest).filter_by(state=JobRequestState.SUBMITTED).all()

    r = [{
        'id': _.id,
        'state': _.state.value,
        'title': _.title,
        'company': _.organization.name,
        'datePosted': _.updated_at,
        'previewDescription': _.summary,
        'detailedDescription': _.description,
        'tags': loads(_.tags),
        'responsibleDisclosureUrl': _.disclosure_policy_url
    } for _ in job_requests]

    return jsonify(r), 200

@admin_bp.route('/approve-organization', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ADMIN])
def approve_organization():
    organization_id: int = request.json.get('organization_id')
    org = db_client.session.query(User).filter_by(id=organization_id).first()
    if not org:
        return jsonify({"error": "User not found"}), 404
    if org.role != Role.ORGANIZATION:
        return jsonify({"error": "User is not an organization"}), 400
    
    md = loads(org.md)
    md['approved'] = True
    org.md = dumps(md)
    db_client.session.commit()
    return jsonify({"message": "Organization approved"}), 200


@admin_bp.route('/approve-request', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ADMIN])
def approve_request():
    data = request.json
    request_id: str = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()
    if not r:
        return jsonify({"error": "Error finding report"}), 404
    
    if r.state != JobRequestState.SUBMITTED:
        return jsonify({"error": "Error report in invalid state"}), 400

    r.state = JobRequestState.APPROVED
    
    try:
        db_client.session.commit()
    except:
        return jsonify({"error": "Error approving request"}), 400
    return jsonify({"message": "Request approved"}), 200

@admin_bp.route('/reject-request', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ADMIN])
def reject_request():
    data = request.json
    request_id: str = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()
    if not r:
        return jsonify({"error": "Error finding report"}), 404
    
    if r.state != JobRequestState.SUBMITTED:
        return jsonify({"error": "Error report in invalid state"}), 400

    r.state = JobRequestState.REJECTED
    
    try:
        db_client.session.commit()
    except:
        return jsonify({"error": "Error rejecting request"}), 400
    return jsonify({"message": "Request rejected"}), 200

@admin_bp.route('/delete-request', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ADMIN])
def delete_request():
    data = request.json
    request_id: str = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()
    if not r:
        return jsonify({"error": "Error finding report"}), 404
    
    try:
        db_client.session.delete(r)
        db_client.session.commit()
    except:
        return jsonify({"error": "Error deleting request"}), 400
    return jsonify({"message": "Request deleted"}), 200
