package com.oj.sged.shared.exception;

public class AuthException extends RuntimeException {

    private final AuthErrorCode errorCode;

    public AuthException(AuthErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public AuthErrorCode getErrorCode() {
        return errorCode;
    }

    public enum AuthErrorCode {
        INVALID_CREDENTIALS,
        ACCOUNT_BLOCKED
    }
}
