package com.oj.sged.shared.exception;

import java.util.List;

public class InvalidReferenceException extends RuntimeException {

    private final List<String> errors;

    public InvalidReferenceException(List<String> errors) {
        super("Error de validación");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
