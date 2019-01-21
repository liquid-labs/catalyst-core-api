# Technical Considerations

## Reformatting data via a trigger

When reformatting data via a trigger, the field must be able to hold the pre-trigger value, even if that value should never make it into the DB. If the original input is too long, for example, then it may be silently stripped (at least in MySQL 5.6).

For example, US phone numbers are only 10 numeric digits, but may be initially presented to the DB with separators. E.g., '555-555-5555'. The field must therefore be declared `VARCHAR(12)` in order to allow space for the separators, even though a `SELECT` should only ever show a string of 10 digits. (TODO: handle the formatting entirely in front end and only send numeric string to DB so we can drop the work on the DB side in this particular case.)
