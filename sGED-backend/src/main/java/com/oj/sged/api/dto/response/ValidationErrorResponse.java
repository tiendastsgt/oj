package com.oj.sged.api.dto.response;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidationErrorResponse {

    private boolean success;
    private String message;
    private List<String> errors;
    private Instant timestamp;

    public static ValidationErrorResponse of(String message, List<String> errors) {
        return ValidationErrorResponse.builder()
            .success(false)
            .message(message)
            .errors(errors)
            .timestamp(Instant.now())
            .build();
    }
}
