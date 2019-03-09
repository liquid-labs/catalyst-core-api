CREATE TABLE `users` (
  `id` int(10),
  -- Based on firebase User uid. Not well documented, but if you dig into this:
  -- https://firebase.google.com/docs/auth/admin/manage-users
  -- we find that an assigned ID may be up to 128 characters, though generated
  -- uids are 28 characters at time of writing (2019-03-08), though that's not
  -- guaranteed
  `auth_id` varchar(128),
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
