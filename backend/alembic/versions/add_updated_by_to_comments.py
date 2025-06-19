"""
Add updated_by to comments

Revision ID: add_updated_by_to_comments
Revises: cc83de73b13c
Create Date: 2025-06-19
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_updated_by_to_comments'
down_revision = 'cc83de73b13c'
branch_labels = None
depends_on = None

def upgrade():
    # updated_by already exists in comments, so skip adding it.
    # with op.batch_alter_table("comments") as batch_op:
    #     batch_op.add_column(sa.Column("updated_by", sa.Integer(), nullable=True))
    #     batch_op.create_foreign_key(
    #         "fk_comments_updated_by_users",
    #         "users",
    #         ["updated_by"],
    #         ["id"]
    #     )
    pass

def downgrade():
    with op.batch_alter_table("comments") as batch_op:
        batch_op.drop_constraint("fk_comments_updated_by_users", type_="foreignkey")
        batch_op.drop_column("updated_by")
