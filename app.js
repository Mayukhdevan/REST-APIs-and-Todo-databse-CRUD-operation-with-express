// Import modules
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const port = 3000;
dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(port, () =>
      console.log("Server Listening at http://localhost:3000")
    );
  } catch (err) {
    console.log(`DB error: ${err.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// GET API 1: Returns data based on the query parameters.
app.get("/todos/", async (req, res) => {
  const { status = "", priority = "", search_q = "" } = req.query;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      status LIKE "%${status}%"
      AND priority LIKE "%${priority}%"
      AND todo LIKE "%${search_q}%";`;

  const todoArray = await db.all(getTodoQuery);
  res.send(todoArray);
});

// GET API 2: Based on specific id.
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;

  const todoObj = await db.get(getTodoQuery);
  res.send(todoObj);
});

// POST API 3: Adds new rows into the db as per the req body.
app.post("/todos/", async (req, res) => {
  const todoDetails = req.body;
  const { id, todo, priority, status } = todoDetails;

  const postTodoQuery = `
        INSERT INTO
          todo (id, todo, priority, status)
        VALUES
          (${id}, "${todo}", "${priority}", "${status}");`;

  await db.run(postTodoQuery);
  res.send("Todo Successfully Added");
});

// PUT API 4: Updates data in db as per the query parameters.
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const getPreviousQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        id = ${todoId};`;
  const previousQuery = await db.get(getPreviousQuery);
  const {
    status = previousQuery.status,
    priority = previousQuery.priority,
    todo = previousQuery.todo,
  } = req.body;

  const updateTodoQuery = `
        UPDATE
          todo
        SET
          status = "${status}",
          priority = "${priority}",
          todo = "${todo}"
        WHERE
          id = ${todoId};`;
  await db.run(updateTodoQuery);

  if (status != previousQuery.status) {
    res.send("Status Updated");
  } else if (priority != previousQuery.priority) {
    res.send("Priority Updated");
  } else if (todo != previousQuery.todo) {
    res.send("Todo Updated");
  }
});

// DELETE API 5: Deletes data in db as per the specified id.
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const deleteTodoQuery = `
        DELETE FROM
          todo
        WHERE
          id = ${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
