from extensions import db
import enum
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

class TaskStatus(enum.Enum):
    created = "created"
    pending = "pending"
    completed = "completed"

class UserRole(enum.Enum):
    admin = "admin"
    user = "user"

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    status = db.Column(db.Enum(TaskStatus, name="task_status_enum"), nullable=False, default=TaskStatus.created)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    user = db.relationship("User", back_populates="tasks")

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole, name="user_rile_enum"), nullable=False, default=UserRole.user)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    tasks = db.relationship(
            "Task",
            back_populates="user",
            cascade="all, delete-orphan"
        )