package com.dms.landing.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * 작고 의존성 없는 JSON 파일 저장소. 외부 DB 없이 어디서든(아임웹 외부 호스팅, Vercel 등)
 * 동작하도록 파일 기반으로 영속화한다. 쓰기는 임시파일 + atomic move 로 안전하게 처리한다.
 */
@Component
public class JsonFileStore {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Object lock = new Object();

    public <T> T read(Path file, Class<T> type, T fallback) {
        synchronized (lock) {
            try {
                if (!Files.exists(file)) return fallback;
                byte[] bytes = Files.readAllBytes(file);
                if (bytes.length == 0) return fallback;
                return mapper.readValue(bytes, type);
            } catch (IOException e) {
                throw new UncheckedIOException("읽기 실패: " + file, e);
            }
        }
    }

    public void write(Path file, Object value) {
        synchronized (lock) {
            try {
                Files.createDirectories(file.getParent());
                Path tmp = file.resolveSibling(file.getFileName() + ".tmp");
                mapper.writerWithDefaultPrettyPrinter().writeValue(tmp.toFile(), value);
                Files.move(tmp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (IOException e) {
                throw new UncheckedIOException("쓰기 실패: " + file, e);
            }
        }
    }
}
