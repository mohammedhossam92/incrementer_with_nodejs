from flask import Flask, jsonify, request, render_template
from models import db, Category
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///counter.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([{
        'name': cat.name,
        'value': cat.value,
        'last_updated': cat.last_updated.strftime('%Y-%m-%d %H:%M:%S'),
        'clicks_today': cat.clicks_today
    } for cat in categories])

@app.route('/categories', methods=['POST'])
def add_category():
    data = request.json
    name = data.get('name', '').strip()
    
    if not name:
        return jsonify({'error': 'Category name cannot be empty'}), 400
    
    if Category.query.filter_by(name=name).first():
        return jsonify({'error': 'Category already exists'}), 400
    
    new_category = Category(
        name=name,
        last_click_date=datetime.now().date()
    )
    db.session.add(new_category)
    db.session.commit()
    return jsonify({'message': 'Category added successfully'}), 201

@app.route('/categories/<name>', methods=['DELETE'])
def delete_category(name):
    category = Category.query.filter_by(name=name).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'})

@app.route('/categories/<name>/increment', methods=['POST'])
def increment_category(name):
    return update_category_value(name, 1)

@app.route('/categories/<name>/increment_half', methods=['POST'])
def increment_half_category(name):
    return update_category_value(name, 0.5)

@app.route('/categories/<name>/decrement', methods=['POST'])
def decrement_category(name):
    return update_category_value(name, -1)

@app.route('/categories/<name>/decrement_half', methods=['POST'])
def decrement_half_category(name):
    return update_category_value(name, -0.5)

@app.route('/categories/<name>/reset', methods=['POST'])
def reset_category(name):
    category = Category.query.filter_by(name=name).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    category.value = 0
    category.clicks_today = 0
    category.last_updated = datetime.now()
    category.last_click_date = datetime.now().date()
    db.session.commit()
    return jsonify({'message': 'Category reset successfully'})

def update_category_value(name, amount):
    category = Category.query.filter_by(name=name).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    today = datetime.now().date()
    if category.last_click_date != today:
        category.clicks_today = 0
        category.last_click_date = today
    
    category.value += amount
    category.last_updated = datetime.now()
    
    if amount > 0:  # Only increment clicks_today for positive changes
        category.clicks_today += 1
        
    db.session.commit()
    return jsonify({
        'value': category.value,
        'clicks_today': category.clicks_today
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)