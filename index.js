const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const cloudinary = require('cloudinary').v2;

const execPromise = promisify(exec);
const rmPromise = promisify(fs.rm);

cloudinary.config({
  api_key: process.env.API_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const uploadPhoto = async () => {
  console.time('full flow');
  const date = new Date().toISOString().replace(/\:/g, '-');

  console.log('above image taken');
  await execPromise(`ffmpeg -f v4l2 -i /dev/video2 -vframes 1 "${date}.jpeg"`);

  console.log('above upload');
  await cloudinary.uploader.upload(`./${date}.jpeg`, { use_filename: true, folder: 'time-elapser', async: true });

  console.log('above delete');
  await rmPromise(`./${date}.jpeg`);

  console.timeEnd('full flow');
};

setInterval(() => {
  uploadPhoto();
}, 48000);