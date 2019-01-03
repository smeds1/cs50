document.addEventListener('DOMContentLoaded', () => {

  if (localStorage.getItem("display_name")) {
    document.querySelector('body').innerHTML = localStorage.getItem('display_name');
  }
  else {
    const form = document.createElement('form');
    const name = document.createElement('input');
    name.type = "text";
    name.id = "name";
    name.autocomplete="off";
    name.autofocus=true;
    name.placeholder="Enter Display Name";
    form.append(name);
    const submit = document.createElement('input');
    submit.type = "submit";
    submit.id = "submit";
    form.append(submit);
    document.querySelector('body').append(form);
  }

});
