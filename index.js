const Record = require('node-record-lpcm16');

// Imports the Google Cloud client library
const Speech = require('@google-cloud/speech');

// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

// Imports https module
const https = require('https');

// Creates a client
const speechClient = new Speech.SpeechClient();

// Creates a client
const translate = new Translate();

const gcsUri = 'gs://youtube-audio/will-you-marry-me-ep1-1-5.wav';
const translateTarget = 'en';
const encoding = 'LINEAR16';
const sampleRateHertz = 44100;
const languageCode = 'th-TH';

const audio = {
  uri: gcsUri,
};

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  audio: audio,
  interimResults: false, // If you want interim results, set this to true
};

speechClient
  .longRunningRecognize(request)
  .then(data => {
    const operation = data[0];
    // Get a Promise representation of the final result of the job
    return operation.promise();
  })
  .then(data => {
    const response = data[0];
    console.log("Text type array : " + Array.isArray(response.results));
    var text = [];
    response.results.forEach((result, i) => {
      text.push(result.alternatives[0].transcript);
    });
    translate
    .translate(text, translateTarget)
    .then(results => {
      let translations = results[0];
      console.log(translations);
      translations = Array.isArray(translations)
        ? translations
        : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`\n${text[i]} => (${translateTarget}) ${translation}\n`);
      });
    })
    .catch(err => {
      console.error('TRANSLATION ERROR:', err);
    });
  })
  .catch(err => {
    console.error('ERROR:', err);
  });


// Create a recognize stream
// const recognizeStream = speechClient
//   .streamingRecognize(request)
//   .on('error', console.error)
//   .on('data', function (data) {
//     if (data.results[0] && data.results[0].alternatives[0]) {
//       let text = data.results[0].alternatives[0].transcript;
//       translate
//         .translate(text, translateTarget)
//         .then(results => {
//           let translations = results[0];
//           translations = Array.isArray(translations)
//             ? translations
//             : [translations];
// 
//           console.log('Translations:');
//           translations.forEach((translation, i) => {
//             console.log(`${text} => (${translateTarget}) ${translation}`);
//           });
//         })
//         .catch(err => {
//           console.error('TRANSLATION ERROR:', err);
//         });
//     } else {
//       console.log(`\n\nReached transcription time limit, press Ctrl+C\n`);
//     }
//   });

// Start recording and send the microphone input to the Speech API
// Record
//   .start({
//     sampleRateHertz: sampleRateHertz,
//     threshold: 0,
//     verbose: false,
//     recordProgram: 'rec', // Try also "arecord" or "sox"
//     silence: '10.0',
//   })
//   .on('error', console.error)
//   .pipe(recognizeStream);

// console.log('Listening, press Ctrl+C to stop.');