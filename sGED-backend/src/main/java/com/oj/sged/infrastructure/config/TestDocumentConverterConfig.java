package com.oj.sged.infrastructure.config;

import java.lang.reflect.Proxy;
import org.jodconverter.core.DocumentConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class TestDocumentConverterConfig {

    @Bean
    @ConditionalOnMissingBean(DocumentConverter.class)
    public DocumentConverter documentConverter() {
        return (DocumentConverter) Proxy.newProxyInstance(
            DocumentConverter.class.getClassLoader(),
            new Class<?>[] {DocumentConverter.class},
            (proxy, method, args) -> {
                if (method.getDeclaringClass() == Object.class) {
                    return switch (method.getName()) {
                        case "toString" -> "TestDocumentConverterProxy";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> null;
                    };
                }
                throw new IllegalStateException("DocumentConverter not configured for test profile");
            }
        );
    }
}
