-- Table: app_user

-- DROP TABLE app_user;

CREATE TABLE app_user
(
  nick character varying(30) NOT NULL,
  hash character varying(370) NOT NULL,
  role character varying(20) NOT NULL,
  email character varying(40) NOT NULL,
  recovery_token uuid,
  token_expiration integer,
  CONSTRAINT pk_user PRIMARY KEY (nick )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE app_user
  OWNER TO tfg;

--Add admin user with PASSWORD = '1234'
INSERT INTO app_user(nick, hash, role, email)
VALUES ('admin', 'pbkdf2$10000$bca53acb5cec00083784ddedd046bdf1dae89c343f89914289513d03ed88c5b808f8abfc509ed90403b797dd8b9af49db314818588afa0c9e19ed7bd833d3e17$b3d1af64d95ec4cc4d52c1e706d1ebf01772e6fb8d3839a935bc38d40d2e5f1ffa99b8ce820a341b179ae531583253c2d2aa617221ee982376cc37454fca08f1', 'admin', 'admin@tfg.com');


