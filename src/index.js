const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  if (!username) {
    return response.status(401).json({ error: 'Permission denied!'});
  }
  request.username = username;
  next();
}

const findUserByUsername = (username) => {
  const user = users.find((user) => user.username === username);
  return user;
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  if (!name || !username) {
    return response.status(400).json({ error: 'Invalid data'});
  }

  if (users.find((user) => user.name === name)) {
    return response.status(400).json({ error: 'Name already exists'});
  } 

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = findUserByUsername(request.username);
  if (!user) {
    return response.status(400).json({ error: 'User not found'});
  }
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = findUserByUsername(request.username);
  if (!user) {
    return response.status(400).json({ error: 'User not found'});
  }

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = findUserByUsername(request.username);
  if (!user) {
    return response.status(400).json({ error: 'User not found'});
  }

  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'});
  }
  todo.title = title,
  todo.deadline = deadline;
  user.todos.splice(todo, 1, todo);

  return response.json({todo});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = findUserByUsername(request.username);
  if (!user) {
    return response.status(400).json({ error: 'User not found'});
  }

  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'});
  }
  todo.done = true,
  user.todos.splice(todo, 1, todo);

  return response.json({todo});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = findUserByUsername(request.username);
  if (!user) {
    return response.status(400).json({ error: 'User not found'});
  }

  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found'});
  }
  user.todos.splice(todo, 1);

  return response.status(204).json({});
});

module.exports = app;