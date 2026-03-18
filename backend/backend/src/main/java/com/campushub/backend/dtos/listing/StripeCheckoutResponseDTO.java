package com.campushub.backend.dtos.listing;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StripeCheckoutResponseDTO {
    private String sessionId;
    private String checkoutUrl;
}
