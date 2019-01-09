import os

from flask import Flask, jsonify, session, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

channels = []

@app.route("/", methods=["GET","POST"])
def index():
    if request.method == 'POST':
        session["user"] = request.form.get("uname")
        #return render_template("index.html",user=session.get("user"))
    return render_template("index.html",user=session.get("user"),channels=channels)

@app.route("/new_channel", methods=["POST"])
def new_channel():

    channel = request.form.get("channel")
    if channel in channels:
        return jsonify({"success": False})
    else:
        channels.append(channel)
        return jsonify({"success": True, "channel": channel})
