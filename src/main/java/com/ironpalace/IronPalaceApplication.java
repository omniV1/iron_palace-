package com.ironpalace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
public class IronPalaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IronPalaceApplication.class, args);
    }

    @Controller
    static class SpaController {
        @GetMapping("/{path:[^\\.]*}")
        public String forward() {
            return "forward:/index.html";
        }
    }
}
