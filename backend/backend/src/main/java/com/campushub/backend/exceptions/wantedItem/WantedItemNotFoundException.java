package com.campushub.backend.exceptions.wantedItem;

public class WantedItemNotFoundException extends RuntimeException {
    public WantedItemNotFoundException(String message) {
        super(message);
    }
}
