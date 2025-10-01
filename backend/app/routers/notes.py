from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from typing import List, Optional
from app.dependencies import get_current_user
from app.models import NoteCreate, NoteInDB, NoteUpdate, UserInDB
from app.db import get_db
from bson import ObjectId

router = APIRouter()

@router.options("/")
async def options_route(response: Response):
    response.status_code = status.HTTP_200_OK
    return {"message": "OK"}

@router.post("/", response_model=NoteInDB)
async def create_note(note: NoteCreate, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    note_data = note.dict()
    note_data["owner_id"] = current_user.id
    result = await db.notes.insert_one(note_data)
    created_note = await db.notes.find_one({"_id": result.inserted_id})
    return NoteInDB(**created_note)

@router.get("/", response_model=List[NoteInDB])
async def read_notes(
    search_query: Optional[str] = None,
    sort_by: Optional[str] = None,
    db=Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    query = {"owner_id": current_user.id}
    if search_query:
        query["$or"] = [
            {"title": {"$regex": search_query, "$options": "i"}},
            {"content": {"$regex": search_query, "$options": "i"}},
        ]

    sort_order = []
    if sort_by:
        if sort_by == "newest":
            sort_order.append(("updatedAt", -1))
        elif sort_by == "oldest":
            sort_order.append(("updatedAt", 1))
        elif sort_by == "title":
            sort_order.append(("title", 1))

    cursor = db.notes.find(query)
    if sort_order:
        cursor = cursor.sort(sort_order)
        
    notes = await cursor.to_list(length=100)
    return [NoteInDB(**note) for note in notes]

@router.get("/{note_id}", response_model=NoteInDB)
async def read_note(note_id: str, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    note = await db.notes.find_one({"_id": ObjectId(note_id), "owner_id": current_user.id})
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteInDB(**note)

@router.put("/{note_id}", response_model=NoteInDB)
async def update_note(note_id: str, note: NoteUpdate, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    existing_note = await db.notes.find_one({"_id": ObjectId(note_id), "owner_id": current_user.id})
    if existing_note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": update_data})
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    return NoteInDB(**updated_note)

@router.delete("/{note_id}", response_model=dict)
async def delete_note(note_id: str, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    result = await db.notes.delete_one({"_id": ObjectId(note_id), "owner_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}