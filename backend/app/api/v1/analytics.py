from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.all_schemas import DashboardStats
from app.crud.crud_operations import get_admin_dashboard_stats
from app.api.v1.deps import get_current_admin

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return get_admin_dashboard_stats(db)
