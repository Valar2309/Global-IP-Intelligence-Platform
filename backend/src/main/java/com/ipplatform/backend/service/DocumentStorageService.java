package com.ipplatform.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Handles physical file storage for analyst identity documents.
 *
 * Storage mode is controlled by: app.storage.mode=local (default) or s3
 *
 * LOCAL mode:
 *   Files saved to: {app.storage.upload-dir}/analyst-docs/{applicationId}/{uuid}.ext
 *   Configurable via: app.storage.upload-dir=./uploads
 *
 * S3 mode (future):
 *   Swap saveFile() to use AmazonS3Client — storagePath becomes the S3 key.
 *
 * Allowed file types: JPEG, PNG, PDF only (identity docs)
 * Max file size: configured in application.properties via spring.servlet.multipart.max-file-size
 */
@Service
public class DocumentStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "application/pdf"
    );

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    // ── Save ──────────────────────────────────────────────────────────────────

    /**
     * Validates and saves an uploaded file to disk.
     *
     * @param file           the uploaded file from the multipart request
     * @param applicationId  used to create a dedicated subfolder per application
     * @return               the relative storage path (stored in DB for later retrieval)
     */
    public String saveFile(MultipartFile file, Long applicationId) throws IOException {
        validateFile(file);

        // Build directory: uploads/analyst-docs/{applicationId}/
        Path directory = Paths.get(uploadDir, "analyst-docs", String.valueOf(applicationId));
        Files.createDirectories(directory);

        // Generate unique filename to avoid collisions and path traversal attacks
        String extension  = getExtension(file.getOriginalFilename());
        String uniqueName = UUID.randomUUID().toString() + extension;
        Path   targetPath = directory.resolve(uniqueName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path — stored in DB, used for serving/download
        return "analyst-docs/" + applicationId + "/" + uniqueName;
    }

    // ── Retrieve ──────────────────────────────────────────────────────────────

    /**
     * Returns the full absolute path to a stored file.
     * Used by the admin download endpoint to serve the file.
     */
    public Path getFilePath(String storagePath) {
        return Paths.get(uploadDir).resolve(storagePath).normalize();
    }

    /**
     * Returns the file as a byte array.
     * Used for serving document content in the admin review endpoint.
     */
    public byte[] loadFile(String storagePath) throws IOException {
        Path filePath = getFilePath(storagePath);
        if (!Files.exists(filePath)) {
            throw new IOException("Document file not found: " + storagePath);
        }
        return Files.readAllBytes(filePath);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    /**
     * Deletes a file from disk.
     * Called when an application is deleted or a document is re-uploaded.
     */
    public void deleteFile(String storagePath) {
        try {
            Path filePath = getFilePath(storagePath);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Log in production but don't fail the business operation
        }
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        String contentType = file.getContentType();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "Invalid file type: " + contentType +
                ". Only JPEG, PNG, and PDF files are accepted."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(
                "File size exceeds the 5 MB limit. " +
                "Actual size: " + (file.getSize() / 1024 / 1024) + " MB"
            );
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) return "";
        return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
    }
}