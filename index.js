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

const uploadPhoto = async (deviceId = '/dev/video2') => {
  console.time('full flow');
  const date = new Date().toISOString().replace(/\:/g, '-');

  // get the image from our USB camera
  await execPromise(`ffmpeg -f v4l2 -i ${deviceId} -vframes 1 "${date}.jpeg"`);

  // upload it to cloudinary in our big time-elapser folder
  await cloudinary.uploader.upload(`./${date}.jpeg`,
    {
      unique_filename: false,
      folder: 'time-elapser',
      use_filename: true,
      async: true,
    }
  );

  // delete the image
  await rmPromise(`./${date}.jpeg`);
  console.timeEnd('full flow');
};

setInterval(() => {
  uploadPhoto();
}, 48000); // 48 seconds === 30 second 60fps gif of 24 hours
