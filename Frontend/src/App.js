import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const apiUrl = "http://54.89.35.28:8000";
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState({ id: null, title: "", description: "" });

  const fetchTodos = async () => {
    const response = await fetch(`${apiUrl}/todos/`);
    const data = await response.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    const newTodo = {
      title,
      description
    };
    const response = await fetch(`${apiUrl}/todos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTodo)
    });
    const todo = await response.json();
    setTodos([...todos, todo]);
    setTitle("");
    setDescription("");
  };

  const deleteTodo = async (id) => {
    await fetch(`${apiUrl}/todos/${id}`, {
      method: "DELETE"
    });
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (todo) => {
    setIsEditing(true);
    setCurrentTodo({ id: todo.id, title: todo.title, description: todo.description });
  };

  const updateTodo = async () => {
    const updatedTodo = {
      title: currentTodo.title,
      description: currentTodo.description
    };
    const response = await fetch(`${apiUrl}/todos/${currentTodo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedTodo)
    });
    const todo = await response.json();
    setTodos(todos.map(t => (t.id === todo.id ? todo : t)));
    setIsEditing(false);
    setCurrentTodo({ id: null, title: "", description: "" });
  };

  return (
    <div className="App">
      <h1>To-Do List</h1>
      <input
        type="text"
        value={isEditing ? currentTodo.title : title}
        onChange={e => isEditing ? setCurrentTodo({ ...currentTodo, title: e.target.value }) : setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        type="text"
        value={isEditing ? currentTodo.description : description}
        onChange={e => isEditing ? setCurrentTodo({ ...currentTodo, description: e.target.value }) : setDescription(e.target.value)}
        placeholder="Description"
      />
      {isEditing ? (
        <button onClick={updateTodo}>Update To-Do</button>
      ) : (
        <button onClick={addTodo}>Add To-Do</button>
      )}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span>{todo.title}: {todo.description}</span>
            <div>
              <button className="edit-btn" onClick={() => editTodo(todo)}>Edit</button>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
