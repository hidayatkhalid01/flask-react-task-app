from marshmallow import Schema, fields, validate

class TaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1))
    description = fields.Str(required=True, validate=validate.Length(min=1))
    status = fields.Str(validate=validate.OneOf(["created", "pending", "completed"]))