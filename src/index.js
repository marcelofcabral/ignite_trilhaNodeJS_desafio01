const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { request } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) response.status(404).json({ error: "User not found" });

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some((user) => user.username === username);

  if (usernameExists)
    return response.status(400).json({ error: "User already exists" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { deadline, title },
  } = request;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newToDo);

  response.status(201).json(newToDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;
  const { title, deadline } = request.body;

  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "Task not found!" });

  toDo.title = title;
  toDo.deadline = deadline;

  response.status(201).json(toDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;

  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "Task not found!" });

  toDo.done = true;

  response.status(201).json(toDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;

  const toDo = user.todos.find((toDo) => toDo.id === id);

  if (!toDo) return response.status(404).json({ error: "Task not found!" });

  user.todos.splice(toDo, 1);

  response.status(204).send();
});

module.exports = app;
