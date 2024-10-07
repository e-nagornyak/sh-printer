document.addEventListener('DOMContentLoaded', function () {
  const settingsButton = document.getElementById('settingsButton');
  const loginButton = document.getElementById('loginButton');

  settingsButton.addEventListener('click', function () {
    window.location.href = 'settings/index.html';
  });

  loginButton.addEventListener('click', function () {
    window.location.href = 'login/index.html';
  });
});
