CREATE TABLE `persons` (
  `id` int(10),
  `name` varchar(255) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `email` varchar(255),
  `phone_backup` varchar(12),
  `active` tinyint(1) DEFAULT 1,
  CONSTRAINT `persons_key` PRIMARY KEY ( `id` ),
  CONSTRAINT `persons_ref_entities` FOREIGN KEY ( `id` ) REFERENCES `entities` ( `id` )
);
DELIMITER //
CREATE TRIGGER `persons_phone_format`
  BEFORE INSERT ON persons FOR EACH ROW
    BEGIN
      SET new.phone=(SELECT NUMERIC_ONLY(new.phone));
      SET new.phone_backup=(SELECT NUMERIC_ONLY(new.phone_backup));
    END;//
DELIMITER ;
