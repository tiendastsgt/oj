from jose import jwt

from src.application.services import AuthService


def test_create_access_token_contains_jti():
    service = AuthService()
    token = service._create_access_token(
        user_id="user-123",
        email="user@example.com",
        company_id="company-123",
        app_role="user",
    )
    payload = jwt.get_unverified_claims(token)
    assert payload.get("jti")
    assert payload.get("type") == "access"
