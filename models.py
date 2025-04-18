from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Float, default=0)
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp())
    clicks_today = db.Column(db.Integer, default=0)
    last_click_date = db.Column(db.Date)