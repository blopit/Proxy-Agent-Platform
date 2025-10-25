"""
Shopping List Repository - Database operations for shopping lists and items
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from decimal import Decimal

from src.core.task_models import CaptureType, ShoppingList, ShoppingListItem, Task
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.repositories.enhanced_repositories import BaseEnhancedRepository


class ShoppingListRepository(BaseEnhancedRepository):
    """Repository for shopping list operations"""

    def create(self, shopping_list: ShoppingList, task: Task) -> ShoppingList:
        """
        Create a new shopping list with its associated task.

        Args:
            shopping_list: ShoppingList model instance
            task: Associated task model instance

        Returns:
            ShoppingList: Created shopping list with task_id set
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Ensure task has correct capture_type
            task.capture_type = CaptureType.SHOPPING_LIST

            # Insert task first
            task_data = self._model_to_dict(task)
            task_columns = ", ".join(task_data.keys())
            task_placeholders = ", ".join(["?" for _ in task_data.keys()])
            task_query = f"INSERT INTO tasks ({task_columns}) VALUES ({task_placeholders})"
            cursor.execute(task_query, list(task_data.values()))

            # Prepare shopping list data
            list_data = self._model_to_dict(shopping_list)
            list_data["task_id"] = task.task_id

            # Remove items from list_data (they're stored separately)
            items = list_data.pop("items", [])

            # Insert shopping list
            list_columns = ", ".join(list_data.keys())
            list_placeholders = ", ".join(["?" for _ in list_data.keys()])
            list_query = f"INSERT INTO shopping_lists ({list_columns}) VALUES ({list_placeholders})"
            cursor.execute(list_query, list(list_data.values()))

            # Insert items
            for item in shopping_list.items:
                item.list_id = shopping_list.list_id
                self._insert_item(cursor, item)

            conn.commit()
            shopping_list.task_id = task.task_id
            return shopping_list

        except Exception as e:
            conn.rollback()
            raise e

    def get_by_id(self, list_id: str) -> ShoppingList | None:
        """Get shopping list by ID with task details and items"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT sl.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM shopping_lists sl
            JOIN tasks t ON sl.task_id = t.task_id
            WHERE sl.list_id = ?
        """
        cursor.execute(query, (list_id,))
        row = cursor.fetchone()

        if not row:
            return None

        shopping_list = self._dict_to_shopping_list_model(dict(row))

        # Load items
        shopping_list.items = self.get_items(list_id)

        # Update totals
        shopping_list.update_totals()

        return shopping_list

    def get_by_task_id(self, task_id: str) -> ShoppingList | None:
        """Get shopping list by task ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT sl.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM shopping_lists sl
            JOIN tasks t ON sl.task_id = t.task_id
            WHERE sl.task_id = ?
        """
        cursor.execute(query, (task_id,))
        row = cursor.fetchone()

        if not row:
            return None

        shopping_list = self._dict_to_shopping_list_model(dict(row))
        shopping_list.items = self.get_items(shopping_list.list_id)
        shopping_list.update_totals()

        return shopping_list

    def update(self, shopping_list: ShoppingList) -> ShoppingList:
        """Update an existing shopping list"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        list_data = self._model_to_dict(shopping_list)
        list_data["updated_at"] = datetime.utcnow().isoformat()

        # Remove items from update (they're updated separately)
        list_data.pop("items", None)

        set_clause = ", ".join([f"{key} = ?" for key in list_data.keys() if key != "list_id"])
        values = [value for key, value in list_data.items() if key != "list_id"]
        values.append(shopping_list.list_id)

        query = f"UPDATE shopping_lists SET {set_clause} WHERE list_id = ?"
        cursor.execute(query, values)
        conn.commit()

        return shopping_list

    def get_items(self, list_id: str) -> list[ShoppingListItem]:
        """Get all items for a shopping list"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT * FROM shopping_list_items
            WHERE list_id = ?
            ORDER BY item_order ASC, created_at ASC
        """
        cursor.execute(query, (list_id,))
        rows = cursor.fetchall()

        return [self._dict_to_item_model(dict(row)) for row in rows]

    def get_items_by_category(self, list_id: str) -> dict[str, list[ShoppingListItem]]:
        """Get items grouped by category"""
        items = self.get_items(list_id)

        grouped = {}
        for item in items:
            category = item.category or "Uncategorized"
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(item)

        return grouped

    def add_item(self, item: ShoppingListItem) -> ShoppingListItem:
        """Add an item to a shopping list"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        self._insert_item(cursor, item)
        conn.commit()

        # Update list totals
        shopping_list = self.get_by_id(item.list_id)
        if shopping_list:
            self.update(shopping_list)

        return item

    def update_item(self, item: ShoppingListItem) -> ShoppingListItem:
        """Update a shopping list item"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        item_data = self._model_to_dict(item)
        item_data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in item_data.keys() if key != "item_id"])
        values = [value for key, value in item_data.items() if key != "item_id"]
        values.append(item.item_id)

        query = f"UPDATE shopping_list_items SET {set_clause} WHERE item_id = ?"
        cursor.execute(query, values)
        conn.commit()

        # Update list totals
        shopping_list = self.get_by_id(item.list_id)
        if shopping_list:
            self.update(shopping_list)

        return item

    def mark_item_purchased(self, item_id: str, actual_price: Decimal | None = None) -> ShoppingListItem | None:
        """Mark an item as purchased"""
        item = self.get_item_by_id(item_id)
        if not item:
            return None

        item.mark_purchased(actual_price)
        return self.update_item(item)

    def delete_item(self, item_id: str) -> bool:
        """Delete a shopping list item"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get list_id first
        cursor.execute("SELECT list_id FROM shopping_list_items WHERE item_id = ?", (item_id,))
        row = cursor.fetchone()

        if not row:
            return False

        list_id = row["list_id"]

        # Delete item
        cursor.execute("DELETE FROM shopping_list_items WHERE item_id = ?", (item_id,))
        conn.commit()

        # Update list totals
        shopping_list = self.get_by_id(list_id)
        if shopping_list:
            self.update(shopping_list)

        return cursor.rowcount > 0

    def get_item_by_id(self, item_id: str) -> ShoppingListItem | None:
        """Get a shopping list item by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM shopping_list_items WHERE item_id = ?"
        cursor.execute(query, (item_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_item_model(dict(row))
        return None

    def get_active_lists(self, limit: int = 50, offset: int = 0) -> list[ShoppingList]:
        """Get all active shopping lists"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT sl.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM shopping_lists sl
            JOIN tasks t ON sl.task_id = t.task_id
            WHERE sl.is_active = 1 AND sl.is_completed = 0
            ORDER BY sl.shopping_date ASC, sl.created_at DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(query, (limit, offset))
        rows = cursor.fetchall()

        lists = []
        for row in rows:
            shopping_list = self._dict_to_shopping_list_model(dict(row))
            shopping_list.items = self.get_items(shopping_list.list_id)
            shopping_list.update_totals()
            lists.append(shopping_list)

        return lists

    def get_lists_by_store(self, store_name: str, limit: int = 50) -> list[ShoppingList]:
        """Get shopping lists for a specific store"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT sl.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM shopping_lists sl
            JOIN tasks t ON sl.task_id = t.task_id
            WHERE sl.store_name = ? AND sl.is_active = 1
            ORDER BY sl.shopping_date ASC, sl.created_at DESC
            LIMIT ?
        """
        cursor.execute(query, (store_name, limit))
        rows = cursor.fetchall()

        lists = []
        for row in rows:
            shopping_list = self._dict_to_shopping_list_model(dict(row))
            shopping_list.items = self.get_items(shopping_list.list_id)
            shopping_list.update_totals()
            lists.append(shopping_list)

        return lists

    def delete(self, list_id: str) -> bool:
        """Delete a shopping list (cascades to task and items)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get task_id first
        cursor.execute("SELECT task_id FROM shopping_lists WHERE list_id = ?", (list_id,))
        row = cursor.fetchone()

        if not row:
            return False

        task_id = row["task_id"]

        # Delete task (cascades to shopping_list due to FK constraint)
        cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        conn.commit()

        return cursor.rowcount > 0

    def _insert_item(self, cursor: sqlite3.Cursor, item: ShoppingListItem) -> None:
        """Insert a shopping list item"""
        item_data = self._model_to_dict(item)

        item_columns = ", ".join(item_data.keys())
        item_placeholders = ", ".join(["?" for _ in item_data.keys()])
        item_query = f"INSERT INTO shopping_list_items ({item_columns}) VALUES ({item_placeholders})"

        cursor.execute(item_query, list(item_data.values()))

    def _dict_to_shopping_list_model(self, data: dict) -> ShoppingList:
        """Convert database row dict to ShoppingList model"""
        # Parse metadata
        if "metadata" in data and isinstance(data["metadata"], str):
            try:
                data["metadata"] = json.loads(data["metadata"]) if data["metadata"] else {}
            except json.JSONDecodeError:
                data["metadata"] = {}

        # Convert decimal fields
        for field in ["total_estimated_cost", "total_actual_cost", "completion_percentage"]:
            if field in data and data[field] is not None:
                data[field] = Decimal(str(data[field]))

        # Convert integer fields
        for field in ["total_items", "purchased_items", "shopping_duration_minutes"]:
            if field in data and data[field] is not None:
                data[field] = int(data[field])

        # Convert datetime fields
        for field in ["shopping_date", "completed_at", "shopped_at", "created_at", "updated_at"]:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = datetime.fromisoformat(data[field])
                except (ValueError, TypeError):
                    pass

        # Convert boolean fields
        for field in ["is_active", "is_completed"]:
            if field in data:
                data[field] = bool(data[field])

        # Items will be loaded separately
        data["items"] = []

        return ShoppingList(**data)

    def _dict_to_item_model(self, data: dict) -> ShoppingListItem:
        """Convert database row dict to ShoppingListItem model"""
        # Parse metadata
        if "metadata" in data and isinstance(data["metadata"], str):
            try:
                data["metadata"] = json.loads(data["metadata"]) if data["metadata"] else {}
            except json.JSONDecodeError:
                data["metadata"] = {}

        # Convert decimal fields
        for field in ["quantity", "estimated_price", "actual_price"]:
            if field in data and data[field] is not None:
                data[field] = Decimal(str(data[field]))

        # Convert integer field
        if "item_order" in data and data["item_order"] is not None:
            data["item_order"] = int(data["item_order"])

        # Convert datetime fields
        for field in ["purchased_at", "created_at", "updated_at"]:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = datetime.fromisoformat(data[field])
                except (ValueError, TypeError):
                    pass

        # Convert boolean field
        if "is_purchased" in data:
            data["is_purchased"] = bool(data["is_purchased"])

        return ShoppingListItem(**data)
