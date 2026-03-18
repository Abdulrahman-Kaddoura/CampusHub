package com.campushub.backend.dtos.listing;

import lombok.Data;

@Data
public class StripeCheckoutRequestDTO {
    private String successUrl;
    private String cancelUrl;
}
