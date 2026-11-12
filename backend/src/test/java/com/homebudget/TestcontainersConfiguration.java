package com.homebudget;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Throwaway Postgres for {@code @SpringBootTest}s, so tests need only a running Docker daemon — not
 * the docker-compose dev DB. {@code @ServiceConnection} overrides {@code spring.datasource.*}, and
 * Flyway applies the real migrations on startup. Same image as {@code docker-compose-dev.yml}.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"));
    }
}
