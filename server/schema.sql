CREATE TABLE task (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,

  parent INTEGER NOT NULL,
  numChildren INTEGER NOT NULL
);

INSERT INTO task(id, name, parent, numChildren) VALUES (1, "(root)", 0, 0);
