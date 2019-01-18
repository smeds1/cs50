document.addEventListener("DOMContentLoaded", function() {
     if (user){
       document.getElementById('register_link').style.display = 'none';
       document.getElementById('login_link').style.display = 'none';
       document.getElementById('logout_link').style.display = 'block';
     }
     else{
       document.getElementById('register_link').style.display = 'block';
       document.getElementById('login_link').style.display = 'block';
       document.getElementById('logout_link').style.display = 'none';
     }

});
