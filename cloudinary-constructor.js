const fs = require('fs');
const http = require('http');
const { promisify } = require('util');
const getFile = require('async-get-file');
const { exec } = require('child_process');
const cloudinary = require('cloudinary').v2;

const execPromise = promisify(exec);

cloudinary.config({
  api_key: process.env.API_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const getAllPhotosInRange = async (dayLengthString = '1d', fromDate = new Date()) => {
  let results = [];
  let nextCursor = true;

  while(nextCursor) {
    let response;

    if (nextCursor === true) {
      response = await cloudinary.search
      .expression(`folder:time-elapser AND resource_type:image`)
      .with_field('context')
      .max_results(500)
      .sort_by('created_at', 'asc')
      .execute();
    } else {
      response = await cloudinary.search
      .expression(`folder:time-elapser AND resource_type:image`)
      .with_field('context')
      .max_results(500)
      .next_cursor(nextCursor)
      .sort_by('created_at', 'asc')
      .execute();
    }

    console.log(nextCursor, response.rate_limit_remaining);

    nextCursor = response.next_cursor || false;
    results = results.concat(response.resources.map(e => e.url));
  }

  fs.writeFileSync('./urls.txt', results.reduce((summary, e) => `${summary}\n${e}`));
};

// getAllPhotosInRange('2w');

// const get1800Equidistant = (allDays, )

// const downloadFile = (url, index) => new Promise((resolve) => {
//   const file = fs.createWriteStream(`./photos/${index}.jpg`);

//   http.get(url, res => res.pipe(file));

//   file.on('finish', resolve());
// });

const downloadBatch = (urls, startingIndex) => Promise.all(urls.map((url, i) => getFile(url, { directory: 'photos', filename: `${startingIndex + i}.jpg` })));

const downloadAllPhotos = async (_urls, batchSize = 5) => {
  let remainingUrls = fs.readFileSync('./urls.txt', 'utf-8').split('\n').slice(0, 12600).filter((e, i) => i % 7 === 0);

  let index = 0;
  while (remainingUrls.length >= batchSize) {
    const batchUrls = remainingUrls.slice(0, batchSize);
    remainingUrls = remainingUrls.slice(batchSize);

    await downloadBatch(batchUrls, index);
    index = index + batchSize;
  }
};
downloadAllPhotos();
