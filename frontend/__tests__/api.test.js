const { putData, deleteData } = require('../lib/api.js');

global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

afterEach(() => {
  fetch.mockClear();
});

test('putData uses PUT method', async () => {
  await putData('/vendors/1', { name: 'V' });
  expect(fetch).toHaveBeenCalledWith('/vendors/1', expect.objectContaining({ method: 'PUT' }));
});

test('deleteData uses DELETE method', async () => {
  await deleteData('/vendors/1');
  expect(fetch).toHaveBeenCalledWith('/vendors/1', expect.objectContaining({ method: 'DELETE' }));
});
