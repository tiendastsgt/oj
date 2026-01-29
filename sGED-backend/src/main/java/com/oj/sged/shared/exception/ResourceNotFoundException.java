package com.oj.sged.shared.exception;

/**
 * Excepción para recursos inexistentes.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
