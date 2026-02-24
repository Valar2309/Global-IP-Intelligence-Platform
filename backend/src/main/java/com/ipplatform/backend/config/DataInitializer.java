package com.ipplatform.backend.config;

import com.ipplatform.backend.model.Admin;
import com.ipplatform.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the default Admin account on first startup.
 * If the admin username already exists, does nothing.
 *
 * Configure credentials in application.properties:
 *   admin.default.username=admin
 *   admin.default.password=Admin@123
 *   admin.default.email=admin@ipplatform.com
 *   admin.default.name=System Admin
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${admin.default.username:admin}")
    private String adminUsername;

    @Value("${admin.default.password:admin@123}")
    private String adminPassword;

    @Value("${admin.default.email:admin@ipplatform.com}")
    private String adminEmail;

    @Value("${admin.default.name:System Admin}")
    private String adminName;

    private final AdminRepository  adminRepository;
    private final PasswordEncoder  passwordEncoder;

    public DataInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!adminRepository.existsByUsername(adminUsername)) {
            Admin admin = new Admin(
                    adminUsername,
                    passwordEncoder.encode(adminPassword),
                    adminEmail,
                    adminName
            );
            adminRepository.save(admin);
            System.out.println("[DataInitializer] Default admin created: " + adminUsername);
        } else {
            System.out.println("[DataInitializer] Admin already exists, skipping seed.");
        }
    }
}