from fastapi import FastAPI
from .api import auth
from api.post import post_router

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(post_router, prefix="/post", tags=["post"])