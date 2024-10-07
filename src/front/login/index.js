document.addEventListener('DOMContentLoaded', function () {
  const backButton = document.getElementById('back_button');

  backButton.addEventListener('click', function () {
    window.location.href = '../index.html';
  });

});
