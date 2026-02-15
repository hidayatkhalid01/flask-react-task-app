from flask import Blueprint

def register_routes(app):
    from .user_routes import user_bp
    from .task_routes import task_bp
    from .auth_routes import auth_bp

    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    app.register_blueprint(auth_bp, url_prefix='/auth')