document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on('connect', () => {
    display_saved_info(socket);
    listen_for_chat_submission(socket);
    document.querySelectorAll('.channel_link').forEach(link => {
      link.onclick = () => {make_channel_clickable(link,socket)};
    });
    document.querySelector('#new_channel').onsubmit = () => {
      const channel = document.querySelector('#channel').value;
      socket.emit('new channel', {'channel': channel});
    }
  });

  socket.on('update_chat', data => {
    if(data['channel'] == document.querySelector('#channel_name').innerHTML){
      const li = document.createElement('li');
      li.innerHTML = data['text'];
      previous_chats = document.querySelector('#previous_chats');
      previous_chats.append(li);
    }
    //previous_chats.setAttribute("display","flex");
    //previous_chats.setAttribute("flex-direction","column-reverse");
  });

  socket.on('display_new_channel', channel => {
    const link = document.createElement('a');
    const li = document.createElement('li');
    link.href = '#';
    link.class = 'channel_link';
    link.innerHTML =  channel;
    link.onclick = () => {make_channel_clickable(link,socket)};
    li.appendChild(link);
    document.querySelector('#channels').append(li);
    document.querySelector('#channel').value = '';
  });
});

//if username is saved in local storage, welcome user and display channels
//if previous channel is saved in local storage, display channel and previous chats
function display_saved_info(socket){

  const user = localStorage.getItem('user');
  if (!user){
    document.querySelector('#new_user').style.display = 'block';
    document.querySelector('#old_user').style.display = 'none';
    document.querySelector('#sign_up').onclick = () => {
      const uname = document.querySelector('#uname').value;
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
      document.querySelector('#channel_name').innerHTML = channel;
      document.querySelector('#chatentry').disabled = false;
      socket.emit('pick channel', {'channel': channel});
    }
  }
}

//Welcome the user in the heading and display the available channels
function welcome_user(user){
  document.querySelector('#welcome_user').innerHTML = `Welcome, ${user}`;
  document.querySelector('#old_user').style.display = 'block';
  document.querySelector('#new_user').style.display = 'none';
}

//Make a channel so that the user can click on the name and load the
//previous chats made in that channel. The channel name should also be saved
//in local storage.
function make_channel_clickable(link,socket){
  const channel = link.innerHTML;
  document.querySelector('#chatentry').disabled = false;
  document.querySelector('#channel_name').innerHTML = channel;
  previous_chats = document.querySelector('#previous_chats');
  while (previous_chats.firstChild) { //remove anything in previous chats window
    previous_chats.removeChild(previous_chats.firstChild);
  }
  localStorage.setItem('channel', channel);

  const request = new XMLHttpRequest();
  request.open('POST', '/pick_channel');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    data["chats"].forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = c;
      const del = document.createElement('button');
      del.innerHTML = 'X';
      li.append(del);
      previous_chats.append(li);
    })
  }
  const data = new FormData();
  data.append('channel', channel);
  request.send(data);
  return false;
}

//Submit chat whenever enter key is pressed
function listen_for_chat_submission(socket){
  window.onkeydown = (event) => {
    if(event.keyCode==13){
      const text = document.querySelector('#chatentry').value;
      const channel = document.querySelector('#channel_name').innerHTML;
      socket.emit('enter chat', {'text': text, 'channel': channel, 'user': localStorage.getItem('user')});
      document.querySelector('#chatentry').value = "";
      return false;
    }
  }
}
