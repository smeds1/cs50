document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('registration_form').onsubmit = () => {
    document.getElementById('error_message').style.color = "red";
    if(!document.getElementById('fname').value){
      document.getElementById('error_message').innerHTML = "Must Provide First Name";
      return false;
    }
    else if (!document.getElementById('lname').value){
      document.getElementById('error_message').innerHTML = "Must Provide Last Name";
      return false;
    }
    else if (!document.getElementById('email').value){
      document.getElementById('error_message').innerHTML = "Must Provide Email";
      return false;
    }
    else if (!document.getElementById('uname').value){
      document.getElementById('error_message').innerHTML = "Must Provide Username";
      return false;
    }
    else if (!document.getElementById('password').value){
      document.getElementById('error_message').innerHTML = "Must Provide Password";
      return false;
    }
    else if (!document.getElementById('confirmpass').value){
      document.getElementById('error_message').innerHTML = "Must Provide Password Confirmation";
      return false;
    }
    else if (document.getElementById('confirmpass').value != document.getElementById('password').value){
      document.getElementById('error_message').innerHTML = "Password and Confirmation Must Match";
      return false;
    }
  }
});
