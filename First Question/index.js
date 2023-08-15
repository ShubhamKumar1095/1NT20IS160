const express = require('express');
const axios = require('axios');
const app = express();
const port = 8008;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url || [];
  const timeout = 500; //Timeout  milliseconds
  const results = [];

  const FetchPromises = urls.map(url => {
    return axios.get(url, { timeout })
      .then(response => response.data.numbers)
      .catch(error => {
        console.error(`Failed to fetch from ${url}: ${error.message}`);
        return [];
      });
  });

  Promise.allSettled(FetchPromises)
    .then(responses => {
      responses.forEach(response => {
        if (response.status === 'fulfilled') {
          results.push(...response.value);
        }
      });

      const uniqueNumbers = getUniqueNumbers(results);
      const sortedNumbers = bubbleSort(uniqueNumbers);
      
      res.json({ numbers: sortedNumbers });
    })
    .catch(error => {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

function getUniqueNumbers(numbers) {
  const uniqueSet = new Set(numbers);
  return Array.from(uniqueSet);
}
// Sorting function for arranging numbers in ascending order
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
