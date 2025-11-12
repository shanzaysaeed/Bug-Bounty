from db.models import User, Role
from consts import RESEARCHER, ORGANIZATION, ADMIN, PASSWORD

"""
=================================================
-------------------------------------------------
                    register()
-------------------------------------------------
test_register_success
test_register_too_short_password
test_register_invalid_email
test_register_empty_email
test_register_empty_name
test_register_too_long_password
test_register_duplicate_user
=================================================
"""

def test_register_success(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": "valid@test.com",
        "password": "password10"
    })
    assert response.status_code == 200  
    assert response.json['message'] == 'Registered'

    with client.application.app_context():
        user = User.query.filter_by(email="valid@test.com").first()
        assert user is not None
        assert user.name == "Test User"
    
def test_register_too_short_password(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": "shortpassword@test.com",
        "password": "short"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Password must be between 10 to 64 characters'

    with client.application.app_context():
        user = User.query.filter_by(email="shortpassword@test.com").first()
        assert user is None

def test_register_invalid_email(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": "invalid-email",
        "password": "password10"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid email format'

    with client.application.app_context():
        user = User.query.filter_by(email="invalid-email").first()
        assert user is None

def test_register_empty_email(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": "",
        "password": "password10"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid email format'

    with client.application.app_context():
        user = User.query.filter_by(email="").first()
        assert user is None

def test_register_empty_name(client):
    response = client.post('/api/users/register', json={
        "name": "",
        "email": "emptyname@test.com",
        "password": "password10"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Name cannot be empty'

    with client.application.app_context():
        user = User.query.filter_by(email="emptyname@test.com").first()
        assert user is None

def test_register_too_long_password(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": "longpassword@test.com",
        "password": "p" * 65
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Password must be between 10 to 64 characters'

    with client.application.app_context():
        user = User.query.filter_by(email="longpassword@test.com").first()
        assert user is None

def test_register_duplicate_user(client):
    response = client.post('/api/users/register', json={
        "name": "Test User",
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    assert response.status_code == 400
    assert response.json['error'] == 'User already exists'

    with client.application.app_context():
        user = User.query.filter_by(email=RESEARCHER['email']).all()
        assert len(user) == 1

"""
=================================================
-------------------------------------------------
                register_org()
-------------------------------------------------
test_register_org_success
test_register_org_too_short_password
test_register_org_invalid_email
test_register_org_empty_email
test_register_org_empty_name
test_register_org_too_long_password
test_register_org_duplicate_user
=================================================
"""

def test_register_org_success(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": "validorg@test.com",
        "password": "password10",
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 200  
    assert response.json['message'] == 'Registered'

    with client.application.app_context():
        user = User.query.filter_by(email="validorg@test.com").first()
        assert user is not None
        assert user.name == "Test Org"
    
def test_register_org_too_short_password(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": "shortpasswordorg@test.com",
        "password": "short",
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Password must be between 10 to 64 characters'

    with client.application.app_context():
        user = User.query.filter_by(email="shortpasswordorg@test.com").first()
        assert user is None

def test_register_org_invalid_email(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": "invalid-email",
        "password": "password10",
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid email format'

    with client.application.app_context():
        user = User.query.filter_by(email="invalid-email").first()
        assert user is None

def test_register_org_empty_email(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": "",
        "password": "password10",
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid email format'

    with client.application.app_context():
        user = User.query.filter_by(email="").first()
        assert user is None

def test_register_org_empty_name(client):
    response = client.post('/api/users/register-org', json={
        "name": "",
        "email": "emptynameorg@test.com",
        "password": "password10",
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Name cannot be empty'

    with client.application.app_context():
        user = User.query.filter_by(email="emptynameorg@test.com").first()
        assert user is None

def test_register_org_too_long_password(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": "longpasswordorg@test.com",
        "password": "p" * 65,
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'Password must be between 10 to 64 characters'

    with client.application.app_context():
        user = User.query.filter_by(email="longpasswordorg@test.com").first()
        assert user is None

def test_register_org_duplicate_user(client):
    response = client.post('/api/users/register-org', json={
        "name": "Test Org",
        "email": ORGANIZATION['email'],
        "password": PASSWORD,
        "logo_url": "http://example.com/logo.png"
    })
    assert response.status_code == 400
    assert response.json['error'] == 'User already exists'

    with client.application.app_context():
        user = User.query.filter_by(email=ORGANIZATION['email']).all()
        assert len(user) == 1

"""
=================================================
-------------------------------------------------
                login_password()
-------------------------------------------------
test_login_password_success
test_login_password_no_email
test_login_password_incorrect_password
test_login_password_no_user
test_login_password_rate_limited
=================================================
"""

def test_login_password_success(client):
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    assert response.status_code == 200
    assert response.json['message'] == 'Logged in'

def test_login_password_no_email(client):
    response = client.post('/api/users/login-password', json={
        "email": "",
        "password": "password10"
    })
    assert response.status_code == 401
    assert response.json['error'] == 'Error logging in'

def test_login_password_incorrect_password(client):
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": 'incorrect'
    })
    assert response.status_code == 401
    assert response.json['error'] == 'Error logging in'

def test_login_password_no_user(client):
    response = client.post('/api/users/login-password', json={
        "email": "nonexistent@test.com",
        "password": "password10"
    })
    assert response.status_code == 401
    assert response.json['error'] == 'Error logging in'

def test_login_password_rate_limited(client):
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    assert response.status_code == 429
    assert response.json['error'] == 'Try again later'

"""
=================================================
-------------------------------------------------
                    logout()
-------------------------------------------------
test_logout_success
test_logout_not_logged_in
=================================================
"""

def test_logout_success(client):
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    assert response.status_code == 200
    assert response.json['message'] == 'Logged in'

    response = client.post('/api/users/logout')
    assert response.status_code == 200
    assert response.json['message'] == 'Logged out'

def test_logout_not_logged_in(client):
    response = client.post('/api/users/logout')
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid session'

"""
=================================================
-------------------------------------------------
                    me()
-------------------------------------------------
test_me_success
test_me_not_logged_in
=================================================
"""

def test_me_success(client):
    response = client.post('/api/users/login-password', json={
        "email": RESEARCHER['email'],
        "password": PASSWORD
    })
    assert response.status_code == 200
    assert response.json['message'] == 'Logged in'

    response = client.get('/api/users/me')
    assert response.status_code == 200
    assert response.json['email'] == RESEARCHER['email']
    assert response.json['name'] == RESEARCHER['name']
    assert response.json['role'] == Role.RESEARCHER.value

def test_me_not_logged_in(client):
    response = client.get('/api/users/me')
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid session'
