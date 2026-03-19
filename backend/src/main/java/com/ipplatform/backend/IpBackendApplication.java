package com.ipplatform.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class IpBackendApplication {

    public static void main(String[] args) {
        // Load .env BEFORE Spring starts.
        // DotenvConfig (@PostConstruct) fires too late — HikariCP reads datasource URL
        // during context init, before @PostConstruct beans run.
        // Try both CWDs: /backend (mvnw) and /internship_ISB (IDE launch).
        String[] candidates = {
                "./", // mvnw clean spring-boot:run from /backend
                "Global-IP-Intelligence-Platform/backend" // IDE run from /internship_ISB
        };

        Dotenv dotenv = null;
        for (String dir : candidates) {
            if (new File(dir, ".env").exists()) {
                dotenv = Dotenv.configure().directory(dir).ignoreIfMissing().load();
                break;
            }
        }
        if (dotenv == null) {
            dotenv = Dotenv.configure().ignoreIfMissing().load();
        }
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));

        SpringApplication.run(IpBackendApplication.class, args);
    }
}
