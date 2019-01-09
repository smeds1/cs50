document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on('connect', () => {

        //load chat history when channel is clicked
        document.querySelectorAll('a').forEach(a => {
            a.onclick = () => {
              const channel = a.innerHTML;
              document.querySelector('#chatentry').disabled = false;
              document.querySelector('#channel_name').innerHTML = channel;
              socket.emit('pick channel', {'channel': channel});
            }
        });

        //update chat history when chat is entered
        document.querySelector('#chatentry').onblur = () => {
            const text = document.querySelector('#chatentry').value;
            const channel = document.querySelector('#channel_name').innerHTML;
            socket.emit('enter chat', {'text': text, 'channel': channel});
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
        li.innerHTML = `${data.user} (${data.time}): ${data.text}`;
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
                li.appendChild(link);
                document.querySelector('#channels').append(li);
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
