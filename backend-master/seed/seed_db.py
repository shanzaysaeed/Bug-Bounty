from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Session
from db.models import User, JobRequest, AuthStage, Role, JobRequestState, Report, ReportState, Comment
from api.user import hash_password
from json import dumps

def seed_users(session: Session):
    users = [
        {'name': 'Test Org 1', 'email': 'testorg1@dummy.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.ORGANIZATION, 'md': dumps({'approved': True, 'logo_url': 'example.com'}), 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'Test Org 2', 'email': 'testorg2@dummy.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.ORGANIZATION, 'md': dumps({'approved': True, 'logo_url': 'example.com'}), 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'Shariiii', 'email': 'shari@bytebreakers.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.RESEARCHER, 'md': '{}', 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'admin', 'email': 'admin@bytebreakers.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.ADMIN, 'auth_stage': AuthStage.EMAIL_VERIFIED, 'md': dumps({'approved': True, 'logo_url': ''}), 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'Hackermans', 'email': 'hackermans@bytebreakers.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.RESEARCHER, 'md': '{}', 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'Google', 'email': 'bytebreakers@google.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.ORGANIZATION, 'md': dumps({'approved': True, 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png'}), 'auth_stage': AuthStage.MFA_VERIFIED},
        {'name': 'Facebook', 'email': 'bytebreakers@facebook.com', 'password': 'password123', 'salt': '', 'totp_secret': 'I64UMBUO3IXXPNXH4NHUDW6FRRK57C5Q', 'role': Role.ORGANIZATION, 'md': dumps({'approved': True, 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png'}), 'auth_stage': AuthStage.MFA_VERIFIED}
    ]
    
    try:
        for u in users:
            u['password'] = hash_password(u['password'], u['salt'])
            session.add(User(**u))
        session.commit()
    except:
        print('Error: Could not seed test user data')

def seed_requests(session: Session):
    requests = [
        {'title': 'First request', 'summary': 'This is the summary', 'description': '# Title\n\n This is a test', 'organization_id': 1, 'state': JobRequestState.APPROVED, 'disclosure_policy_url': 'example.com', 'tags': dumps(['tag1', 't2'])},
        {'title': 'Second request', 'summary': 'This is the summary', 'description': '# Title\n\n This is a test', 'organization_id': 1, 'state': JobRequestState.ARCHIVED, 'disclosure_policy_url': 'example.com', 'tags': dumps(['tag1', 't2'])},
        {'title': 'Third request', 'summary': 'This is the summary', 'description': '# Title\n\n This is a test', 'organization_id': 2, 'state': JobRequestState.APPROVED, 'disclosure_policy_url': 'example.com', 'tags': dumps(['tag1', 't2'])},
        {'title': 'Google request', 'summary': 'This is a Google-specific request', 'description': '# Google Request\n\n This is a test for Google', 'organization_id': 6, 'state': JobRequestState.APPROVED, 'disclosure_policy_url': 'https://google.com/disclosure', 'tags': dumps(['google', 'test'])},
        {'title': 'Facebook request', 'summary': 'This is a Facebook-specific request', 'description': '# Facebook Request\n\n This is a test for Facebook', 'organization_id': 7, 'state': JobRequestState.APPROVED, 'disclosure_policy_url': 'https://facebook.com/disclosure', 'tags': dumps(['facebook', 'test'])},
    ]

    try:
        for r in requests:
            session.add(JobRequest(**r))
        session.commit()
    except:
        print('Error: Could not seed test request data')

def seed_reports(session: Session):
    reports = [
        {'content': 'This is a report', 'user_has_unread': True, 'org_has_unread': True, 'status': ReportState.SUBMITTED, 'user_id': 3, 'job_request_id': 1},
        {'content': 'This is a report', 'user_has_unread': True, 'org_has_unread': True, 'status': ReportState.ACCEPTED, 'user_id': 5, 'job_request_id': 1},
        {'content': 'This is a report', 'user_has_unread': True, 'org_has_unread': True, 'status': ReportState.ACCEPTED, 'user_id': 5, 'job_request_id': 3}
    ]

    try:
        for r in reports:
            session.add(Report(**r))
        session.commit()
    except:
        print('Error: Could not seed test request data')

def seed_comments(session: Session):
    comments = [
        {'content': 'This is the first comment by the researcher', 'user_id': 5, 'report_id': 2},
        {'content': 'This is the first comment by the organization', 'user_id': 1, 'report_id': 2},
        {'content': 'This is the second comment by the researcher', 'user_id': 5, 'report_id': 2}
    ]

    try:
        for r in comments:
            session.add(Comment(**r))
        session.commit()
    except:
        print('Error: Could not seed test request data')

def seed_all(session: Session):
    seed_users(session)
    seed_requests(session)
    seed_reports(session)
    seed_comments(session)
