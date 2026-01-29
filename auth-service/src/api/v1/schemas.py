"""
Schemas Pydantic para API v1 - Autenticación
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from src.shared.validators import validate_password_strength
from src.shared.rbac import normalize_role, DEFAULT_APP_ROLE


class LoginRequest(BaseModel):
    """Request para login"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=6, description="Contraseña")


class SignupRequest(BaseModel):
    """Request para registro"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(
        ...,
        min_length=8,
        description="Contraseña (mínimo 8 caracteres, complejidad requerida)",
    )
    company_id: str = Field(..., description="ID de la empresa")
    app_role: Optional[str] = Field(
        DEFAULT_APP_ROLE,
        description="Rol de aplicación (default: CONSULTA)",
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """Valida fortaleza de contraseña."""
        validate_password_strength(value)
        return value

    @field_validator("app_role")
    @classmethod
    def normalize_app_role(cls, value: Optional[str]) -> str:
        """Normaliza rol para SGED."""
        return normalize_role(value)


class RefreshTokenRequest(BaseModel):
    """Request para refrescar token"""
    refresh_token: str = Field(..., description="Refresh token")


class ResetPasswordRequest(BaseModel):
    """Request para recuperar contraseña"""
    email: EmailStr = Field(..., description="Email del usuario")


class ChangePasswordRequest(BaseModel):
    """Request para cambio de contraseña"""
    current_password: str = Field(..., min_length=8, description="Contraseña actual")
    new_password: str = Field(
        ...,
        min_length=8,
        description="Nueva contraseña (mínimo 8 caracteres, complejidad requerida)",
    )
    confirm_new_password: Optional[str] = Field(
        None,
        description="Confirmación de la nueva contraseña (opcional)",
    )

    @model_validator(mode="after")
    def confirm_passwords_match(self) -> "ChangePasswordRequest":
        if self.confirm_new_password is not None and self.new_password != self.confirm_new_password:
            raise ValueError("confirm_new_password no coincide con new_password")
        return self


class UserResponse(BaseModel):
    """Response con información del usuario"""
    id: str
    email: str
    company_id: str
    company_name: Optional[str] = None
    company_nit: Optional[str] = None
    app_role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response con tokens de autenticación"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginResponse(BaseModel):
    """Response de login"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class SignupResponse(BaseModel):
    """Response de signup"""
    success: bool
    user: UserResponse
    message: str


class RefreshTokenResponse(BaseModel):
    """Response de refresh token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    """Response genérico con mensaje"""
    message: str
    success: Optional[bool] = True
