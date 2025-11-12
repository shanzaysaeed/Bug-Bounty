from api.user import hash_password
from db.models import Role, AuthStage
from json import dumps

PASSWORD = 'password10'

RESEARCHER = {'name': 'Researcher', 'email': 'researcher@test.com', 'password': hash_password(PASSWORD, ''), 'salt': '', 'role': Role.RESEARCHER, 'md': '{}', 'auth_stage': AuthStage.MFA_VERIFIED}
ORGANIZATION = {'name': 'Organization', 'email': 'organization@test.com', 'password': hash_password(PASSWORD, ''), 'salt': '', 'role': Role.ORGANIZATION, 'md': dumps({'approved': True, 'logo_url': 'example.com'}), 'auth_stage': AuthStage.MFA_VERIFIED}
ADMIN = {'name': 'Admin', 'email': 'admin@test.com', 'password': hash_password(PASSWORD, ''), 'salt': '', 'role': Role.ADMIN, 'md': '{}', 'auth_stage': AuthStage.MFA_VERIFIED}
