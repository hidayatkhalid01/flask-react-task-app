from flask import Flask, jsonify, request
from extensions import db, migrate
from datetime import timedelta

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://user:password@db:3306/db_python_task"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["JWT_SECRET_KEY"] = "74ec23b7cfe98d7d3ddf324cf2588ca67beb0f23d5b9260605d45cbbd5cd1eb3"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # 24 hours

    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)

    CORS(
        app, 
        origins=["http://localhost:5173"], 
        allow_headers=["Content-Type", "Authorization"], 
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    @jwt.unauthorized_loader
    def custom_unauthorized_response(callback):
        return jsonify({"msg": "Missing or invalid token"}), 401

    # Register a callback function that takes whatever object is passed in as the
    # identity when creating JWTs and converts it to a JSON serializable format.
    @jwt.user_identity_loader
    def user_identity_lookup(user_id):
        return user_id

    # Register a callback function that loads a user from your database whenever
    # a protected route is accessed. This should return any python object on a
    # successful lookup, or None if the lookup failed for any reason (for example
    # if the user has been deleted from the database).
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return {"msg": f"Invalid token: {reason}"}, 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"msg": "Token expired"}, 401
    
    from models import User, Task
    from routes import register_routes
    register_routes(app)

    return app

app = create_app()
