from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from typing import List, Optional
from app.dependencies import get_current_user
from app.models import NoteCreate, NoteInDB, NoteUpdate, UserInDB
from app.db import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.options("/")
async def options_route(response: Response):
    response.status_code = status.HTTP_200_OK
    return {"message": "OK"}

@router.post("/", response_model=NoteInDB)
async def create_note(note: NoteCreate, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    try:
        note_data = note.dict()
        note_data["owner_id"] = str(current_user.id)
        now = datetime.utcnow()
        note_data["createdAt"] = now
        note_data["updatedAt"] = now
        result = await db.notes.insert_one(note_data)
        created_note = await db.notes.find_one({"_id": result.inserted_id})
        created_note["_id"] = str(created_note["_id"])  # ensure string
        created_note["id"] = created_note["_id"]
        return NoteInDB(**created_note)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")

@router.get("/", response_model=List[NoteInDB])
async def read_notes(
    search_query: Optional[str] = None,
    sort_by: Optional[str] = None,
    db=Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        # Ensure we have a valid user ID
        if not current_user or not current_user.id:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        query = {"owner_id": str(current_user.id)}
        if search_query:
            query["$or"] = [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"content": {"$regex": search_query, "$options": "i"}},
            ]

        cursor = db.notes.find(query)
        
        # Apply sorting if specified
        if sort_by:
            if sort_by == "newest":
                cursor = cursor.sort("_id", -1)  # Use _id for creation time sorting
            elif sort_by == "oldest":
                cursor = cursor.sort("_id", 1)
            elif sort_by == "title":
                cursor = cursor.sort("title", 1)
            
        notes = await cursor.to_list(length=100)
        
        # Handle empty results gracefully
        if not notes:
            return []
            
        # Convert ObjectId to string for each note
        for note in notes:
            note["_id"] = str(note["_id"])  # ensure string
            note["id"] = note["_id"]
            
        return [NoteInDB(**note) for note in notes]
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"Error in read_notes: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")

@router.get("/{note_id}", response_model=NoteInDB)
async def read_note(note_id: str, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    try:
        note = await db.notes.find_one({"_id": ObjectId(note_id), "owner_id": str(current_user.id)})
        if note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        note["_id"] = str(note["_id"])  # ensure string
        note["id"] = note["_id"]
        return NoteInDB(**note)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch note: {str(e)}")

@router.put("/{note_id}", response_model=NoteInDB)
async def update_note(note_id: str, note: NoteUpdate, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    try:
        existing_note = await db.notes.find_one({"_id": ObjectId(note_id), "owner_id": str(current_user.id)})
        if existing_note is None:
            raise HTTPException(status_code=404, detail="Note not found")

        update_data = note.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_data["updatedAt"] = datetime.utcnow()
        await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": update_data})
        updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
        updated_note["_id"] = str(updated_note["_id"])  # ensure string
        updated_note["id"] = updated_note["_id"]
        return NoteInDB(**updated_note)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")

@router.delete("/{note_id}", response_model=dict)
async def delete_note(note_id: str, db=Depends(get_db), current_user: UserInDB = Depends(get_current_user)):
    try:
        result = await db.notes.delete_one({"_id": ObjectId(note_id), "owner_id": str(current_user.id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")