import os, time, functools, math, numpy as np
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MAX_POSTS     = 100
HALF_LIFE_D   = 3
EMB_DIM       = 1536

FEEDBACK_W = {
    "LIKE": 3,
    "SHARE": 5,
    "COMMENT": 2,
    "VIEW": 1,
}

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI(title="PearHub Ranker")

def half_life_decay(age_days: float) -> float:
    return 0.5 ** (age_days / HALF_LIFE_D)

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))

class ContentIn(BaseModel):
    id: str
    title: str
    description: str
    body: str | None = ""
    tags: List[str] = []
    created_at: str | None = None

class InteractionIn(BaseModel):
    content_id: str
    type: str
    timestamp: int

class RankReq(BaseModel):
    user_id: str | None = None
    business_id: str
    limit: int = Field(100, le=MAX_POSTS, ge=1)
    content: List[ContentIn] = Field(..., max_items=MAX_POSTS, min_items=1)
    interactions: List[InteractionIn] = Field(default_factory=list)

class RankOut(BaseModel):
    content_id: str
    score: float

@app.post("/rank", response_model=List[RankOut])
def rank(req: RankReq):
    now = time.time()

    inputs = [
        f"{c.title}\n{c.description}\n{c.body or ''}\n{' '.join(c.tags)}"
        for c in req.content
    ]
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=inputs
    )
    vecs = [np.array(d.embedding, dtype=np.float32) for d in response.data]
    content_vecs = {
        req.content[i].id: vecs[i] for i in range(len(req.content))
    }

    weighted_vecs = []
    for inter in req.interactions:
        vec = content_vecs.get(inter.content_id)
        if vec is None:
            continue
        weight = FEEDBACK_W.get(inter.type.upper(), 1)
        age_sec = now - inter.timestamp
        decay = half_life_decay(age_sec / 86_400)
        weighted_vecs.append(vec * weight * decay)

    user_vec = (
        np.mean(weighted_vecs, axis=0) if weighted_vecs
        else np.zeros(EMB_DIM, dtype=np.float32)
    )

    def content_score(cid: str, vec: np.ndarray, created_at: str | None):
        sim = cosine(user_vec, vec) if user_vec.any() else 0.0
        if created_at:
            try:
                dt = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")
                age_days = (now - dt.timestamp()) / 86_400
                sim *= half_life_decay(age_days)
            except Exception:
                pass
        return sim

    ranked = [
        {
            "content_id": cid,
            "score": content_score(
                cid,
                vec,
                next((c.created_at for c in req.content if c.id == cid), None)
            )
        }
        for cid, vec in content_vecs.items()
    ]
    ranked.sort(key=lambda x: x["score"], reverse=True)

    return ranked[:req.limit]
