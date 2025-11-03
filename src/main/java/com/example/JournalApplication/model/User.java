package com.example.JournalApplication.model;

import jakarta.persistence.*;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(unique = true, nullable = false) String username;
    @Column(unique = true, nullable = false) String password;
    @Enumerated(EnumType.STRING) Role role; // PATIENT, DOCTOR, STAFF

    Long patientId;
    Long practitionerId;
}
