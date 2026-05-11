from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="ZioBrain Python Service")


@app.get("/health")
def health():
    return {"status": "ok"}


class OrderCreatedPayload(BaseModel):
    orderId: str
    organizationId: str
    buyerPhone: str
    amount: float
    createdAt: str


@app.post("/consumers/order-created")
def consume_order_created(payload: OrderCreatedPayload):
    # Extract RawOrderFeatures and write to Postgres training table
    # NO inference yet — just data capture
    print(f"[Feature Capture] Order {payload.orderId}: phone={payload.buyerPhone}")
    # TODO: write RawOrderFeatures row
    return {"captured": True}
