package com.homebudget.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/**", "/actuator/health/**")
                        .permitAll()
                        .requestMatchers("/api/**")
                        .authenticated()
                        // SPA shell and static assets; the Angular router redirects to login itself.
                        .anyRequest()
                        .permitAll())
                // XSRF-TOKEN cookie + X-XSRF-TOKEN header, matching Angular HttpClient defaults.
                .csrf(csrf -> csrf.spa())
                // API clients get 401 instead of a redirect to a server-rendered login page.
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
