from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from .. import models
from ..auth import create_access_token, get_password_hash, verify_password
from ..db import get_db
from ..dependencies import get_current_user

router = APIRouter()

@router.options("/signup")
async def options_signup(response: Response):
    response.status_code = status.HTTP_200_OK
    return {"message": "OK"}

@router.options("/login")
async def options_login(response: Response):
    response.status_code = status.HTTP_200_OK
    return {"message": "OK"}

@router.post("/signup", response_model=models.Token)
async def signup(user: models.UserCreate, db=Depends(get_db)):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(user.password)
    new_user = await db.users.insert_one(
        {"email": user.email, "hashed_password": hashed_password}
    )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=models.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=models.UserPublic)
async def read_users_me(current_user: models.UserInDB = Depends(get_current_user)):
    return current_user