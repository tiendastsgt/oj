package com.oj.sged.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseData {

    private String token;
    private String username;
    private String nombreCompleto;
    private String rol;
    private String juzgado;
    private boolean debeCambiarPassword;
}
