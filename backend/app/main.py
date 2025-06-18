from fastapi import FastAPI
from .api import auth
from api.post import post_router
from api.comment import comment_route
app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(post_router, prefix="/post", tags=["post"])
app.include_router(comment_route, prefix="/comment", tags=["comment"])