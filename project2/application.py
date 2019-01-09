import os

from flask import Flask, jsonify, session, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

channels = []
chats = {}

@app.route("/", methods=["GET","POST"])
def index():
    if request.method == 'POST':
        session["user"] = request.form.get("uname")
    return render_template("index.html",user=session.get("user"),channels=channels)

@app.route("/new_channel", methods=["POST"])
def new_channel():
    channel = request.form.get("channel")
    if channel in channels:
        return jsonify({"success": False})
    else:
        channels.append(channel)
        chats[channel] = []
        return jsonify({"success": True, "channel": channel})

@socketio.on("pick channel")
def pick_channel(data):
    channel = data["channel"]
    emit("display_previous_chats", chats[channel], broadcast=True)

@socketio.on("enter chat")
def enter_chat(data):
    text = data["text"]
    channel = data["channel"]
    if len(chats[channel]) < 100:
        chats[channel].append(text)
    else:
        chats[channel] = chats[channel][1:] + [text]
    timestamp = datetime.datetime.now()
    time = "{}-{}-{}".format(int(timestamp.month),int(timestamp.day),timestamp.year)
    emit("update_chat", {'text':text, 'user':session['user'], 'time':time}, broadcast=True)
