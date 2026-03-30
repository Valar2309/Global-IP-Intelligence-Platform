package com.ipplatform.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.util.List;
import java.util.ArrayList;

@SpringBootApplication
public class IpBackendApplication {

    private static final Logger log = LoggerFactory.getLogger(IpBackendApplication.class);

    public static void main(String[] args) {
        // 1. Load .env BEFORE Spring starts.
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

        // Only set properties from .env IF they are not already set in the system (Render/Docker priority)
        dotenv.entries().forEach(e -> {
            if (System.getProperty(e.getKey()) == null && System.getenv(e.getKey()) == null) {
                System.setProperty(e.getKey(), e.getValue());
            }
        });

        // 2. Validate Environment — Fail-fast if mandatory keys are missing
        validateEnvironment();

        SpringApplication.run(IpBackendApplication.class, args);
    }

    private static void validateEnvironment() {
        List<String> required = List.of(
                "SUPABASE_DB_HOST", "SUPABASE_DB_PORT", "SUPABASE_DB_NAME",
                "SUPABASE_DB_USERNAME", "SUPABASE_DB_PASSWORD",
                "JWT_SECRET", "LENS_API_KEY",
                "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
                "MAIL_USERNAME", "MAIL_PASSWORD",
                "BACKEND_URL", "FRONTEND_URL", "OAUTH2_REDIRECT_URI"
        );

        List<String> missing = new ArrayList<>();
        for (String key : required) {
            if (System.getProperty(key) == null && System.getenv(key) == null) {
                missing.add(key);
            }
        }

        if (!missing.isEmpty()) {
            String errorMsg = "\n\n❌ MISSING CRITICAL ENVIRONMENT VARIABLES: " + missing +
                    "\nApplication will not start. Please check your .env file or Render environment settings.\n";
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        log.info("✅ Environment validation successful. All mandatory keys are present.");
    }
}
