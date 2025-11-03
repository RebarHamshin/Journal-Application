CREATE TABLE patient
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    personnummer VARCHAR(32) NOT NULL UNIQUE,
    name         VARCHAR(255),
    birth_date   DATE,
    gender       VARCHAR(20),
    contact_info VARCHAR(255)
);


CREATE TABLE users
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL,
    patient_id      BIGINT,
    practitioner_id BIGINT,
    CONSTRAINT fk_user_patient FOREIGN KEY (patient_id) REFERENCES patient (id)
);

CREATE TABLE practitioner
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    title           VARCHAR(100),
    organization_id BIGINT,
    CONSTRAINT fk_practitioner_org FOREIGN KEY (organization_id) REFERENCES organization (id)
);

CREATE TABLE organization
(
    id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    name    VARCHAR(255) NOT NULL,
    type    VARCHAR(100),
    address VARCHAR(255)
);

CREATE TABLE location
(
    id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    name    VARCHAR(255),
    address VARCHAR(255)
);

CREATE TABLE encounter
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id      BIGINT NOT NULL,
    practitioner_id BIGINT,
    location_id     BIGINT,
    start_time      DATETIME,
    end_time        DATETIME,
    notes           TEXT,
    CONSTRAINT fk_encounter_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_encounter_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioner (id),
    CONSTRAINT fk_encounter_location FOREIGN KEY (location_id) REFERENCES location (id)
);

CREATE TABLE `condition`
(
    id                          BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id                  BIGINT      NOT NULL,
    code                        VARCHAR(50) NOT NULL,
    display                     VARCHAR(255),
    onset_date                  DATE,
    asserted_by_practitioner_id BIGINT,
    CONSTRAINT fk_cond_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_cond_pract FOREIGN KEY (asserted_by_practitioner_id) REFERENCES practitioner (id)
);

CREATE TABLE observation
(
    id                          BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id                  BIGINT NOT NULL,
    type                        VARCHAR(100),
    value                       VARCHAR(100),
    unit                        VARCHAR(50),
    observed_at                 DATETIME,
    recorded_by_practitioner_id BIGINT,
    encounter_id                BIGINT,
    CONSTRAINT fk_obs_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_obs_pract FOREIGN KEY (recorded_by_practitioner_id) REFERENCES practitioner (id),
    CONSTRAINT fk_obs_encounter FOREIGN KEY (encounter_id) REFERENCES encounter (id)
);

CREATE TABLE message
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_user_id   BIGINT NOT NULL,
    receiver_user_id BIGINT NOT NULL,
    content          TEXT   NOT NULL,
    sent_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read          BOOLEAN  DEFAULT FALSE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_user_id) REFERENCES users (id),
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_user_id) REFERENCES users (id)
);