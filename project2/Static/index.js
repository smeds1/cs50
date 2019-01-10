document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  //display correct contents based on whether a user already has a username
  if (!localStorage.getItem('user')){
    document.querySelector('#new_user').style.display = 'block';
    document.querySelector('#old_user').style.display = 'none';
    document.querySelector('#sign_up').onclick = () => {
      const user = document.querySelector('#uname').value;
      if (user){
        localStorage.setItem('user', user);
        document.querySelector('#welcome_user').innerHTML = `Welcome, ${user}`;
        document.querySelector('#new_user').style.display = 'none';
        document.querySelector('#old_user').style.display = 'block';
      }
    }
  }
  else {
    user = localStorage.getItem('user');
    document.querySelector('#welcome_user').innerHTML = `Welcome, ${user}`;
    document.querySelector('#old_user').style.display = 'block';
    document.querySelector('#new_user').style.display = 'none';
  }

  socket.on('connect', () => {

        //make channel names clickable
        document.querySelectorAll('a').forEach(a => {
            a.onclick = () => {
              const channel = a.innerHTML;
              document.querySelector('#chatentry').disabled = false;
              document.querySelector('#channel_name').innerHTML = channel;
              previous_chats = document.querySelector('#previous_chats');
              while (previous_chats.firstChild) {
                  previous_chats.removeChild(previous_chats.firstChild);
              }
              socket.emit('pick channel', {'channel': channel});
            }
        });

        //update chat history when chat is entered
        document.querySelector('#chatentry').onblur = () => {
            const text = document.querySelector('#chatentry').value;
            const channel = document.querySelector('#channel_name').innerHTML;
            socket.emit('enter chat', {'text': text, 'channel': channel, 'user': localStorage.getItem('user')});
        };
    });

    // display all previous chats on the selected channel
    socket.on('display_previous_chats', chats => {
          chats.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `${c}`;
            document.querySelector('#previous_chats').append(li);
          })
    });

    // When a new chat is entered, add to the unordered list
    socket.on('update_chat', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.chat}`;
        document.querySelector('#previous_chats').append(li);
    });

    // Create a new channel
    document.querySelector('#new_channel').onsubmit = () => {

        // Initialize new request
        const request = new XMLHttpRequest();
        const channel = document.querySelector('#channel').value;
        request.open('POST', '/new_channel');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            // Update the result div
            if (data.success) {
                document.querySelector('#error').innerHTML = '';
                const link = document.createElement('a');
                const li = document.createElement('li');
                link.href = '#';
                link.innerHTML =  `${data.channel}`;
                link.onclick = () => {
                  document.querySelector('#chatentry').disabled = false;
                  document.querySelector('#channel_name').innerHTML = channel;
                  previous_chats = document.querySelector('#previous_chats');
                  while (previous_chats.firstChild) {
                      previous_chats.removeChild(previous_chats.firstChild);
                  }
                  socket.emit('pick channel', {'channel': channel});
                }
                li.appendChild(link);
                document.querySelector('#channels').append(li);
                document.querySelector('#channel').value = '';
            }
            else {
                document.querySelector('#error').innerHTML = 'That channel already exists.';
            }
        }

        // Add data to send with request
        const data = new FormData();
        data.append('channel', channel);

        // Send request
        request.send(data);
        return false;
    };

});
