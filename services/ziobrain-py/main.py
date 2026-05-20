from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from brain.captions import generate_captions

app = FastAPI(title="ZioBrain Python Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CaptionRequest(BaseModel):
    topic: str
    tone: str = "calm"
    platform: str = "instagram"
    price: str = ""
    link: Optional[str] = None
    brand: Optional[dict] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/brain/captions")
def brain_captions(req: CaptionRequest):
    result = generate_captions(
        topic=req.topic,
        tone=req.tone,
        platform=req.platform,
        price=req.price,
        link=req.link,
        brand=req.brand,
    )
    return result


class OrderCreatedPayload(BaseModel):
    orderId: str
    organizationId: str
    buyerPhone: str
    amount: float
    createdAt: str


@app.post("/consumers/order-created")
def consume_order_created(payload: OrderCreatedPayload):
    print(f"[Feature Capture] Order {payload.orderId}: phone={payload.buyerPhone}")
    return {"captured": True}
