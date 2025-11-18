package backend.controller;

import backend.auth.SessionManager;
import backend.model.Message;
import backend.model.Role;
import backend.model.User;
import backend.repository.MessageRepository;
import backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    private final MessageRepository messages;
    private final UserRepository users;

    public MessageController(MessageRepository messages, UserRepository users) {
        this.messages = messages;
        this.users = users;
    }

    // ===== helpers =====

    private User requireUser(String token) {
        Long uid = SessionManager.resolveUserId(token);
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }
        return users.findById(uid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
    }

    private record ContactDto(Long id, String username, String role) {}

    private record MessageDto(
            Long id,
            Long senderId,
            Long receiverId,
            String senderName,
            String receiverName,
            String content,
            LocalDateTime sentAt,
            boolean read
    ) {}

    private MessageDto toDto(Message m, User sender, User receiver) {
        return new MessageDto(
                m.getId(),
                m.getSenderUserId(),
                m.getReceiverUserId(),
                sender.getUsername(),
                receiver.getUsername(),
                m.getContent(),
                m.getSentAt(),
                m.isRead()
        );
    }

    // ===========================
    // 1) Hämta kontakter att skriva till
    // ===========================
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(
            @RequestHeader(value = "X-Auth", required = false) String token) {

        User me = requireUser(token);

        List<User> contacts;
        if (me.getRole() == Role.PATIENT) {
            // patient -> alla läkare + personal
            var doctors = users.findByRole(Role.DOCTOR);
            var staff   = users.findByRole(Role.STAFF);
            doctors.addAll(staff);
            contacts = doctors;
        } else {
            // läkare/personal -> alla patienter
            contacts = users.findByRole(Role.PATIENT);
        }

        var list = contacts.stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .map(u -> new ContactDto(u.getId(), u.getUsername(), u.getRole().name()))
                .toList();

        return ResponseEntity.ok(list);
    }

    @GetMapping("/thread/{otherId}")
    public ResponseEntity<?> getThread(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @PathVariable Long otherId) {

        User me = requireUser(token);

        User other = users.findById(otherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 1) alla jag -> andra
        var m1 = messages.findBySenderUserIdAndReceiverUserIdOrderBySentAtAsc(
                me.getId(), otherId);

        // 2) alla andra -> jag
        var m2 = messages.findBySenderUserIdAndReceiverUserIdOrderBySentAtAsc(
                otherId, me.getId());

        // 3) slå ihop och sortera efter tid
        var merged = java.util.stream.Stream.concat(m1.stream(), m2.stream())
                .sorted(java.util.Comparator.comparing(Message::getSentAt))
                .map(m -> {
                    User sender   = m.getSenderUserId().equals(me.getId()) ? me : other;
                    User receiver = m.getReceiverUserId().equals(me.getId()) ? me : other;
                    return toDto(m, sender, receiver);
                })
                .toList();

        return ResponseEntity.ok(merged);
    }

    // ===========================
    // 3) Skicka meddelande
    // ===========================
    public record SendMessageRequest(Long receiverId, String content) {}

    @PostMapping
    public ResponseEntity<?> send(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @RequestBody SendMessageRequest req) {

        User me = requireUser(token);

        if (req.receiverId() == null || req.content() == null || req.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "receiverId och content krävs");
        }
        if (req.receiverId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kan inte skicka till dig själv");
        }

        User receiver = users.findById(req.receiverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        Message m = new Message();
        m.setSenderUserId(me.getId());
        m.setReceiverUserId(receiver.getId());
        m.setContent(req.content().trim());
        m.setSentAt(LocalDateTime.now());
        m.setRead(false);

        Message saved = messages.save(m);

        return ResponseEntity.ok(toDto(saved, me, receiver));
    }
}
