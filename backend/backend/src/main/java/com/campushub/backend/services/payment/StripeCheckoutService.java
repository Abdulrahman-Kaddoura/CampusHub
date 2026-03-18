package com.campushub.backend.services.payment;

import com.campushub.backend.dtos.listing.StripeCheckoutResponseDTO;
import com.campushub.backend.models.listings.Listing;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class StripeCheckoutService {

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.currency:usd}")
    private String stripeCurrency;

    @Value("${stripe.success-url:http://localhost:5173/?payment=success&listingId={LISTING_ID}&session_id={CHECKOUT_SESSION_ID}}")
    private String defaultSuccessUrl;

    @Value("${stripe.cancel-url:http://localhost:5173/?payment=cancelled&listingId={LISTING_ID}}")
    private String defaultCancelUrl;

    public StripeCheckoutResponseDTO createCheckoutSession(Listing listing, UUID buyerId, String successUrl, String cancelUrl)
            throws StripeException {

        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Stripe is not configured. Please set stripe.secret-key."
            );
        }

        Stripe.apiKey = stripeSecretKey;

        String resolvedSuccessUrl = buildSuccessUrl(listing, successUrl);
        String resolvedCancelUrl = buildCancelUrl(listing, cancelUrl);

        long amountInCents = BigDecimal.valueOf(listing.getPrice())
                .setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .longValueExact();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(resolvedSuccessUrl)
                .setCancelUrl(resolvedCancelUrl)
                .setClientReferenceId(listing.getListingId().toString())
                .putMetadata("listingId", listing.getListingId().toString())
                .putMetadata("buyerId", buyerId.toString())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(stripeCurrency.toLowerCase())
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(listing.getTitle() != null ? listing.getTitle() : "CampusHub Listing")
                                                                .setDescription(listing.getDescription() != null ? listing.getDescription() : "CampusHub marketplace purchase")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        Session session = Session.create(params);

        return new StripeCheckoutResponseDTO(session.getId(), session.getUrl());
    }

    private String buildSuccessUrl(Listing listing, String successUrl) {
        String base = (successUrl == null || successUrl.isBlank()) ? defaultSuccessUrl : successUrl;
        return base.replace("{LISTING_ID}", listing.getListingId().toString());
    }

    private String buildCancelUrl(Listing listing, String cancelUrl) {
        String base = (cancelUrl == null || cancelUrl.isBlank()) ? defaultCancelUrl : cancelUrl;
        return base.replace("{LISTING_ID}", listing.getListingId().toString());
    }
}
