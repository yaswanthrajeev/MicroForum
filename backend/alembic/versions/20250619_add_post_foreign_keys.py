"""
Add foreign keys for created_by and updated_by in posts

Revision ID: 20250619_add_post_foreign_keys
Revises: 20250619_add_updated_at_to_comments
Create Date: 2025-06-19
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250619_add_post_foreign_keys'
down_revision = '20250619_add_updated_at_to_comments'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("posts") as batch_op:
        batch_op.create_foreign_key(
            "fk_posts_created_by_users",
            "users",
            ["created_by"],
            ["id"]
        )
        batch_op.create_foreign_key(
            "fk_posts_updated_by_users",
            "users",
            ["updated_by"],
            ["id"]
        )

def downgrade():
    with op.batch_alter_table("posts") as batch_op:
        batch_op.drop_constraint("fk_posts_created_by_users", type_="foreignkey")
        batch_op.drop_constraint("fk_posts_updated_by_users", type_="foreignkey")
