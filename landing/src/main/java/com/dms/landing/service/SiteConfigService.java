package com.dms.landing.service;

import com.dms.landing.config.DmsProperties;
import com.dms.landing.model.SiteConfig;
import com.dms.landing.repository.JsonFileStore;
import org.springframework.stereotype.Service;

import java.nio.file.Path;

/**
 * 사이트 설정(디자인/팝업/공개 트래킹 ID/알림 대상)을 로드·저장한다.
 * 비밀값은 다루지 않는다(서버 환경변수 전용).
 */
@Service
public class SiteConfigService {

    private final JsonFileStore store;
    private final Path file;
    private volatile SiteConfig cached;

    public SiteConfigService(DmsProperties props, JsonFileStore store) {
        this.store = store;
        this.file = Path.of(props.getDataDir(), "site-config.json");
        this.cached = store.read(file, SiteConfig.class, new SiteConfig());
    }

    public SiteConfig get() {
        return cached;
    }

    public synchronized void save(SiteConfig config) {
        store.write(file, config);
        this.cached = config;
    }
}
