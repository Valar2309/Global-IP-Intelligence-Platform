package com.ipplatform.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class IpBackendApplication {

    @Value("${SUPABASE_DB_PASSWORD}")
    private String dbPass;

    public static void main(String[] args) {
        SpringApplication.run(IpBackendApplication.class, args);
    }

    @PostConstruct
    public void testEnv() {
        System.out.println("DB PASSWORD: " + dbPass);
    }
}
