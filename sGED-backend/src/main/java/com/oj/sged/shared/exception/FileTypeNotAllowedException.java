package com.oj.sged.shared.exception;

/**
 * Excepción para archivos con formato no permitido.
 */
public class FileTypeNotAllowedException extends RuntimeException {

    public FileTypeNotAllowedException(String message) {
        super(message);
    }
}
