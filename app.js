const server = require("./server");

//const twitter = require("./twitter");


const main = async () => {
  try {
    console.log("timestamp"+' [tbc.amqplib] : amqp consumer is listening....');
    //twitter.connect();
    server.connect();
  } catch (error) {
    console.error("Could not start application", error);
  }
};

const terminate = signal => {
  console.info(`Application stopping on ${signal}`);
  server.disconnect();
  process.exit();
};

process.on("SIGINT", () => terminate("SIGINT"));
process.on("SIGTERM", () => terminate("SIGTERM"));

 // insert default dreams
  

main();
