package com.campushub.backend.services.payment;

import com.campushub.backend.configurations.togglz.Features;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class StripeReceiptEmailService {

    private static final Logger logger = LoggerFactory.getLogger(StripeReceiptEmailService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");

    @Autowired(required = false)
    JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@campushub.local}")
    String fromEmail;

    public void sendReceiptEmail(User buyer, Listing listing) {
        if (!Features.STRIPE_RECEIPT_EMAIL.isActive()) {
            return;
        }

        User seller = listing.getUser();
        String purchaseDate = listing.getUpdatedAt() != null
                ? listing.getUpdatedAt().format(DATE_FMT)
                : "N/A";

        String body = "Hi " + buyer.getFirstName() + ",\n\n"
                + "Thank you for your purchase on CampusHub! Here is your receipt:\n\n"
                + "-------------------------------------------\n"
                + "  Item:    " + listing.getTitle() + "\n"
                + "  Price:   $" + listing.getPrice() + "\n"
                + "  Seller:  " + seller.getFirstName() + " " + seller.getLastName() + "\n"
                + "  Date:    " + purchaseDate + "\n"
                + "  Order #: " + listing.getListingId() + "\n"
                + "-------------------------------------------\n\n"
                + "If you have any questions, please contact the seller directly through CampusHub.\n\n"
                + "— The CampusHub Team";

        if (mailSender == null) {
            logger.info("Mail sender not configured. Receipt for buyer={} listing={}", buyer.getEmail(), listing.getListingId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(buyer.getEmail());
            message.setSubject("Your CampusHub Receipt – " + listing.getTitle());
            message.setText(body);
            mailSender.send(message);
            logger.info("Receipt email sent to {} for listing {}", buyer.getEmail(), listing.getListingId());
        } catch (Exception ex) {
            logger.warn("Failed to send receipt email to {} for listing {}", buyer.getEmail(), listing.getListingId(), ex);
        }
    }
}
