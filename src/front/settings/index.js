document.addEventListener('DOMContentLoaded', function () {
  const backButton = document.getElementById('settings_back');

  backButton.addEventListener('click', function () {
    window.location.href = '../index.html';
  });

  // Запит на отримання списку принтерів з сервера
  fetch('http://localhost:4000/api/printers')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Парсимо JSON-відповідь
    })
    .then(data => {
      console.log(data); // Виведемо отримані дані в консоль
      const printersList = document.getElementById('printers_list'); // наприклад, ul

      data.printers.forEach(printer => {
        const listItem = document.createElement('li');
        listItem.textContent = printer.name; // або будь-яка інша інформація про принтер
        printersList.appendChild(listItem);

        // Додаємо обробник подій для зміни printerName у config.json
        listItem.addEventListener('click', () => {
          // Робимо POST або PUT запит для зміни printerName
          fetch('http://localhost:4000/api/update-printer', {
            method: 'POST', // Або PUT, залежно від того, як це обробляється на сервері
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              printerName: printer.name // Відправляємо вибрану назву принтера
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(result => {
              console.log('Printer name updated:', result);
            })
            .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
            });
        });
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
});
