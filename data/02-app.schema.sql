CREATE TABLE app (
  `id` int(10) NOT NULL auto_increment,
  `name` VARCHAR(128) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  CONSTRAINT `app_key` PRIMARY KEY ( `id` ),
  CONSTRAINT `app_ref_entities` FOREIGN KEY ( `id` ) REFERENCES `entities` ( `id` )
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
