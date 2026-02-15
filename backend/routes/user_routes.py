from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user, get_jwt_identity
from models import User, UserRole

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get all users.

    Returns:
    jsonify: A JSON response containing a list of all users.
    Each user is represented as a dictionary with the keys 'id', 'email', and 'role'.
    If the current user is not an admin, a JSON response with a message and the current user's role is returned instead.

    Status Codes:
    200: Returned if the current user is an admin.
    403: Returned if the current user is not an admin.
    """
    users = User.query.all()
    if current_user.role != UserRole.admin:
        return jsonify({ "msg": "You are not an admin", "role": current_user.role.value }), 403
    
    return jsonify([
        {
            "id": user.id,
            "email": user.email,
            "role": user.role.value
        }
        for user in users
    ])

@user_bp.route('/current-user', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get the current user.

    Returns:
    jsonify: A JSON response containing the current user's information.
    The current user is represented as a dictionary with the keys 'id', 'email', and 'role'.

    Status Codes:
    200: Returned if the current user is found.
    """
    user_id = get_jwt_identity()

    current_user = User.query.filter_by(id=user_id).first()

    return jsonify({ "id": current_user.id, "email": current_user.email, "role": current_user.role.value }), 200