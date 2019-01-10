import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
chats = {}

@app.route("/")
def index():
    return render_template("index.html",channels=channels)

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
    user = data["user"]
    timestamp = datetime.datetime.now()
    full_chat = "<b>{}</b> <i>({}/{}/{} -{}:{})</i> {}".format(user,
        int(timestamp.month),
        int(timestamp.day),
        timestamp.year,
        timestamp.hour,
        timestamp.minute,
        text)
    if len(chats[channel]) < 100:
        chats[channel].append(full_chat)
    else:
        chats[channel] = chats[channel][1:] + [full_chat]

    emit("update_chat", {'chat':full_chat}, broadcast=True)
