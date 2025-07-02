const putData = (url, data) =>
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

const deleteData = (url) => fetch(url, { method: 'DELETE' });

module.exports = { putData, deleteData };
