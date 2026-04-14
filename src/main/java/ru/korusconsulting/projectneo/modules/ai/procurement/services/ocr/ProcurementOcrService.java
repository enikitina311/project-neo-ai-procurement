package ru.korusconsulting.projectneo.modules.ai.procurement.services.ocr;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ProcurementOcrService {
    private static final Logger log = LoggerFactory.getLogger(ProcurementOcrService.class);

    public String extractText(Path filePath) {
        if (filePath == null) {
            throw new IllegalArgumentException("File path is null");
        }

        String fileName = filePath.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".pdf")) {
            return extractPdf(filePath);
        }

        if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".tiff")) {
            return extractImage(filePath);
        }

        String detected = detectContentType(filePath);
        if (detected != null && detected.contains("pdf")) {
            return extractPdf(filePath);
        }

        if (detected != null && detected.startsWith("image/")) {
            return extractImage(filePath);
        }

        throw new IllegalArgumentException("Unsupported file type for OCR: " + fileName);
    }

    private String extractPdf(Path filePath) {
        try (PDDocument document = PDDocument.load(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return text == null ? "" : text.trim();
        } catch (IOException ex) {
            log.error("Failed to extract PDF text from {}", filePath, ex);
            throw new IllegalStateException("Failed to extract PDF text: " + ex.getMessage(), ex);
        }
    }

    private String extractImage(Path filePath) {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                "tesseract",
                filePath.toString(),
                "stdout",
                "-l",
                "rus+eng"
            );
            builder.redirectErrorStream(true);
            Process process = builder.start();
            byte[] output = process.getInputStream().readAllBytes();
            int exit = process.waitFor();

            String result = new String(output, StandardCharsets.UTF_8).trim();
            if (exit != 0) {
                log.error("Tesseract exited with code {} for {}", exit, filePath);
                throw new IllegalStateException("Tesseract OCR failed with exit code " + exit);
            }

            return result;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.error("Tesseract OCR interrupted for {}", filePath, ex);
            throw new IllegalStateException("Tesseract OCR interrupted: " + ex.getMessage(), ex);
        } catch (IOException ex) {
            log.error("Failed to extract image text from {}", filePath, ex);
            throw new IllegalStateException("Failed to extract image text: " + ex.getMessage(), ex);
        }
    }

    private String detectContentType(Path filePath) {
        try {
            return Files.probeContentType(filePath);
        } catch (IOException ex) {
            log.warn("Failed to detect content type for {}", filePath, ex);
            return null;
        }
    }
}
