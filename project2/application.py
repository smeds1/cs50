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

@socketio.on("new channel")
def new_channel(data):
    channel = data["channel"]
    if not channel in channels:
        channels.append(channel)
        chats[channel] = []
        emit("display_new_channel", channel, broadcast=True)

@app.route("/pick_channel", methods=["POST"])
def pick_channel():
    channel = request.form.get("channel")
    if channel in channels:
        return jsonify({'chats':chats[channel]})

@socketio.on("enter chat")
def enter_chat(data):
    text = data["text"]
    channel = data["channel"]
    user = data["user"]
    timestamp = datetime.datetime.now()
    full_chat = "<b>{}</b> <i>({}/{}/{} - {}:{})</i> {}".format(user,
        timestamp.month,
        timestamp.day,
        timestamp.year-2000,
        timestamp.hour,
        timestamp.minute if timestamp.minute >= 10 else '0'+str(timestamp.minute),
        text)
    if len(chats[channel]) < 100:
        chats[channel].append(full_chat)
    else:
        chats[channel] = chats[channel][1:] + [full_chat]

    emit("update_chat", {'text':full_chat, 'channel':channel}, broadcast=True)

@app.route("/delete_chat", methods=["POST"])
def delete_channel():
    channel = request.form.get("channel")
    chat = request.form.get("chat")
    if chat in chats[channel]:
        chats[channel].remove(chat)
        return jsonify({'success':'true'})
