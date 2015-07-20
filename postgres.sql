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
