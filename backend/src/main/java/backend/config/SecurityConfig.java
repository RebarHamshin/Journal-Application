package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // allow POST/PUT without CSRF tokens
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()  // register/login/me/logout open
                        .requestMatchers("/api/actuator/**").permitAll()
                        .anyRequest().permitAll() // <-- keep it simple for the lab; tighten later if you want
                );
        return http.build();
    }
}
