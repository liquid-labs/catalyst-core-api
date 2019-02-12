CREATE TABLE `users` (
  `id` int(10),
  `active` tinyint(1) DEFAULT 1 NOT NULL,
  CONSTRAINT `users_key` PRIMARY KEY ( `id` ),
  CONSTRAINT `users_ref_entities` FOREIGN KEY ( `id` ) REFERENCES `entities` ( `id` )
);

CREATE TABLE `apps_users` (
  `app_id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `default_context` int (10),
  CONSTRAINT `apps_users_key` PRIMARY KEY ( `app_id`, `user_id` ),
  CONSTRAINT `apps_users_default_context_ref_entities` FOREIGN KEY ( `default_context` ) REFERENCES `entities` ( `id` )
);
