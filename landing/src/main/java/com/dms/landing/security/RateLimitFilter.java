package com.dms.landing.security;

import com.dms.landing.config.DmsProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP 당 분당 문의 제출 횟수를 제한하는 간단한 고정 윈도우 카운터.
 * 외부 의존성 없이 동작하며, 무차별 스팸/봇 제출을 1차로 막는다.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final int limitPerMinute;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(DmsProperties props) {
        this.limitPerMinute = Math.max(1, props.getSecurity().getInquiryRatePerMinute());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        boolean limited = "POST".equalsIgnoreCase(req.getMethod())
                && req.getRequestURI().equals("/api/inquiry");
        if (limited && isOverLimit(ClientIp.of(req))) {
            res.setStatus(429);
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().write("{\"ok\":false,\"message\":\"잠시 후 다시 시도해주세요.\"}");
            return;
        }
        chain.doFilter(req, res);
    }

    private boolean isOverLimit(String ip) {
        long minute = System.currentTimeMillis() / 60_000;
        Window w = windows.compute(ip, (k, cur) -> {
            if (cur == null || cur.minute != minute) return new Window(minute);
            return cur;
        });
        return w.count.incrementAndGet() > limitPerMinute;
    }

    private static final class Window {
        final long minute;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long minute) { this.minute = minute; }
    }
}
