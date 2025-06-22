from fastapi import FastAPI
from .api import auth
from api.post import post_router
from api.comment import comment_route
from api.admin import admin_router
from fastapi.middleware.cors import CORSMiddleware
import logging
app = FastAPI()

logging.basicConfig(
    level=logging.INFO,  # INFO and above
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(post_router, prefix="/posts", tags=["post"])
app.include_router(comment_route, prefix="/comment", tags=["comment"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])