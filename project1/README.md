# Project 1 - Book Website

This project is a website that allows users to search for books and review books.
The following files are used:

* application.py - controller that maps routes to reviews
* import.py - a files that loads the database tables from a csv of 5000 books
* requirements.txt - a file that lists all the packages needed to run the project

* templates/index.html - main welcome page that provides the ability to register,
login, and logout
* templates/register.html - a form that lets a user register for the site
* templates/login.html - a form that lets a user login to the site
* templates/books.html - a page that lists all of the books in the database with
links to info about each individual book
* templates/serach.html - a form that allow a user to serach by title, author, or
isbn number and then displays the results
* templates/book_detail.html - a page that displays details and reviews for a given
book. The page also lets users enter a review.
* templates/error.html - generic error handling form that displays a message to the user
* templates/layout.html - base template containing the navigation bar
