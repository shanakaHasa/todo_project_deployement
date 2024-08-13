from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json

app = FastAPI()

# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGODB_URL = "mongodb+srv://yaseen:hdpzf83tHRZZWRlj@ysncluster1.xiguiko.mongodb.net/"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.todo_app

# Custom JSON encoder for ObjectId
def objectid_encoder(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError("Object of type ObjectId is not JSON serializable")

# Pydantic models
class TodoItem(BaseModel):
    id: str
    title: str
    description: str
    done: bool = False

class TodoItemCreate(BaseModel):
    title: str
    description: str

@app.post("/todos/", response_model=TodoItem)
async def create_todo_item(todo: TodoItemCreate):
    new_todo = await db["todos"].insert_one(todo.dict())
    created_todo = await db["todos"].find_one({"_id": new_todo.inserted_id})
    return TodoItem(id=str(created_todo["_id"]), **created_todo)

@app.get("/todos/", response_model=List[TodoItem])
async def get_todo_items():
    todos = await db["todos"].find().to_list(1000)
    return [TodoItem(id=str(todo["_id"]), **todo) for todo in todos]

@app.get("/todos/{todo_id}", response_model=TodoItem)
async def read_todo(todo_id: str):
    todo = await db["todos"].find_one({"_id": ObjectId(todo_id)})
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoItem(id=str(todo["_id"]), **todo)

@app.put("/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: str, todo: TodoItemCreate):
    updated_todo = await db["todos"].find_one_and_update(
        {"_id": ObjectId(todo_id)}, {"$set": todo.dict()}, return_document=True
    )
    if updated_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoItem(id=str(updated_todo["_id"]), **updated_todo)

@app.delete("/todos/{todo_id}", response_model=TodoItem)
async def delete_todo(todo_id: str):
    deleted_todo = await db["todos"].find_one_and_delete({"_id": ObjectId(todo_id)})
    if deleted_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoItem(id=str(deleted_todo["_id"]), **deleted_todo)

# Custom JSON encoder setup
app.json_encoder = objectid_encoder
