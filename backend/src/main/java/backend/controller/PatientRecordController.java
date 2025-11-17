package backend.controller;

import backend.auth.SessionManager;
import backend.model.*;
import backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173") // byt port om din frontend kör annat
public class PatientRecordController {

    private final PatientRepository patients;
    private final EncounterRepository encounters;
    private final ConditionRepository conditions;
    private final UserRepository users;
    private final PractitionerRepository practitioners;

    public PatientRecordController(
            PatientRepository patients,
            EncounterRepository encounters,
            ConditionRepository conditions,
            UserRepository users,
            PractitionerRepository practitioners
    ) {
        this.patients = patients;
        this.encounters = encounters;
        this.conditions = conditions;
        this.users = users;
        this.practitioners = practitioners;
    }

    // ==== helpers ====

    private User requireUser(String token) {
        Long uid = SessionManager.resolveUserId(token);
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }
        return users.findById(uid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
    }

    private void requireDoctorOrStaff(User u) {
        if (u.getRole() != Role.DOCTOR && u.getRole() != Role.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctor/staff may do this");
        }
    }

    // =========================================================
    // 1) Skapa patientnotering via patient-ID
    // =========================================================

    public record CreateNoteRequest(String noteText) {}

    @PostMapping("/{patientId}/notes")
    public ResponseEntity<?> createNote(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @PathVariable Long patientId,
            @RequestBody CreateNoteRequest req
    ) {
        User user = requireUser(token);
        requireDoctorOrStaff(user);

        Patient patient = patients.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        Encounter enc = new Encounter();
        enc.setPatientId(patient.getId());
        enc.setPractitionerId(user.getPractitionerId());
        enc.setStartTime(LocalDateTime.now());
        enc.setNotes(req.noteText());

        Encounter saved = encounters.save(enc);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("patientId", saved.getPatientId());
        resp.put("notes", saved.getNotes());
        resp.put("startTime", saved.getStartTime());
        return ResponseEntity.ok(resp);
    }

    // =======================================================
    // 2) Skapa diagnos (Condition)
    // =======================================================

    public record CreateDiagnosisRequest(String code, String display, String onsetDate) {}

    @PostMapping("/{patientId}/conditions")
    public ResponseEntity<?> createDiagnosis(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @PathVariable Long patientId,
            @RequestBody CreateDiagnosisRequest req
    ) {
        User user = requireUser(token);
        requireDoctorOrStaff(user);

        Patient patient = patients.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        Condition cond = new Condition();
        cond.setPatient(patient);        // ManyToOne till Patient
        cond.setCode(req.code());
        cond.setDisplay(req.display());
        if (req.onsetDate() != null && !req.onsetDate().isBlank()) {
            cond.setOnsetDate(LocalDate.parse(req.onsetDate())); // "2025-11-09"
        }
        if (user.getPractitionerId() != null) {
            practitioners.findById(user.getPractitionerId())
                    .ifPresent(cond::setAssertedByPractitioner);
        }

        Condition saved = conditions.save(cond);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("patientId", saved.getPatient().getId());
        resp.put("code", saved.getCode());
        resp.put("display", saved.getDisplay());
        resp.put("onsetDate", saved.getOnsetDate());
        return ResponseEntity.ok(resp);
    }

    // =========================================================
    // 3) Skapa notering via patientnamn
    // =========================================================

    public record CreateNoteByNameRequest(String patientName, String noteText) {}

    @PostMapping("/notes/by-name")
    public ResponseEntity<?> createNoteByName(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @RequestBody CreateNoteByNameRequest req
    ) {
        User user = requireUser(token);
        requireDoctorOrStaff(user);

        Patient patient = patients.findByName(req.patientName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        Encounter enc = new Encounter();
        enc.setPatientId(patient.getId());
        enc.setPractitionerId(user.getPractitionerId());
        enc.setStartTime(LocalDateTime.now());
        enc.setNotes(req.noteText());

        Encounter saved = encounters.save(enc);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("patientId", saved.getPatientId());
        resp.put("notes", saved.getNotes());
        resp.put("startTime", saved.getStartTime());
        return ResponseEntity.ok(resp);
    }

    // =========================================================
    // 4) Skapa diagnos via patientnamn
    // =========================================================

    public record CreateDiagnosisByNameRequest(String patientName, String code, String display, String onsetDate) {}

    @PostMapping("/conditions/by-name")
    public ResponseEntity<?> createDiagnosisByName(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @RequestBody CreateDiagnosisByNameRequest req
    ) {
        User user = requireUser(token);
        requireDoctorOrStaff(user);

        Patient patient = patients.findByName(req.patientName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        Condition cond = new Condition();
        cond.setPatient(patient);
        cond.setCode(req.code());
        cond.setDisplay(req.display());
        if (req.onsetDate() != null && !req.onsetDate().isBlank()) {
            cond.setOnsetDate(LocalDate.parse(req.onsetDate()));
        }
        if (user.getPractitionerId() != null) {
            practitioners.findById(user.getPractitionerId())
                    .ifPresent(cond::setAssertedByPractitioner);
        }

        Condition saved = conditions.save(cond);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("patientId", saved.getPatient().getId());
        resp.put("code", saved.getCode());
        resp.put("display", saved.getDisplay());
        resp.put("onsetDate", saved.getOnsetDate());
        return ResponseEntity.ok(resp);
    }
    public record PatientSummaryResponse(
            Patient patient,
            java.util.List<Encounter> notes,
            java.util.List<Condition> conditions
    ) {}

    @GetMapping("/{patientName}/full")
    public ResponseEntity<?> getFullRecordForDoctor(
            @RequestHeader(value = "X-Auth", required = false) String token,
            @PathVariable String patientName
    ) {
        User user = requireUser(token);
        requireDoctorOrStaff(user);

        Patient patient = patients.findByName(patientName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        var notes = encounters.findByPatientId(patient.getId());
        var conds = conditions.findByPatient(patient);

        return ResponseEntity.ok(new PatientSummaryResponse(patient, notes, conds));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyRecord(
            @RequestHeader(value = "X-Auth", required = false) String token
    ) {
        User user = requireUser(token);
        if (user.getRole() != Role.PATIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients can use this");
        }
        if (user.getPatientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No patient linked to this user");
        }

        Patient patient = patients.findById(user.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        var notes = encounters.findByPatientId(patient.getId());
        var conds = conditions.findByPatient(patient);

        return ResponseEntity.ok(new PatientSummaryResponse(patient, notes, conds));
    }

}
