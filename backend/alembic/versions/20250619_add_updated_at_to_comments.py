"""
Add updated_at to comments

Revision ID: 20250619_add_updated_at_to_comments
Revises: 5f5a61ec9e2c
Create Date: 2025-06-19
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250619_add_updated_at_to_comments'
down_revision = '5f5a61ec9e2c'
branch_labels = None
depends_on = None

def upgrade():
    # updated_at already exists in comments, so skip adding it.
    # with op.batch_alter_table("comments") as batch_op:
    #     batch_op.add_column(sa.Column("updated_at", sa.DateTime(), nullable=True))
    pass

def downgrade():
    with op.batch_alter_table("comments") as batch_op:
        batch_op.drop_column("updated_at")
