const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const { generateDateString } = require('./get-date-name');
const getFile = require('async-get-file');
const awsSdk = require('aws-sdk');
require('dotenv').config();

const execPromise = promisify(exec);

const s3 = new awsSdk.S3({
  region: 'ap-southeast-2',
  accessKeyId: process.env.FETCH_KEY_ID,
  secretAccessKey: process.env.FETCH_SECRET_KEY
});

const downloadBatch = (urls, startingIndex) => Promise.all(urls.map((url, i) => getFile(url, { directory: 'photos', filename: `${startingIndex + i}.jpg` })));

const downloadAllPhotos = async (urls, batchSize = 5) => {
  // let remainingUrls = fs.readFileSync('./urls.txt', 'utf-8').split('\n').slice(0, 12600).filter((e, i) => i % 7 === 0);
  let remainingUrls = [...urls]

  let index = 0;
  while (remainingUrls.length >= batchSize) {
    const batchUrls = remainingUrls.slice(0, batchSize);
    remainingUrls = remainingUrls.slice(batchSize);

    await downloadBatch(batchUrls, index);
    index = index + batchSize;
  }
};

const prefixes = Array.from({ length: 28 }, (_, i) => {
  const day = `DD${i + 1}-`;
  const month = 'MM1-';
  const week = `WW${Math.floor(i / 7) + 1}-`;
  return [`${day}${month}`, `${day}${week}-${month}`];
}).flat();

const getSignedUrls = (keys) => Promise.all(keys.map(Key => s3.getSignedUrlPromise('getObject', { Key, Bucket: process.env.BUCKET_NAME })));

const download = async () => {
  let list = [];

  await Promise.all(prefixes.map(async prefix => {
    const results = await s3.listObjectsV2({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix
    }).promise();
    list = list.concat(results.Contents)
  }));

  const sortedList = list.sort((a, b) => a.Key.slice(-28) >= b.Key.slice(-28) ? 1 : -1);
  const urls = await getSignedUrls(sortedList.map(ob => ob.Key));

  await downloadAllPhotos(urls);
};

download();

