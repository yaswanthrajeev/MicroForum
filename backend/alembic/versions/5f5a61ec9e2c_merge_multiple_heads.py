"""Merge multiple heads

Revision ID: 5f5a61ec9e2c
Revises: 2bab140efb0c, add_updated_by_to_comments
Create Date: 2025-06-19 09:48:15.768842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f5a61ec9e2c'
down_revision: Union[str, Sequence[str], None] = ('2bab140efb0c', 'add_updated_by_to_comments')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
