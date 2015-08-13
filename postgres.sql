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
  user_id serial NOT NULL,
  CONSTRAINT pk_user PRIMARY KEY (nick)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE app_user
  OWNER TO tfg;

-- Table: classroom

-- DROP TABLE classroom;

CREATE TABLE classroom
(
  room_name character varying(30) NOT NULL,
  teacher character varying(30) NOT NULL,
  licode_room character varying(50) NOT NULL,
  CONSTRAINT classroom_pk PRIMARY KEY (room_name),
  CONSTRAINT teacher_fk FOREIGN KEY (teacher)
      REFERENCES app_user (nick) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT licoderoom_unique UNIQUE (licode_room)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE classroom
  OWNER TO tfg;

-- Index: fki_teacher_fk

-- DROP INDEX fki_teacher_fk;

CREATE INDEX fki_teacher_fk
  ON classroom
  USING btree
  (teacher COLLATE pg_catalog."default");

-- Table: asists

-- DROP TABLE asists;

CREATE TABLE asists
(
  alumn character varying NOT NULL,
  classroom character varying(30) NOT NULL,
  CONSTRAINT asist_pk PRIMARY KEY (alumn, classroom),
  CONSTRAINT alumn_fk FOREIGN KEY (alumn)
      REFERENCES app_user (nick) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT classromm_fk FOREIGN KEY (classroom)
      REFERENCES classroom (room_name) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE asists
  OWNER TO tfg;

-- Index: fki_alumn_fk

-- DROP INDEX fki_alumn_fk;

CREATE INDEX fki_alumn_fk
  ON asists
  USING btree
  (alumn COLLATE pg_catalog."default");

-- Index: fki_classromm_fk

-- DROP INDEX fki_classromm_fk;

CREATE INDEX fki_classromm_fk
  ON asists
  USING btree
  (classroom COLLATE pg_catalog."default");

-- Table: videos

-- DROP TABLE videos;

CREATE TABLE videos
(
  room character varying(30) NOT NULL,
  rec_date date NOT NULL,
  teacher_video character varying(30),
  screen_video character varying(30),
  CONSTRAINT video_pk PRIMARY KEY (room, rec_date),
  CONSTRAINT video_fk FOREIGN KEY (room)
  REFERENCES classroom (room_name) MATCH SIMPLE
  ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
OIDS=FALSE
);
ALTER TABLE videos
OWNER TO tfg;

-- Index: fki_video_fk

-- DROP INDEX fki_video_fk;

CREATE INDEX fki_video_fk
ON videos
USING btree
(room COLLATE pg_catalog."default");


--Add admin user with PASSWORD = '1234'
INSERT INTO app_user(nick, hash, role, email)
VALUES ('admin', 'pbkdf2$10000$bca53acb5cec00083784ddedd046bdf1dae89c343f89914289513d03ed88c5b808f8abfc509ed90403b797dd8b9af49db314818588afa0c9e19ed7bd833d3e17$b3d1af64d95ec4cc4d52c1e706d1ebf01772e6fb8d3839a935bc38d40d2e5f1ffa99b8ce820a341b179ae531583253c2d2aa617221ee982376cc37454fca08f1', 'admin', 'admin@tfg.com');


