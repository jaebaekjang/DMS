package com.dms.landing.security;

import com.dms.landing.config.DmsProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final DmsProperties props;

    public SecurityConfig(DmsProperties props) {
        this.props = props;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        DmsProperties.Admin admin = props.getAdmin();
        String encoded = (admin.getPasswordHash() != null && !admin.getPasswordHash().isBlank())
                ? admin.getPasswordHash()
                : encoder.encode(admin.getPassword());
        UserDetails user = User.withUsername(admin.getUsername())
                .password(encoded)
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(user);
    }

    /**
     * 임베드 위젯 전용 체인. 아임웹 등 외부 도메인에서 iframe 으로 폼을 띄울 수 있도록
     * frame-ancestors 를 개방하고 X-Frame-Options 를 끈다. (이 경로에는 민감정보가 없다.)
     */
    @Bean
    @org.springframework.core.annotation.Order(1)
    public SecurityFilterChain embedFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/embed/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .headers(headers -> headers
                .frameOptions(frame -> frame.disable())
                .contentSecurityPolicy(csp -> csp.policyDirectives(EMBED_CSP)));
        return http.build();
    }

    @Bean
    @org.springframework.core.annotation.Order(2)
    public SecurityFilterChain filterChain(HttpSecurity http, RateLimitFilter rateLimitFilter) throws Exception {
        http
            .addFilterBefore(rateLimitFilter, BasicAuthenticationFilter.class)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 공개 JSON API(외부 사이트에서 호출)는 CSRF 예외. 그 외(어드민 폼)는 CSRF 보호 유지.
            .csrf(csrf -> csrf.ignoringRequestMatchers(new AntPathRequestMatcher("/api/**")))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/favicon.ico").permitAll()
                .requestMatchers("/css/**", "/js/**", "/embed/**", "/images/**").permitAll()
                .requestMatchers("/api/inquiry", "/api/site-config").permitAll()
                .requestMatchers("/admin/login").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().permitAll())
            .formLogin(form -> form
                .loginPage("/admin/login")
                .loginProcessingUrl("/admin/login")
                .defaultSuccessUrl("/admin", true)
                .failureUrl("/admin/login?error")
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/admin/logout")
                .logoutSuccessUrl("/admin/login?logout"))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(CSP))
                .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .frameOptions(Customizer.withDefaults()));
        return http.build();
    }

    /**
     * GA4/Meta 스크립트 및 인라인 부트스트랩을 허용하되 외부 도메인은 신뢰 목록으로 제한한 CSP.
     * (랜딩은 자체 호스팅 페이지 기준. 임베드 위젯은 호스트 페이지의 CSP 를 따른다.)
     */
    private static final String CSP = String.join("; ",
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'");

    /** 임베드 폼은 어느 사이트(아임웹 등)에서든 iframe 으로 삽입 가능해야 한다. */
    private static final String EMBED_CSP = String.join("; ",
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "connect-src 'self'",
            "frame-ancestors *");

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        String allowed = props.getSecurity().getAllowedOrigins();
        if (allowed != null && !allowed.isBlank()) {
            cfg.setAllowedOrigins(Arrays.stream(allowed.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList());
        } else {
            // 미설정 시: 임베드 위젯의 문의 제출은 어디서든 가능해야 하므로 패턴 허용.
            // 쿠키/인증을 쓰지 않는 공개 폼이라 자격증명은 허용하지 않는다(보안).
            cfg.setAllowedOriginPatterns(List.of("*"));
        }
        cfg.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Content-Type"));
        cfg.setAllowCredentials(false);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/inquiry", cfg);
        source.registerCorsConfiguration("/api/site-config", cfg);
        source.registerCorsConfiguration("/embed/**", cfg);
        return source;
    }
}
