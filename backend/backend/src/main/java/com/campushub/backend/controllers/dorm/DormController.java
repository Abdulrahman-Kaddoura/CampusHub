package com.campushub.backend.controllers.dorm;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dorm")
@Tag(name = "Dorm", description = "Dorm related operations")
public class DormController {
}
