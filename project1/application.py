import os

from flask import Flask, session, render_template, request, jsonify, redirect, abort
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from werkzeug.security import check_password_hash, generate_password_hash

import requests

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    session.clear()
    if request.method == "POST":
        if not request.form.get("username"):
            message = "Error: Must provide username"
            return render_template('error.html',message=message)
        elif not request.form.get("password"):
            message = "Error: Must provide password"
            return render_template('error.html',message=message)

        rows = db.execute("SELECT * FROM users WHERE uname=:uname",
            {"uname": request.form.get("username")}).fetchall()
        if len(rows) != 1 or not check_password_hash(rows[0]["pass"], request.form.get("password")):
            message = "Error: Incorrect username or password"
            return render_template('error.html',message=message)

        session["user_id"] = rows[0]["id"]
        return redirect("/search")
    return render_template('login.html')

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        if not request.form.get("username"):
            message = "Error: Must provide username"
            return render_template('error.html',message=message)
        elif not request.form.get("password"):
            message = "Error: Must provide password"
            return render_template('error.html',message=message)
        elif not request.form.get("confirmation"):
            message = "Error: Must provide password confirmation"
            return render_template('error.html',message=message)
        elif request.form.get("password") != request.form.get("confirmation"):
            message = "Error: Password and confirmation must be the same"
            return render_template('error.html',message=message)

        user = db.execute("SELECT * FROM users WHERE uname=:uname",
            {"uname": request.form.get("username")}).fetchall()
        if user:
            message = "Error: Username {} is already exists".format(request.form.get("username"))
            return render_template('error.html',message=message)

        db.execute("INSERT INTO users (uname, pass) VALUES (:uname, :pass)",
            {'uname': request.form.get("username"),
            'pass': generate_password_hash(request.form.get("password"))})
        rows = db.commit()
        session["user_id"] = rows
        return redirect("/")
    return render_template('register.html')

@app.route("/books")
def books():
    if session.get("user_id") is None:
        return redirect("/login")
    books = db.execute("SELECT books.id, title, name, year FROM books JOIN authors ON books.author_id=authors.id").fetchall()
    return render_template('books.html',books=books)

@app.route("/books/<int:book_id>", methods=["GET", "POST"])
def book_detail(book_id):
    if session.get("user_id") is None:
        return redirect("/login")

    if request.method == "POST":
        review = db.execute("SELECT * from reviews WHERE book_id=:book_id and user_id=:user_id",
            {"book_id": book_id, "user_id": session.get("user_id")}).fetchall()
        if review:
            message = "Error: You already reviewed this book"
            return render_template("error.html", message=message)
        elif not request.form.get("stars"):
            message = "Error: You must provide a star rating"
            return render_template("error.html", message=message)
        elif not request.form.get("review"):
            message = "Error: You must provide a review"
            return render_template("error.html", message=message)
        else:
            db.execute("INSERT INTO reviews (user_id, book_id, stars, review) VALUES (:uid, :bid, :stars, :review)",
                {'uid':session.get("user_id"),
                'bid':book_id,
                'stars': request.form.get("stars"),
                'review': request.form.get("review")})
            rows = db.commit()

    book = db.execute("SELECT books.id, name, isbn, title, year FROM books JOIN authors on books.author_id = authors.id WHERE books.id = :id", {"id": book_id}).fetchone()
    if book is None:
        return render_template("error.html", message="No such book.")

    reviews = db.execute("SELECT * FROM reviews where book_id=:book",
        {'book':book_id}).fetchall()

    res = requests.get("https://www.goodreads.com/book/review_counts.json", params={"key": "3BAtZu1KPdvAigar78ESw", "isbns": book.isbn})
    if res:
        return render_template('book_detail.html',book=book, reviews=reviews, gr=res.json())
    return render_template('book_detail.html',book=book, reviews=reviews, gr='')

@app.route("/search", methods=["GET", "POST"])
def search():
    if session.get("user_id") is None:
        return redirect("/login")
    if request.method == "POST":
        if not request.form.get("book"):
            message = "Error: A Title, ISBN, or Author must be provided"
            return render_template('error.html',message=message)
        query = "SELECT books.id, name, isbn, title, year FROM books "
        query += "JOIN authors on books.author_id = authors.id "
        query += "WHERE title ILIKE :book OR "
        query += "name ILIKE :author OR "
        query += "isbn ILIKE :isbn"
        rows = db.execute(query,{"book": '%'+request.form.get("book")+'%',
            "author": '%'+request.form.get("book")+'%',
            "isbn": '%'+request.form.get("book")+'%'}).fetchall()
        if len(rows) == 0:
            rows = "No Matches"
        return render_template('search.html',matches=rows)
    return render_template('search.html',matches=None)

@app.route("/api/<isbn>", methods=["GET"])
def api(isbn):

    book = db.execute("SELECT books.id, title, name, year FROM books JOIN authors on books.author_id = authors.id WHERE isbn=:isbn",
        {"isbn":isbn}).fetchall()
    if len(book) != 1:
        return abort(404)

    reviews = db.execute("SELECT COUNT(*), AVG(stars) FROM reviews WHERE book_id=:bid",
            {"bid":book[0].id}).fetchall()

    avg_score = float(reviews[0][1]) if reviews[0][1] else None
    bookSummary = {"title":book[0].title,
                    "author":book[0].name,
                    "year":book[0].year,
                    "isbn":isbn,
                    "review_count":reviews[0][0],
                    "average_score":avg_score}
    return jsonify(bookSummary)
