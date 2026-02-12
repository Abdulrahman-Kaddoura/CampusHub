package com.campushub.backend.controllers.authentication;

import com.campushub.backend.dtos.authentication.AuthRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequestDTO) {
        try {
            authenticate(authRequestDTO.getEmail(), authRequestDTO.getPassword());
        } catch () {

        }
    }
}
