const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const { generateDateString } = require('./get-date-name');
const nodeCron = require('node-cron');
const awsSdk = require('aws-sdk');
require('dotenv').config();

const s3 = new awsSdk.S3({
  region: 'ap-southeast-2',
  accessKeyId: process.env.KEY_ID,
  secretAccessKey: process.env.SECRET_KEY
});

const execPromise = promisify(exec);
const rmPromise = promisify(fs.rm);

const upload = async () => {
  console.time('full flow');
  const date = generateDateString(new Date());

  // get the image from our USB camera
  await execPromise(`fswebcam -r 1920x1080 -F 2 --flip v --no-banner -D 5 "${date}.jpeg"`);

  // upload it to cloudinary in our big time-elapser folder
  const body = fs.readFileSync(`./${date}.jpeg`);
  await s3.upload({ Bucket: process.env.BUCKET_NAME, Key: `${date}.jpg`, Body: body }).promise();

  // delete the image
  await rmPromise(`./${date}.jpeg`);
  console.timeEnd('full flow');
};

nodeCron.schedule('*/48 * * * * *', () => {
  upload();
});
