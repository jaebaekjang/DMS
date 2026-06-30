package com.dms.landing.repository;

import com.dms.landing.config.DmsProperties;
import com.dms.landing.model.Inquiry;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/** 문의 접수 영속화(JSON Lines append). append 전용이라 동시 쓰기에도 유실이 적다. */
@Repository
public class InquiryRepository {

    private final Path file;
    private final ObjectMapper mapper = new ObjectMapper();
    private final List<Inquiry> cache = new CopyOnWriteArrayList<>();

    public InquiryRepository(DmsProperties props) {
        this.file = Path.of(props.getDataDir(), "inquiries.jsonl");
        load();
    }

    private void load() {
        if (!Files.exists(file)) return;
        try {
            for (String line : Files.readAllLines(file)) {
                if (line.isBlank()) continue;
                cache.add(mapper.readValue(line, Inquiry.class));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("문의 데이터 로드 실패: " + file, e);
        }
    }

    public synchronized Inquiry save(Inquiry inquiry) {
        try {
            Files.createDirectories(file.getParent());
            String line = mapper.writeValueAsString(inquiry) + System.lineSeparator();
            Files.writeString(file, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            cache.add(inquiry);
            return inquiry;
        } catch (IOException e) {
            throw new UncheckedIOException("문의 저장 실패: " + file, e);
        }
    }

    /** 최신순. */
    public List<Inquiry> findAll() {
        List<Inquiry> list = new ArrayList<>(cache);
        Collections.reverse(list);
        return list;
    }

    public long count() {
        return cache.size();
    }
}
