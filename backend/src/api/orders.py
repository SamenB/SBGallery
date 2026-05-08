"""
API endpoints for managing artwork orders.
Includes order creation, tracking, and administrative management.
"""

from fastapi import APIRouter, Body

from src.api.dependencies import AdminDep, DBDep, UserDep, UserDepOptional
from src.integrations.prodigi.services.prodigi_fulfillment_admin import (
    ProdigiFulfillmentAdminService,
)
from src.schemas.orders import (
    FulfillmentStatusUpdate,
    OrderAddRequest,
    OrderBulkRequest,
    OrderPatch,
    OrderStatusUpdate,
)
from src.services.orders import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("")
async def get_all_orders(admin_id: AdminDep, db: DBDep):
    """
    Retrieves all orders in the system. Requires admin privileges.
    """
    return await OrderService(db).get_all_orders()


@router.get("/me")
async def get_my_orders(user_id: UserDep, db: DBDep):
    """
    Retrieves all orders belonging to the currently authenticated user.
    """
    return await OrderService(db).get_my_orders(user_id)


@router.get("/track")
async def track_orders_by_email(email: str, db: DBDep):
    """
    Public endpoint for order tracking by email address.
    """
    return await OrderService(db).get_public_tracking_by_email(email)


@router.post("")
async def create_order(
    db: DBDep,
    order_data: OrderAddRequest,
    user_id: UserDepOptional = None,
):
    """
    Creates a new order. Optionally associates the order with a user ID if authenticated.
    """
    order = await OrderService(db).create_order(order_data, user_id)
    return {"status": "OK", "data": order}


@router.post("/bulk")
async def create_orders_bulk(db: DBDep, orders_data: list[OrderBulkRequest] = Body()):
    """
    Creates multiple orders in a single request. Primarily used for data migration or testing.
    """
    result = await OrderService(db).create_orders_bulk(orders_data)
    return {"status": "OK", "data": result}


@router.get("/timeline")
async def get_orders_timeline(admin_id: AdminDep, db: DBDep):
    """
    Retrieves a timeline view of all orders. Requires admin privileges.
    """
    return await OrderService(db).get_orders_timeline()


@router.get("/prodigi/fulfillment-mode")
async def get_prodigi_fulfillment_mode(admin_id: AdminDep, db: DBDep):
    return await ProdigiFulfillmentAdminService(db).get_fulfillment_mode()


@router.put("/prodigi/fulfillment-mode")
async def update_prodigi_fulfillment_mode(
    admin_id: AdminDep,
    db: DBDep,
    mode: str = Body(..., embed=True),
):
    return await ProdigiFulfillmentAdminService(db).update_fulfillment_mode(mode)


@router.get("/{order_id}/prodigi-flow")
async def get_order_prodigi_flow(order_id: int, admin_id: AdminDep, db: DBDep):
    return await ProdigiFulfillmentAdminService(db).get_order_flow(order_id)


@router.post("/{order_id}/prodigi-preflight")
async def run_order_prodigi_preflight(order_id: int, admin_id: AdminDep, db: DBDep):
    return await ProdigiFulfillmentAdminService(db).run_preflight(order_id)


@router.post("/{order_id}/prodigi-submit")
async def submit_order_to_prodigi(order_id: int, admin_id: AdminDep, db: DBDep):
    return await ProdigiFulfillmentAdminService(db).submit_order(order_id)


@router.post("/{order_id}/prodigi-status-poll")
async def poll_order_prodigi_status(order_id: int, admin_id: AdminDep, db: DBDep):
    return await ProdigiFulfillmentAdminService(db).request_status(order_id)


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int, admin_id: AdminDep, db: DBDep, status_data: OrderStatusUpdate
):
    """
    Updates the payment status of a specific order. Requires admin privileges.
    """
    await OrderService(db).update_payment_status(order_id, status_data.payment_status)
    return {"status": "OK"}


@router.patch("/{order_id}/fulfillment")
async def update_order_fulfillment(
    order_id: int,
    admin_id: AdminDep,
    db: DBDep,
    fulfillment_data: FulfillmentStatusUpdate,
):
    """
    Updates the fulfillment status of a specific order. Requires admin privileges.
    """
    await OrderService(db).update_fulfillment_status(order_id, fulfillment_data)
    return {"status": "OK"}


@router.patch("/{order_id}")
async def patch_order(order_id: int, admin_id: AdminDep, db: DBDep, order_patch: OrderPatch):
    """
    Applies partial updates to a specific order. Requires admin privileges.
    """
    await OrderService(db).patch_order(order_id, order_patch)
    return {"status": "OK"}


@router.delete("/{order_id}")
async def delete_order(order_id: int, admin_id: AdminDep, db: DBDep):
    """
    Permanently deletes a specific order record. Requires admin privileges.
    """
    await OrderService(db).delete_order(order_id)
    return {"status": "OK"}
