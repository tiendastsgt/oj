package com.oj.sged.shared.util;

import java.util.Locale;

public final class DocumentoCategoriaUtil {

    private DocumentoCategoriaUtil() {
    }

    public static String resolveCategoria(String extension) {
        if (extension == null) {
            return "DESCONOCIDO";
        }
        String ext = extension.toLowerCase(Locale.ROOT);
        if (ext.equals("pdf")) {
            return "PDF";
        }
        if (ext.equals("doc") || ext.equals("docx")) {
            return "WORD";
        }
        if (ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png") || ext.equals("gif") || ext.equals("bmp")) {
            return "IMAGEN";
        }
        if (ext.equals("mp3") || ext.equals("wav") || ext.equals("ogg")) {
            return "AUDIO";
        }
        if (ext.equals("mp4") || ext.equals("webm") || ext.equals("avi") || ext.equals("mov")) {
            return "VIDEO";
        }
        return "DESCONOCIDO";
    }
}
