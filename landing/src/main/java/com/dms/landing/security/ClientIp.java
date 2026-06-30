package com.dms.landing.security;

import jakarta.servlet.http.HttpServletRequest;

/** 프록시(Vercel/로드밸런서) 뒤에서 실제 클라이언트 IP 추출. */
public final class ClientIp {
    private ClientIp() {}

    public static String of(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        String real = req.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) return real.trim();
        return req.getRemoteAddr();
    }
}
