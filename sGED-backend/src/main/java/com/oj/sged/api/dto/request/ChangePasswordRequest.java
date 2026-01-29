package com.oj.sged.api.dto.request;

import lombok.Data;

@Data
public class ChangePasswordRequest {

    private String passwordActual;
    private String passwordNuevo;
    private String passwordConfirmacion;
}
