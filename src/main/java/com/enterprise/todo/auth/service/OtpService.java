package com.enterprise.todo.auth.service;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailService emailService;
    private final Map<String, OtpData> otpStorage = new HashMap<>(); // email -> OtpData
    private final Random random = new SecureRandom();

    @AllArgsConstructor
    private static class OtpData {
        String otp;
        long expiryTime;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1000000));
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
        otpStorage.put(email, new OtpData(otp, expiryTime));

        emailService.sendOtp(email, otp);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) {
            return false;
        }
        OtpData data = otpStorage.get(email);
        if (System.currentTimeMillis() > data.expiryTime) {
            otpStorage.remove(email);
            return false;
        }
        return data.otp.equals(otp);
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
