package backend.controller;

import backend.dto.UserDto;
import backend.model.User;
import backend.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    // GET /api/users  -> List<UserDto>
    @GetMapping
    public List<UserDto> all() {
        return repo.findAll().stream().map(UserController::toDto).toList();
    }

    // GET /api/users/{id} -> UserDto or 404
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(UserController::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/users -> 201 Created with Location and UserDto
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest req) {
        if (repo.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User u = new User();
        u.setUsername(req.username());
        // If you want to persist passwords now, ensure you have a setter on the entity.
        // TODO: hash the password before storing (e.g., BCrypt). Avoid storing plain text.
        // u.setPassword(passwordEncoder.encode(req.password()));

        User saved = repo.save(u);

        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(toDto(saved));
    }

    // DELETE /api/users/{id} -> 204 or 404
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- DTO mapping ---

    private static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getUsername(),
                u.getRole() == null ? null : u.getRole().name());
    }

    // --- Request model ---

    public record CreateUserRequest(
            @NotBlank String username,
            String password
    ) {}
}
