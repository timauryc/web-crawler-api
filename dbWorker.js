// dbWorker.js

const { parentPort } = require('worker_threads');
const admin = require("firebase-admin");

// recieve crawled data from main thread
parentPort.once("message", (message) => {
    console.log("Recieved data from mainWorker... " + JSON.stringify(message));
    // store data gotten from main thread in database
    parentPort.postMessage("Data saved successfully");
});