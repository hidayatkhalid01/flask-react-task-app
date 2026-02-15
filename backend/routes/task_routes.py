from flask import Blueprint, jsonify, request
from extensions import db
from models import Task, UserRole
from flask_jwt_extended import get_jwt_identity, jwt_required, current_user
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload
from schemas.task_schemas import TaskSchema

task_bp = Blueprint('tasks', __name__)

task_schema = TaskSchema()
task_update_schema = TaskSchema(partial=True)

# get all tasks
# validation for regular users vs admin
# admin can see all tasks with users
# users can see their own tasks only
@task_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    """
    Get all tasks.

    For regular users, only their own tasks are returned.
    For admin users, all tasks with their corresponding users are returned.

    Returns:
    jsonify: A JSON response containing a list of tasks.
    Each task is represented as a dictionary with the keys 'id', 'title', 'description', 'status', 'created_by', 'created_at', and 'updated_at'.
    If the user is not an admin, 'created_by' is None.
    """
    if current_user.role == UserRole.user:
        tasks = Task.query.filter_by(user_id=current_user.id).all()
        return jsonify([
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "created_at": task.created_at,
                "updated_at": task.updated_at
            }
            for task in tasks
        ])
    else:
        tasks = Task.query.options(joinedload(Task.user)).all()
        return jsonify([
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "created_by": task.user.email if task.user else None,
                "created_at": task.created_at,
                "updated_at": task.updated_at
            }
            for task in tasks
        ])

@task_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    """
    Create a new task.
    
    Parameters:
    title (str): Title of the task.
    description (str): Description of the task.
    status (str): Status of the task (created, pending, completed).
    
    Returns:
    jsonify: A JSON response containing a message and a status code.
    If the task is created successfully, a message and a status code of 201 is returned.
    If the request is invalid, a message and a status code of 400 is returned.
    """
    user_id = get_jwt_identity()
    json_data = request.get_json()
    
    try:
        data = task_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400 
    
    task = Task(
        title=data.get("title"),
        description=data.get("description"),
        status=data.get("status", "created"),
        user_id=user_id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({ "msg": "Task created" }), 201

@task_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    """
    Update a task.
    
    Parameters:
    id (int): The ID of the task to update.
    
    Body:
    title (str): The title of the task.
    description (str): The description of the task.
    status (str): The status of the task (created, pending, completed).
    
    Returns:
    jsonify: A JSON response containing a message and a status code.
    If the task is updated successfully, a message and a status code of 200 is returned.
    If the request is invalid, a message and a status code of 400 is returned.
    If the task is not found, a message and a status code of 404 is returned.
    """
    json_data = request.get_json()

    try:
        data = task_update_schema.load(json_data) 
    except ValidationError as err:
        return jsonify(err.messages), 400

    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({ "msg": "Task not found" }), 404

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.status = data.get("status", task.status)

    db.session.commit()

    return jsonify({ "msg": "Task updated" }), 200
    
@task_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    """
    Deletes a task.
    
    Parameters:
    id (int): The ID of the task to delete.
    
    Returns:
    jsonify: A JSON response containing a message and a status code.
    If the task is deleted successfully, a message and a status code of 200 is returned.
    If the task is not found, a message and a status code of 404 is returned.
    """
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({ "msg": "Task not found" }), 404
    
    db.session.delete(task)
    db.session.commit()

    return jsonify({ "msg": "Task deleted" }), 200