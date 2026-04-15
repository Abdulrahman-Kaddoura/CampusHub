package com.campushub.backend.configurations.togglz;

import jdk.jfr.Label;
import org.togglz.core.Feature;
import org.togglz.core.annotation.EnabledByDefault;
import org.togglz.core.context.FeatureContext;

public enum Features implements Feature {

    //-----------------------
    // AUTH APIs
    //-----------------------
    @Label("AUTH - Register")
    @EnabledByDefault
    REGISTER,

    @Label("AUTH - Login")
    @EnabledByDefault
    LOGIN,

    //-----------------------
    // USER APIs
    //-----------------------
    @Label("USER - CreateUser")
    @EnabledByDefault
    CREATE_USER,

    @Label("USER - DeleteUser")
    @EnabledByDefault
    DELETE_USER,

    @Label("USER - GetUserById")
    @EnabledByDefault
    GET_USER_BY_ID,

    @Label("USER - GetUserByUsername")
    @EnabledByDefault
    GET_USER_BY_USERNAME,

    @Label("USER - GetUserByEmail")
    @EnabledByDefault
    GET_USER_BY_EMAIL,

    //-----------------------
    // LISTING APIs
    //-----------------------
    @Label("LISTING - CreateListing")
    @EnabledByDefault
    CREATE_LISTING,

    @Label("LISTING - BuyListing")
    @EnabledByDefault
    BUY_LISTING,

    @Label("LISTING - GetAllListings")
    @EnabledByDefault
    GET_ALL_LISTINGS,

    @Label("LISTING - GetAllListingsByUser")
    @EnabledByDefault
    GET_ALL_LISTINGS_BY_USER,

    @Label("LISTING - GetAllListingsByCategory")
    @EnabledByDefault
    GET_ALL_LISTINGS_BY_CATEGORY,

    @Label("LISTING - DeleteListing")
    @EnabledByDefault
    DELETE_LISTING,

    @Label("LISTING - AiSearchListings")
    @EnabledByDefault
    AI_SEARCH_LISTINGS,

    //-----------------------
    // Wanted Item APIs
    //-----------------------
    @Label("WANTEDITEM - CreateWantedItem")
    @EnabledByDefault
    CREATE_WANTED_ITEM,

    @Label("WANTEDITEM - GetAllWantedItems")
    @EnabledByDefault
    GET_ALL_WANTED_ITEMS,

    @Label("WANTEDITEM - GetAllWantedItemsByUser")
    @EnabledByDefault
    GET_ALL_WANTED_ITEMS_BY_USER,

    @Label("WANTEDITEM - DeleteWantedItem")
    @EnabledByDefault
    DELETE_WANTED_ITEM,

    //-----------------------
    // CATEGORY APIs
    //-----------------------
    @Label("CATEGORY - CreateCategory")
    @EnabledByDefault
    CREATE_CATEGORY,

    @Label("CATEGORY - DeleteCategoryById")
    @EnabledByDefault
    DELETE_CATEGORY_BY_ID,

    @Label("CATEGORY - DeleteCategoryByName")
    @EnabledByDefault
    DELETE_CATEGORY_BY_NAME,

    @Label("CATEGORY - GetAllCategories")
    @EnabledByDefault
    GET_ALL_CATEGORIES,

    //-----------------------
    // LISTINGIMAGE APIs
    //-----------------------
    @Label("LISTINGIMAGE - UploadListingImage")
    @EnabledByDefault
    UPLOAD_LISTING_IMAGE,

    @Label("LISTINGIMAGE - DownloadListingImage")
    @EnabledByDefault
    DOWNLOAD_LISTING_IMAGE,

    @Label("LISTINGIMAGE - GetListingImages")
    @EnabledByDefault
    GET_LISTING_IMAGES,

    @Label("LISTINGIMAGE - DeleteListingImage")
    @EnabledByDefault
    DELETE_LISTING_IMAGE,

    //-----------------------
    // Dorm APIs
    //-----------------------
    @Label("DORM - CreateDorm")
    @EnabledByDefault
    CREATE_DORM,

    @Label("DORM - GetAllDorms")
    @EnabledByDefault
    GET_ALL_DORMS,

    @Label("DORM - GetAllDormsByUser")
    @EnabledByDefault
    GET_ALL_DORMS_BY_USER,

    @Label("DORM - DeleteDorm")
    @EnabledByDefault
    DELETE_DORM,

    //-----------------------
    // Tutoring APIs
    //-----------------------
    @Label("TUTORING - CreateTutoring")
    @EnabledByDefault
    CREATE_TUTORING,

    @Label("TUTORING - GetAllTutoring")
    @EnabledByDefault
    GET_ALL_TUTORING,

    @Label("TUTORING - GetAllTutoringByUser")
    @EnabledByDefault
    GET_ALL_TUTORING_BY_USER,

    @Label("TUTORING - DeleteTutoring")
    @EnabledByDefault
    DELETE_TUTORING,

    //-----------------------
    // CourseExchange APIs
    //-----------------------
    @Label("COURSEEXCHANGE - CreateCourseExchange")
    @EnabledByDefault
    CREATE_COURSE_EXCHANGE,

    @Label("COURSEEXCHANGE - GetAllCourseExchanges")
    @EnabledByDefault
    GET_ALL_COURSE_EXCHANGES,

    @Label("COURSEEXCHANGE - GetAllCourseExchangesByUser")
    @EnabledByDefault
    GET_ALL_COURSE_EXCHANGES_BY_USER,

    @Label("COURSEEXCHANGE - DeleteCourseExchange")
    @EnabledByDefault
    DELETE_COURSE_EXCHANGE,


    //-----------------------
    // Cart APIs
    //-----------------------
    @Label("CART - GetCartByCartId")
    @EnabledByDefault
    GET_CART_BY_CART_ID,

    @Label("CART - GetCartByUserId")
    @EnabledByDefault
    GET_CART_BY_USER_ID,

    @Label("CART - AddItemToCart")
    @EnabledByDefault
    CART_ADD_ITEM,

    @Label("CART - CheckoutCart")
    @EnabledByDefault
    CART_CHECKOUT,

    @Label("CART - BuyCart")
    @EnabledByDefault
    BUY_CART,

    //-----------------------
    // CartItem APIs
    //-----------------------
    @Label("CARTITEM - GetCartItems")
    @EnabledByDefault
    GET_CART_ITEMS,

    @Label("CARTITEM - CreateCartItem")
    @EnabledByDefault
    CREATE_CART_ITEM,

    @Label("CARTITEM - DeleteCartItem")
    @EnabledByDefault
    DELETE_CART_ITEM,

    //-----------------------
    // Chat APIs
    //-----------------------
    @Label("CHAT - SendMessage")
    @EnabledByDefault
    CHAT_SEND_MESSAGE,

    @Label("CHAT - GetMessages")
    @EnabledByDefault
    CHAT_GET_MESSAGES,

    @Label("CHAT - GetConversations")
    @EnabledByDefault
    CHAT_GET_CONVERSATIONS,

    @Label("CHAT - GetUsers")
    @EnabledByDefault
    CHAT_GET_USERS,

    //-----------------------
    // USER PROFILE APIs
    //-----------------------
    @Label("USER - UploadProfilePicture")
    @EnabledByDefault
    UPLOAD_PROFILE_PICTURE,

    @Label("USER - GetProfilePicture")
    @EnabledByDefault
    GET_PROFILE_PICTURE,

    @Label("USER - UpdateProfile")
    @EnabledByDefault
    UPDATE_PROFILE,

    //-----------------------
    // ADMIN APIs
    //-----------------------
    @Label("ADMIN - AdminPanel")
    @EnabledByDefault
    ADMIN_PANEL,

    @Label("ADMIN - GetDashboard")
    @EnabledByDefault
    ADMIN_GET_DASHBOARD,

    @Label("ADMIN - GetUsers")
    @EnabledByDefault
    ADMIN_GET_USERS,

    @Label("ADMIN - UpdateUserStatus")
    @EnabledByDefault
    ADMIN_UPDATE_USER_STATUS,

    @Label("ADMIN - UpdateUserRole")
    @EnabledByDefault
    ADMIN_UPDATE_USER_ROLE;

    public boolean isActive(){
        return FeatureContext.getFeatureManager().isActive(this);
    }
}
