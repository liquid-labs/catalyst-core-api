-- pub_id note: It seems that we set 'pub_id's to 'NOT NULL' and it's OK when
-- we run the setup scripts, but when the app tries to insert, it causes errors.
-- last confirmed 2018-07-13

CREATE TABLE entities (
  `id`                INT NOT NULL AUTO_INCREMENT,
  `pub_id`            CHAR(36), -- see 'pub_id note'
  `owner`             INT, -- should only be null for Persons
  `publicly_readable` TINYINT(1),
  `last_updated`      INT,
  CONSTRAINT `entities_key` PRIMARY KEY ( `id` ),
  CONSTRAINT `entities_pub_id_unique` UNIQUE (`pub_id`),
  CONSTRAINT `entities_owner_refs_entities` FOREIGN KEY `entities` ( `id` )
);

CREATE UNIQUE INDEX entities_pub_id_index USING HASH ON entities (pub_id);

DELIMITER //
CREATE TRIGGER `entities_public_id`
  BEFORE INSERT ON entities FOR EACH ROW
    BEGIN
      IF new.pub_id IS NULL THEN
        SET new.pub_id=UPPER(UUID());
      END IF;
      SET new.last_updated=UNIX_TIMESTAMP();
    END//

CREATE TRIGGER `entities_last_updated`
  BEFORE UPDATE ON entities FOR EACH ROW
    SET new.last_updated=UNIX_TIMESTAMP();//
DELIMITER ;
