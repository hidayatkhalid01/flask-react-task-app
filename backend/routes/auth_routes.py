from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from marshmallow import ValidationError
from schemas.user_schemas import UserSchema

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()

# create a new user
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Create a new user.

    Parameters:
    email (str): Email of the user.
    password (str): Password of the user.

    Returns:
    jsonify: A JSON response containing a message and a status code.
    If the user is created successfully, a message and a status code of 201 is returned.
    If the request is invalid, a message and a status code of 400 is returned.
    If the email already exists, a message and a status code of 400 is returned.
    """
    json_data = request.get_json()

    try:
        data = user_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400 

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({ "message": "Email already exists" }), 400

    user = User(email=data["email"])
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({ "msg": "User created" }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login a user and return a JWT.

    Parameters:
    email (str): Email of the user.
    password (str): Password of the user.

    Returns:
    jsonify: A JSON response containing a JWT and a status code.
    If the user is logged in successfully, a JWT and a status code of 200 is returned.
    If the request is invalid, a message and a status code of 400 is returned.
    If the email or password is invalid, a message and a status code of 401 is returned.
    """
    json_data = request.get_json()
    
    try:
        data = user_schema.load(json_data) 
    except ValidationError as err:
        return jsonify(err.messages), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({ "message": "Invalid credentials" }), 401
    
    access_token = create_access_token(identity=str(user.id))

    return jsonify(access_token=access_token), 200