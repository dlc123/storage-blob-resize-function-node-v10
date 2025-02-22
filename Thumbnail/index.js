const stream = require('stream');
const Jimp = require('jimp');

const {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadStreamToBlockBlob
} = require("@azure/storage-blob");

const ONE_MEGABYTE = 1024 * 1024;
const ONE_MINUTE = 60 * 1000;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const containerName = process.env.BLOB_CONTAINER_NAME;
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accessKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const sharedKeyCredential = new SharedKeyCredential(
  accountName,
  accessKey);
const pipeline = StorageURL.newPipeline(sharedKeyCredential);
const serviceURL = new ServiceURL(
  `https://${accountName}.blob.core.windows.net`,
  pipeline
);

module.exports = async function(context, eventGridEvent, inputBlob) {  

  //context.log("Starting: " + inputBlob);
  context.log("Starting context: " + context.bindingData.data);
  context.log("Context url: " + context.bindingData.data.url);
  const aborter = Aborter.timeout(30 * ONE_MINUTE);
  //const widthInPixels = 100;
  const contentType = context.bindingData.data.contentType;
  const blobUrl = context.bindingData.data.url;
  const blobName = blobUrl.slice(blobUrl.lastIndexOf("/")+1);

  //const image = await Jimp.read(inputBlob);
  //const thumbnail = image.resize(widthInPixels, Jimp.AUTO);
  //const thumbnailBuffer = await thumbnail.getBufferAsync(Jimp.AUTO);
  //const readStream = stream.PassThrough();
  //readStream.end(thumbnailBuffer);

  const my_date = new Date();
  const my_path = my_date.getUTCFullYear() + "/" + (my_date.getUTCMonth()+1) + "/" + my_date.getUTCDate() + "/"
  
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, my_path + blobName);
  try {
    context.log("Out url: " + blockBlobURL.url);
    blockBlobURL.upload(aborter, inputBlob, inputBlob.length);
//    await uploadStreamToBlockBlob(aborter, readStream,
//      blockBlobURL, uploadOptions.bufferSize, uploadOptions.maxBuffers,
//      { blobHTTPHeaders: { blobContentType: "image/*" } });

  } catch (err) {

    context.log(err.message);

  } finally {

    //context.done();

  }
};
