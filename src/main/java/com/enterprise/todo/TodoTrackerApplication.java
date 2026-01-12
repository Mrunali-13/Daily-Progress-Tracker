package com.enterprise.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class TodoTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoTrackerApplication.class, args);
    }

}
