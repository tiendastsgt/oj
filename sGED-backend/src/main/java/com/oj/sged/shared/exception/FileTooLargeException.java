package com.oj.sged.shared.exception;

/**
 * Excepción para archivos que exceden el tamaño permitido.
 */
public class FileTooLargeException extends RuntimeException {

    public FileTooLargeException(String message) {
        super(message);
    }
}
