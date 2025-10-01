from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    hashed_password: str

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class UserPublic(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteInDB(NoteBase):
    id: str = Field(..., alias="_id")
    owner_id: str

    class Config:
        orm_mode = True
        allow_population_by_field_name = True