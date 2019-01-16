document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on('connect', () => {
    display_saved_info();
    listen_for_chat_submission(socket);
    document.querySelectorAll('.channel_link').forEach(link => {
      link.onclick = () => {load_channel(link.innerHTML)};
    });
    document.querySelector('#new_channel').onsubmit = () => {
      const channel = document.querySelector('#channel').value;
      socket.emit('new channel', {'channel': channel});
    }
  });

  socket.on('update_chat', data => {
    if(data['channel'] == document.getElementById('channel_name').innerHTML){
      display_chat(data["text"],data["channel"])
      previous_chats_area = document.getElementById('previous_chat_area');
      previous_chats_area.scrollTop = previous_chats_area.scrollHeight - 200;
    }
  });

  socket.on('display_new_channel', channel => {
    const link = document.createElement('a');
    const li = document.createElement('li');
    link.href = '#';
    link.class = 'channel_link';
    link.innerHTML =  channel;
    link.onclick = () => {load_channel(channel)};
    li.appendChild(link);
    document.querySelector('#channels').append(li);
    document.querySelector('#channel').value = '';
  });
});

//if username is saved in local storage, welcome user and display channels
//if previous channel is saved in local storage, display channel and previous chats
function display_saved_info(){

  const user = localStorage.getItem('user');
  if (!user){
    document.getElementById('new_user').style.display = 'block';
    document.getElementById('old_user').style.display = 'none';
    document.getElementById('sign_up').onclick = () => {
      const uname = document.getElementById('uname').value;
      if (uname){
        localStorage.setItem('user', uname);
        welcome_user(uname);
      }
    }
  }
  else {
    welcome_user(user);
    const channel = localStorage.getItem('channel');
    if (channel){
      load_channel(channel);
    }
  }
}

//Welcome the user in the heading and display the available channels
function welcome_user(user){
  document.getElementById('welcome_user').innerHTML = `Welcome, ${user}`;
  document.getElementById('old_user').style.display = 'block';
  document.getElementById('new_user').style.display = 'none';
}

//Make a channel so that the user can click on the name and load the
//previous chats made in that channel. The channel name should also be saved
//in local storage.
function load_channel(channel){
  document.getElementById('chatentry').disabled = false;
  document.getElementById('channel_name').innerHTML = channel;
  previous_chats = document.getElementById('previous_chats');
  while (previous_chats.firstChild) { //remove anything in previous chats window
    previous_chats.removeChild(previous_chats.firstChild);
  }
  localStorage.setItem('channel', channel);

  const request = new XMLHttpRequest();
  request.open('POST', '/pick_channel');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    data["chats"].forEach(chat => {
      display_chat(chat,channel);
    })
  }
  const data = new FormData();
  data.append('channel', channel);
  request.send(data);
  return false;
}

function display_chat(chat,channel){
  const li = document.createElement('li');
  li.innerHTML = chat+' ';
  const user = localStorage.getItem('user');
  if (chat.substring(3,3+user.length) === user){
    const del = document.createElement('button');
    del.innerHTML = 'X';
    del.className = 'delete';

    del.onclick = () => {
      const request = new XMLHttpRequest();
      request.open('POST', '/delete_chat');
      request.onload = () => {
        const data = JSON.parse(request.responseText);
        if (data["success"]){
          previous_chats.removeChild(li);
        }
      };
      const data = new FormData();
      data.append('channel', channel);
      data.append('chat', chat);
      request.send(data);
      return false;
    };

    li.append(del);
  }
  previous_chats = document.getElementById('previous_chats');
  previous_chats.append(li);
}

//Submit chat whenever enter key is pressed
function listen_for_chat_submission(socket){
  window.onkeydown = (event) => {
    if(event.keyCode==13){
      const text = document.getElementById('chatentry').value;
      const channel = document.getElementById('channel_name').innerHTML;
      socket.emit('enter chat', {'text': text, 'channel': channel, 'user': localStorage.getItem('user')});
      document.getElementById('chatentry').value = "";
      return false;
    }
  }
}
