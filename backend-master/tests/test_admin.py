import json
from db.models import AuthStage, JobRequest, JobRequestState, User, Role
from db.client import db_client
import redis_lib.session as session
from consts import RESEARCHER, ORGANIZATION, ADMIN, PASSWORD
from util.auth import hash_password

"""
=================================================
-------------------------------------------------
                    delete_user()
-------------------------------------------------
test_delete_user_success
test_delete_user_no_id
test_delete_user_not_found
test_delete_no_perms
=================================================
"""

def add_test_user(client, role=Role.RESEARCHER):
    user_info = {
        'name': 'Test User',
        'email': 'testuser@bytebreaker',
        'password': hash_password(PASSWORD, ''),
        'salt': '',
        'totp_secret': '',
        'role': role,
        'md': '{}',
        'auth_stage': AuthStage.MFA_VERIFIED
    }
    with client.application.app_context():
        try:
            db_client.session.add(User(**user_info))
            db_client.session.commit()
        except:
            pass
    return user_info

def delete_test_user(client):
    with client.application.app_context():
        to_delete = User.query.filter_by(email='testuser@bytebreaker').first()
        if to_delete is not None:
            db_client.session.delete(to_delete)
            db_client.session.commit()

def get_admin_with_mfa(client):
    with client.application.app_context():
        admin = User.query.filter_by(email=ADMIN['email']).first()
    # redis
    session_id = session.set_session_pending_mfa(admin.id)
    session.set_session_mfa_verified(session_id)
    return admin, session_id

def get_researcher_with_mfa(client):
    with client.application.app_context():
        researcher = User.query.filter_by(email=RESEARCHER['email']).first()
    # redis
    session_id = session.set_session_pending_mfa(researcher.id)
    session.set_session_mfa_verified(session_id)
    return researcher, session_id

def get_organization_with_mfa(client):
    with client.application.app_context():
        organization = User.query.filter_by(email=ORGANIZATION['email']).first()
    # redis
    session_id = session.set_session_pending_mfa(organization.id)
    session.set_session_mfa_verified(session_id)
    return organization, session_id

# register a user, login as admin, delete the user
def test_delete_user_success(client):
    user_info = add_test_user(client)
    _, session_id = get_admin_with_mfa(client)

    with client.application.app_context():
        to_delete = User.query.filter_by(email=user_info["email"]).first()
        assert to_delete is not None
        client.set_cookie('session_id', session_id)
        response = client.post('/api/admin/delete-user', json={
            "user_id": to_delete.id
        })
    assert response.status_code == 200
    assert response.json['message'] == 'User deleted'

    with client.application.app_context():
        to_delete = User.query.filter_by(email=user_info["email"]).first()
        assert to_delete is None

# non admin shouldn't be able to delete a user
def test_delete_no_perms(client):
    user_info = add_test_user(client)
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            to_delete = User.query.filter_by(email=user_info["email"]).first()
            assert to_delete is not None
            client.set_cookie('session_id', session_id)
            response = client.post('/api/admin/delete-user', json={
                "user_id": to_delete.id
            })
            to_delete = User.query.filter_by(email=user_info["email"]).first()
            assert to_delete is not None
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'

    delete_test_user(client)

def test_researchers(client):
    user_info = add_test_user(client)
    _, session_id = get_admin_with_mfa(client)

    with client.application.app_context():
        client.set_cookie('session_id', session_id)
        response = client.get('/api/admin/researchers')
    assert response.status_code == 200
    researchers = response.json
    for i in range(len(researchers)):
        del researchers[i]['id']
    assert researchers == [
        {"name": RESEARCHER["name"], "email": RESEARCHER["email"]},
        {"name": user_info["name"], "email": user_info["email"]},
    ]

    delete_test_user(client)

# non admins shouldn't be able to access the researchers endpoint
def test_researchers_no_perms(client):
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:
        with client.application.app_context():
            client.set_cookie('session_id', session_id)
            response = client.get('/api/admin/researchers')
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'


def test_organizations(client):
    user_info = add_test_user(client, Role.ORGANIZATION)
    _, session_id = get_admin_with_mfa(client)

    with client.application.app_context():
        client.set_cookie('session_id', session_id)
        response = client.get('/api/admin/organizations')
    assert response.status_code == 200
    organizations = response.json
    for i in range(len(organizations)):
        del organizations[i]['id']
    assert organizations == [
        {"name": ORGANIZATION["name"], "email": ORGANIZATION["email"]},
        {"name": user_info["name"], "email": user_info["email"]},
    ]

    delete_test_user(client)

def test_organizations_no_perms(client):
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            client.set_cookie('session_id', session_id)
            response = client.get('/api/admin/organizations')
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'

def test_user(client):
    _, session_id = get_admin_with_mfa(client)

    with client.application.app_context():
        u = User.query.filter_by(email=RESEARCHER["email"]).first()
        client.set_cookie('session_id', session_id)
        response = client.get('/api/admin/user', json={
            "user_id": u.id
        })
    assert response.status_code == 200
    res = response.json
    del res['id']
    assert res == {
        "name": RESEARCHER["name"],
        "email": RESEARCHER["email"],
        "auth_stage": AuthStage.MFA_VERIFIED.value
    }

def test_user_no_perms(client):
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            u = User.query.filter_by(email=RESEARCHER["email"]).first()
            client.set_cookie('session_id', session_id)
            response = client.get('/api/admin/user', json={
                "user_id": u.id
            })
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'

def add_unapproved_organization(client):
    org_info = {
        'name': 'Test Organization',
        'email': 'testorg@byte.com',
        'password': hash_password(PASSWORD, ''),
        'salt': '',
        'totp_secret': '',
        'role': Role.ORGANIZATION,
        'md': json.dumps({'approved': False, 'logo_url': 'example.com'}),
        'auth_stage': AuthStage.MFA_VERIFIED
    }
    with client.application.app_context():
        db_client.session.add(User(**org_info))
        db_client.session.commit()
    return org_info

def delete_unapproved_organization(client):
    with client.application.app_context():
        to_delete = User.query.filter_by(email='testorg@byte.com').first()
        if to_delete is not None:
            db_client.session.delete(to_delete)
            db_client.session.commit()

def test_approve_organization(client):
    org_info = add_unapproved_organization(client)
    _, session_id = get_admin_with_mfa(client)

    with client.application.app_context():
        org = User.query.filter_by(email=org_info["email"]).first()
        assert org is not None
        assert org.md == json.dumps({'approved': False, 'logo_url': 'example.com'})

        client.set_cookie('session_id', session_id)
        response = client.get('/api/admin/approve-organization', json={
            "organization_id": org.id
        })

        org = User.query.filter_by(email=org_info["email"]).first()
        assert org.md == json.dumps({'approved': True, 'logo_url': 'example.com'})

    assert response.status_code == 200
    assert response.json['message'] == 'Organization approved'

    delete_unapproved_organization(client)

def test_approve_organization_no_perms(client):
    org_info = add_unapproved_organization(client)
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            org = User.query.filter_by(email=org_info["email"]).first()
            assert org is not None
            assert org.md == json.dumps({'approved': False, 'logo_url': 'example.com'})

            client.set_cookie('session_id', session_id)
            response = client.get('/api/admin/approve-organization', json={
                "organization_id": org.id
            })

            org = User.query.filter_by(email=org_info["email"]).first()
            assert org.md == json.dumps({'approved': False, 'logo_url': 'example.com'})

        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'

    delete_unapproved_organization(client)

def add_test_request(client, state):
    request_info = {
        'title': 'Test Request',
        'summary': 'This is the summary',
        'description': '# Title\n\n This is a test',
        'organization_id': 1,
        'state': state,
        'disclosure_policy_url': 'example.com',
        'tags': json.dumps(['tag1', 't2'])
    }
    with client.application.app_context():
        db_client.session.add(JobRequest(**request_info))
        db_client.session.commit()
    return request_info

def delete_test_request(client):
    with client.application.app_context():
        to_delete = JobRequest.query.filter_by(title='Test Request').first()
        if to_delete is not None:
            db_client.session.delete(to_delete)
            db_client.session.commit()

def test_approve_request(client):
    _, session_id = get_admin_with_mfa(client)
    request_info = add_test_request(client, JobRequestState.SUBMITTED)

    with client.application.app_context():
        r = JobRequest.query.filter_by(title=request_info["title"]).first()
        assert r is not None
        assert r.state == JobRequestState.SUBMITTED

        client.set_cookie('session_id', session_id)
        response = client.post('/api/admin/approve-request', json={
            "request_id": r.id
        })

        r = JobRequest.query.filter_by(title=request_info['title']).first()
        assert r.state == JobRequestState.APPROVED
    
    assert response.status_code == 200
    assert response.json['message'] == 'Request approved'
    delete_test_request(client)

def test_approve_request_no_perms(client):
    request_info = add_test_request(client, JobRequestState.SUBMITTED)
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            r = JobRequest.query.filter_by(title=request_info["title"]).first()
            assert r is not None
            assert r.state == JobRequestState.SUBMITTED

            client.set_cookie('session_id', session_id)
            response = client.post('/api/admin/approve-request', json={
                "request_id": r.id
            })

            r = JobRequest.query.filter_by(title=request_info['title']).first()
            assert r.state == JobRequestState.SUBMITTED
        
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'
    delete_test_request(client)

def test_reject_request(client):
    _, session_id = get_admin_with_mfa(client)
    request_info = add_test_request(client, JobRequestState.SUBMITTED)

    with client.application.app_context():
        r = JobRequest.query.filter_by(title=request_info["title"]).first()
        assert r is not None
        assert r.state == JobRequestState.SUBMITTED

        client.set_cookie('session_id', session_id)
        response = client.post('/api/admin/reject-request', json={
            "request_id": r.id
        })

        r = JobRequest.query.filter_by(title=request_info['title']).first()
        assert r.state == JobRequestState.REJECTED
    
    assert response.status_code == 200
    assert response.json['message'] == 'Request rejected'
    delete_test_request(client)

def test_delete_request_no_perms(client):
    request_info = add_test_request(client, JobRequestState.SUBMITTED)
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            r = JobRequest.query.filter_by(title=request_info["title"]).first()
            assert r is not None

            client.set_cookie('session_id', session_id)
            response = client.post('/api/admin/delete-request', json={
                "request_id": r.id
            })

            r = JobRequest.query.filter_by(title=request_info['title']).first()
            assert r is not None
        
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'
    delete_test_request(client)

def test_delete_request(client):
    _, session_id = get_admin_with_mfa(client)
    request_info = add_test_request(client, JobRequestState.SUBMITTED)

    with client.application.app_context():
        r = JobRequest.query.filter_by(title=request_info["title"]).first()
        assert r is not None

        client.set_cookie('session_id', session_id)
        response = client.post('/api/admin/delete-request', json={
            "request_id": r.id
        })

        r = JobRequest.query.filter_by(title=request_info['title']).first()
        assert r is None
    
    assert response.status_code == 200
    assert response.json['message'] == 'Request deleted'

def test_reject_request_no_perms(client):
    request_info = add_test_request(client, JobRequestState.SUBMITTED)
    for session_id in [get_organization_with_mfa(client)[1], get_researcher_with_mfa(client)[1]]:

        with client.application.app_context():
            r = JobRequest.query.filter_by(title=request_info["title"]).first()
            assert r is not None
            assert r.state == JobRequestState.SUBMITTED

            client.set_cookie('session_id', session_id)
            response = client.post('/api/admin/reject-request', json={
                "request_id": r.id
            })

            r = JobRequest.query.filter_by(title=request_info['title']).first()
            assert r.state == JobRequestState.SUBMITTED
        
        assert response.status_code == 403
        assert response.json['message'] == 'Unauthorized'
    delete_test_request(client)
