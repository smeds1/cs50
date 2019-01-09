document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('a').forEach(a => {
          a.onclick = () => {
              document.querySelector('#chatentry').disabled = false;
              document.querySelector('#channel_name').innerHTML = `Channel: ${a.innerHTML}`;
          };
      });

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
