from src.shared.validators import validate_password_strength


def test_validate_password_strength_accepts_strong_password():
    validate_password_strength("Abcdef1!")


def test_validate_password_strength_rejects_short_password():
    try:
        validate_password_strength("Ab1!")
        assert False, "Expected ValueError for short password"
    except ValueError as exc:
        assert "al menos" in str(exc)


def test_validate_password_strength_rejects_missing_complexity():
    try:
        validate_password_strength("abcdefgh")
        assert False, "Expected ValueError for missing complexity"
    except ValueError as exc:
        assert "mayúscula" in str(exc) or "número" in str(exc) or "símbolo" in str(exc)
