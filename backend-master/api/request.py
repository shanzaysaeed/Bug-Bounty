from flask import Blueprint, request, jsonify
from db.models import JobRequest, JobRequestState, Role, User
from db.client import db_client
from middleware.auth import authenticate, check_roles, check_auth_stage
from json import loads, dumps

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/create-request', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ORGANIZATION])
def create_request():
    print('create-request')

    org: User = request.user
    data = request.json
    title: str = data.get('title')
    summary: str = data.get('summary')
    description: str = data.get('description')
    disclosure_policy_url: str = data.get('disclosure_policy_url')
    tags = data.get('tags')

    r = JobRequest(title=title, summary=summary, description=description, state=JobRequestState.CREATED, organization_id=org.id, disclosure_policy_url=disclosure_policy_url, tags=dumps(tags))

    try:
        db_client.session.add(r)
        db_client.session.commit()
    except:
        return jsonify({"error": "Error creating request"}), 400
    return jsonify({"message": "Request created"}), 200

@requests_bp.route('/update-request', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ORGANIZATION])
def update_request():
    org: User = request.user
    data = request.json
    title: str = data.get('title')
    summary: str = data.get('summary')
    description: str = data.get('description')
    disclosure_policy_url: str = data.get('disclosure_policy_url')
    tags = data.get('tags')
    request_id = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()

    if not r or r.organization_id != org.id:
        return jsonify({"error": "Error finding report or invalid credentials"}), 404

    r.title = title
    r.summary = summary
    r.description = description
    r.disclosure_policy_url = disclosure_policy_url
    r.tags = dumps(tags)
    r.state = JobRequestState.CREATED

    try:
        db_client.session.commit()
    except:
        return jsonify({"error": "Error updating request"}), 400
    return jsonify({"message": "Request updated"}), 200

@requests_bp.route('/submit-for-approval', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ORGANIZATION])
def submit_for_approval():
    print('submit-for-approval')

    org: User = request.user
    data = request.json
    request_id: str = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()
    if not r or r.organization != org:
        return jsonify({"error": "Error finding report or invalid credentials"}), 404
    
    if r.state != JobRequestState.CREATED:
        return jsonify({"error": "Error report in invalid state"}), 400

    r.state = JobRequestState.SUBMITTED
    
    try:
        db_client.session.commit()
    except:
        return jsonify({"error": "Error submitting request for approval"}), 400
    return jsonify({"message": "Request submitted for approval"}), 200

@requests_bp.route('/archive', methods=['POST'])
@authenticate(check_csrf=True)
@check_auth_stage()
@check_roles([Role.ORGANIZATION])
def archive():
    org: User = request.user
    data = request.json
    request_id: str = data.get('request_id')

    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()
    if not r or r.organization != org:
        return jsonify({"error": "Error finding request or invalid credentials"}), 404
    
    r.state = JobRequestState.ARCHIVED
    
    try:
        db_client.session.commit()
    except:
        return jsonify({"error": "Error archiving request"}), 400
    return jsonify({"message": "Request archived"}), 200

@requests_bp.route('/get-all', methods=['GET'])
@authenticate()
@check_auth_stage()
def get_all():
    u: User = request.user
    ref = request.headers.get('Referer', '')
    
    if u.role == Role.RESEARCHER and 'org' not in ref and 'admin' not in ref:
        requests = db_client.session.query(JobRequest).filter_by(state=JobRequestState.APPROVED).all()
        r = [{
                'id': _.id,
                'state': _.state.value,
                'title': _.title,
                'company': _.organization.name,
                'datePosted': _.updated_at,
                'previewDescription': _.summary,
                'detailedDescription': _.description,
                'logo': loads(_.organization.md)['logo_url'],
                'tags': loads(_.tags),
                'responsibleDisclosureUrl': _.disclosure_policy_url
            } for _ in requests]
        
        return jsonify({"message": "Requests returned", "requests": r}), 200
    elif u.role == Role.ORGANIZATION and 'org' in ref:
        requests = db_client.session.query(JobRequest).filter_by(organization_id=u.id).all()
        r = [{
                'id': _.id,
                'state': _.state.value,
                'title': _.title,
                'company': _.organization.name,
                'datePosted': _.updated_at,
                'previewDescription': _.summary,
                'detailedDescription': _.description,
                'logo': loads(_.organization.md)['logo_url'],
                'tags': loads(_.tags),
                'responsibleDisclosureUrl': _.disclosure_policy_url
            } for _ in requests]
        
        return jsonify({"message": "Requests returned", "requests": r}), 200
    elif u.role == Role.ADMIN and 'admin' in ref:
        requests = db_client.session.query(JobRequest).all()
        r = [{
                'id': _.id,
                'state': _.state.value,
                'title': _.title,
                'company': _.organization.name,
                'datePosted': _.updated_at,
                'previewDescription': _.summary,
                'detailedDescription': _.description,
                'logo': loads(_.organization.md)['logo_url'],
                'tags': loads(_.tags),
                'responsibleDisclosureUrl': _.disclosure_policy_url
            } for _ in requests]
        
        return jsonify({"message": "Requests returned", "requests": r}), 200
    else:
        return jsonify({"error": "Invalid permission"}), 401

@requests_bp.route('/get-by-id', methods=['GET'])
@authenticate()
@check_auth_stage()
def get_by_id():
    u: User = request.user
    request_id: str | None = request.args.get('request_id')
    if not request_id:
        return jsonify({"message": "request_id query param is required"}), 400 
    
    r = db_client.session.query(JobRequest).filter_by(id=request_id).first()

    if not r or (u.role == Role.RESEARCHER and r.state != JobRequestState.APPROVED):
        return jsonify({"message": "Request not found"}), 404

    r = [{
            'id': _.id,
            'state': _.state.value,
            'title': _.title,
            'company': _.organization.name,
            'datePosted': _.updated_at,
            'previewDescription': _.summary,
            'detailedDescription': _.description,
            'logo': loads(_.organization.md)['logo_url'],
            'tags': loads(_.tags),
            'responsibleDisclosureUrl': _.disclosure_policy_url
        } for _ in [r]][0]
    
    return jsonify({"message": "Request returned", "request": r}), 200
