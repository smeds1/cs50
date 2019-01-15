# Project 2 - Chat Application

This project is a website that supports real-time chatting between users. Users
can create channels and picks which channels to post on. Each message is displayed
with a user name and time stamp. Users can delete their own messages if they chose.
The application uses localStorage to remember the username and what channel they
were last on. The sever stores a maximum of 100 message per channel. The following 
files are uses:

* application.py - controller that maps routes to views and handles socket
emmisions

* requirements.txt - a file that lists all the packaes needed to run the project

* templates/index.html - all of the html needed to display the app

* static/index.css - all the styling information for the app

* static/index.js - all of the javascript needed for the app
