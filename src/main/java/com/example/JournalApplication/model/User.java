package com.example.JournalApplication.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(unique = true, nullable = false)
    String username;
    @Column(name = "password_hash")
    private String password;
    @Enumerated(EnumType.STRING)
    Role role; // PATIENT, DOCTOR, STAFF

    Long patientId;
    Long practitionerId;
}
