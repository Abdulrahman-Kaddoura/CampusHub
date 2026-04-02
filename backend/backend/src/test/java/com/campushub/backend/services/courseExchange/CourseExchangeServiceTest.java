package com.campushub.backend.services.courseExchange;

import com.campushub.backend.models.courseExchange.CourseExchange;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.courseExchange.CourseExchangeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseExchangeServiceTest {

    @Mock
    private CourseExchangeRepository courseExchangeRepository;

    @InjectMocks
    private CourseExchangeService courseExchangeService;

    // -------------------------------------------------------------------------
    // createCourseExchange
    // -------------------------------------------------------------------------

    @Test
    void createCourseExchange_savesAndReturnsPost() {
        CourseExchange post = new CourseExchange();
        when(courseExchangeRepository.save(post)).thenReturn(post);

        CourseExchange result = courseExchangeService.createCourseExchange(post);

        assertSame(post, result);
        verify(courseExchangeRepository).save(post);
    }

    // -------------------------------------------------------------------------
    // getAllCourseExchanges
    // -------------------------------------------------------------------------

    @Test
    void getAllCourseExchanges_returnsAll() {
        List<CourseExchange> posts = List.of(new CourseExchange(), new CourseExchange());
        when(courseExchangeRepository.findAll()).thenReturn(posts);

        List<CourseExchange> result = courseExchangeService.getAllCourseExchanges();

        assertSame(posts, result);
        assertEquals(2, result.size());
    }

    @Test
    void getAllCourseExchanges_returnsEmptyList_whenNoneExist() {
        when(courseExchangeRepository.findAll()).thenReturn(List.of());

        List<CourseExchange> result = courseExchangeService.getAllCourseExchanges();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // -------------------------------------------------------------------------
    // getAllCourseExchangesByUser
    // -------------------------------------------------------------------------

    @Test
    void getAllCourseExchangesByUser_returnsFilteredResults() {
        UUID userId = UUID.randomUUID();
        List<CourseExchange> userPosts = List.of(new CourseExchange(), new CourseExchange());
        when(courseExchangeRepository.findByUserId(userId)).thenReturn(userPosts);

        List<CourseExchange> result = courseExchangeService.getAllCourseExchangesByUser(userId);

        assertSame(userPosts, result);
        assertEquals(2, result.size());
    }

    // -------------------------------------------------------------------------
    // deleteCourseExchangeByIdForUser
    // -------------------------------------------------------------------------

    @Test
    void deleteCourseExchangeByIdForUser_throwsResponseStatusException_whenNotFound() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(courseExchangeRepository.findById(postId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> courseExchangeService.deleteCourseExchangeByIdForUser(postId, userId));
        verify(courseExchangeRepository, never()).delete(any());
    }

    @Test
    void deleteCourseExchangeByIdForUser_throwsAccessDeniedException_whenNotOwner() {
        UUID postId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID actingUserId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        CourseExchange post = new CourseExchange();
        post.setUser(owner);

        when(courseExchangeRepository.findById(postId)).thenReturn(Optional.of(post));

        assertThrows(AccessDeniedException.class,
                () -> courseExchangeService.deleteCourseExchangeByIdForUser(postId, actingUserId));
        verify(courseExchangeRepository, never()).delete(any());
    }

    @Test
    void deleteCourseExchangeByIdForUser_deletesPost_whenOwner() {
        UUID postId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        CourseExchange post = new CourseExchange();
        post.setUser(owner);

        when(courseExchangeRepository.findById(postId)).thenReturn(Optional.of(post));
        doNothing().when(courseExchangeRepository).delete(post);

        CourseExchange result = courseExchangeService.deleteCourseExchangeByIdForUser(postId, ownerId);

        assertSame(post, result);
        verify(courseExchangeRepository).delete(post);
    }
}
