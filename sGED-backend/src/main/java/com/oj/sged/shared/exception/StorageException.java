package com.oj.sged.shared.exception;

/**
 * Excepción para errores de almacenamiento.
 */
public class StorageException extends RuntimeException {

    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
