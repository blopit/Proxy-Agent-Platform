"""
Pet API Endpoints (BE-02)

REST API for user pet management system.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from src.core.pet_models import (
    UserPet, UserPetCreate, FeedPetRequest, FeedPetResponse, PetSpeciesInfo
)
from src.services.user_pet_service import (
    UserPetService, UserAlreadyHasPetError, UserHasNoPetError, PetServiceError
)
from src.repositories.user_pet_repository import UserPetRepository
from src.database.enhanced_adapter import get_enhanced_database


router = APIRouter(prefix="/api/v1/pets", tags=["pets"])


# ============================================================================
# Dependency Injection
# ============================================================================


def get_pet_repository() -> UserPetRepository:
    """Get UserPetRepository instance"""
    db = get_enhanced_database()
    return UserPetRepository(db)


def get_pet_service(
    pet_repo: UserPetRepository = Depends(get_pet_repository)
) -> UserPetService:
    """Get UserPetService instance with dependencies"""
    return UserPetService(pet_repo=pet_repo)


# ============================================================================
# API Endpoints
# ============================================================================


@router.post("/create", response_model=UserPet, status_code=status.HTTP_201_CREATED)
async def create_pet(
    pet_data: UserPetCreate,
    service: UserPetService = Depends(get_pet_service)
):
    """
    Create a new pet for user.

    **Rules**:
    - One pet per user
    - Must choose valid species (dog, cat, dragon, owl, fox)
    - Pet starts at level 1

    **Returns**: Created pet with default stats
    """
    try:
        return service.create_pet(
            user_id=pet_data.user_id,
            species=pet_data.species,
            name=pet_data.name
        )
    except UserAlreadyHasPetError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except PetServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create pet: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserPet)
async def get_user_pet(
    user_id: str,
    service: UserPetService = Depends(get_pet_service)
):
    """
    Get user's pet.

    **Returns**: Pet with current stats (level, XP, hunger, happiness, evolution stage)

    **404**: If user has no pet
    """
    pet = service.get_user_pet(user_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} has no pet"
        )
    return pet


@router.get("/{user_id}/status")
async def get_pet_status(
    user_id: str,
    service: UserPetService = Depends(get_pet_service)
):
    """
    Get pet status with level progress.

    **Returns**:
    - Pet details
    - XP to next level
    - Level progress percentage

    **404**: If user has no pet
    """
    pet_status = service.get_pet_status(user_id)
    if not pet_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} has no pet"
        )
    return pet_status


@router.post("/feed", response_model=FeedPetResponse)
async def feed_pet(
    user_id: str,
    task_priority: str,
    task_estimated_minutes: int,
    service: UserPetService = Depends(get_pet_service)
):
    """
    Feed pet with XP from task completion.

    **Args**:
    - user_id: User who completed task
    - task_priority: Task priority (low, medium, high)
    - task_estimated_minutes: Task duration estimate

    **Returns**:
    - Updated pet
    - XP gained
    - Whether pet leveled up
    - Whether pet evolved
    - Hunger/happiness restored

    **404**: If user has no pet
    """
    try:
        return service.feed_pet_from_task(
            user_id=user_id,
            task_priority=task_priority,
            task_estimated_minutes=task_estimated_minutes
        )
    except UserHasNoPetError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/species/list", response_model=List[PetSpeciesInfo])
async def list_species(service: UserPetService = Depends(get_pet_service)):
    """
    List all available pet species.

    **Returns**: List of species with names, descriptions, and emojis
    """
    return service.list_available_species()


@router.get("/user/{user_id}/has-pet")
async def check_has_pet(
    user_id: str,
    service: UserPetService = Depends(get_pet_service)
):
    """
    Check if user has a pet.

    **Returns**: {"has_pet": true/false}
    """
    return {"has_pet": service.user_has_pet(user_id)}
