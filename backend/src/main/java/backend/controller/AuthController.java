package backend.controller;

import backend.auth.SessionManager;
import backend.model.Patient;
import backend.model.Role;
import backend.model.User;
import backend.repository.PatientRepository;
import backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository users;
    private final PatientRepository patients;

    public AuthController(UserRepository users, PatientRepository patients) {
        this.users = users;
        this.patients = patients;
    }

    public record RegisterRequest(String username, String password, String role) {}
    public record LoginRequest(String username, String password) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // valideringarna som du redan har...

        User u = new User();
        u.setUsername(req.username());
        u.setPassword(req.password());
        u.setRole(Role.valueOf(req.role().toUpperCase()));

        if (u.getRole() == Role.PATIENT) {
            Patient p = new Patient();
            p.setPersonnummer(u.getUsername()); //TODO Gör ett personnummerfält i register
            p.setName(u.getUsername());
            patients.save(p);
            u.setPatientId(p.getId());
        }

        User saved = users.save(u);

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole().name(),
                "patientId", saved.getPatientId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var u = users.findByUsername(req.username()).orElse(null);
        if (u == null || !u.getPassword().equals(req.password())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String token = SessionManager.issueToken(u.getId());

        var userMap = new java.util.HashMap<String,Object>();
        userMap.put("id", u.getId());
        userMap.put("username", u.getUsername());
        if (u.getRole() != null) userMap.put("role", u.getRole().name());
        if (u.getPatientId() != null) userMap.put("patientId", u.getPatientId());
        if (u.getPractitionerId() != null) userMap.put("practitionerId", u.getPractitionerId());

        var resp = new java.util.HashMap<String,Object>();
        resp.put("token", token);
        resp.put("user", userMap);

        return ResponseEntity.ok(resp);
    }


    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-Auth", required = false) String token) {
        Long uid = SessionManager.resolveUserId(token);
        if (uid == null) return ResponseEntity.status(401).body("Not logged in");
        var u = users.findById(uid).orElse(null);
        if (u == null) return ResponseEntity.status(401).body("Invalid session");
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "role", u.getRole() == null ? null : u.getRole().name(),
                "patientId", u.getPatientId(),
                "practitionerId", u.getPractitionerId()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Auth", required = false) String token) {
        SessionManager.revoke(token);
        return ResponseEntity.noContent().build();
    }
}
