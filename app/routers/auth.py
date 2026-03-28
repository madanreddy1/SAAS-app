from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserResponse, Token, UserCreate,UserLogin
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: schemas.user.UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.user.User)
        .filter(models.user.User.email == user.email.strip().lower())
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pwd = hash_password(user.password)

    db_user = models.user.User(
        email=user.email.strip().lower(),
        password=hashed_pwd,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post('/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username.strip().lower()
    db_user = db.query(models.user.User).filter(models.user.User.email == email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail='Invalid credentials')
    
    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={'sub': str(db_user.id)}
    )

    return {
        'access_token' : access_token,
        "token_type" : 'bearer'
    }