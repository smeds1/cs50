import csv
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


def main():
    f = open("books.csv")
    authors = set()
    reader = csv.reader(f)
    for isbn, title, author, year in reader:
        if isbn != 'isbn':
            if not author in authors:
                db.execute("INSERT INTO authors (name) VALUES (:author)",{"author": author})
                authors.add(author)
            author_id = db.execute("SELECT id FROM authors WHERE name=:author",{"author": author}).fetchone()
            db.execute("INSERT INTO books (isbn,title,author_id,year) VALUES (:isbn,:title,:author_id,:year)",
                {"isbn": isbn, "title":title, "author_id":author_id[0], "year":year})
            #print(f"Added flight from {origin} to {destination} lasting {duration} minutes.")
    db.commit()

if __name__ == "__main__":
    main()
