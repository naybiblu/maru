const { readdirSync } = require("fs");
const path = require('path');
const { TelegrafCommandHandler: Commands } = require('telegraf-command-handler-upgraded');
const { Application, Router } = require('@cfworker/web');
const createTelegrafMiddleware = require('cfworker-middleware-telegraf');
const { SECRET_PATH: secret } = process.env;
require("dotenv").config();
const { tg } = require("./clients");
const { log, readDirGetJS, mongo } = require("./misc");
const { commands: d1 } = require("./commands");

/*exports.initializeCollections = () => {

  tg.commands = new Map();
  tg.scenes = new Map();

};*/

exports.setServer = async () => {

  const router = new Router();

  router.post(`/${secret}`, createTelegrafMiddleware(bot))
  
  new Application().use(router.middleware).listen();

  tg.telegram.setWebhook(`https://maru.iamsuperv15.workers.dev/${secret}`);
  await bot.telegram.getWebhookInfo().then(console.log);

};

/*exports.eventHandler = async() => {

  readdirSync("./src/tg/events").forEach( async (event) => {

    readDirGetJS(`./src/tg/events/${event}`, async (file) => {

      let data = require(`./../../tg/events/${event}/${file}`);

      switch (event) {

        case "message": tg.on(message(data.type), data.run.bind(tg));
  
      }

    });
      
  });
  
};*/
  
exports.commandHandler = () => {

  let commandsDir = readdirSync("./src/tg/commands");
  let actionsDir = readdirSync("./src/tg/actions");

  actionsDir.forEach((name) => {
        
    let data = require(`./../../tg/actions/${name}`);

    tg.action(data.name, data.run.bind(tg));

  });

  const CommandHandler = new Commands({
    path: path.resolve() + "/src/tg/commands",
    errorHandling: (ctx) => ctx.reply("Something went wrong. Please try again later.")
  });

  tg.use(CommandHandler.load());
  
  log.success(
    "Telegram", 
    `Registered ${commandsDir.length} command${commandsDir.length > 1 ? "s" : ""}.`
  );
  
};

exports.sceneHandler = () => {

  let scenesDir = readdirSync("./src/tg/scenes");
  scenesDir.forEach((name) => {
        
    let data = require(`./../../tg/scenes/${name}`).run(tg);

  });
  
  log.success(
    "Telegram", 
    `Registered ${scenesDir.length} scene${scenesDir.length > 1 ? "s" : ""}.`
  );
  
};

exports.catchErrors = () => {
  
  readdirSync("./src/process").forEach((e) => {
      
    let data = require(`./../../process/${e}`);
      
    process.on(data.event, data.run.bind(process));
      
  });
        
  log.success(
    "NodeJS", 
    "Error-catchers are placed."
  );
        
};

exports.connectDB = async () => {

  await mongo.connect();

  readdirSync("./src/mongo/events").filter((e) => e.endsWith(".js")).forEach(async (event) => {

    let data = require(`./../../mongo/events/${event}`);

    data.run();

  });

};


exports.initializeBot = async () => {

  const { 
    //initializeCollections: a,
    //eventHandler: b,
    sceneHandler: c,
    commandHandler: d2,
    catchErrors: e,
    connectDB: f,
  } = this;
      
  //a();
  //b();
  c();
  d1();
  d2();
  e();
  f();
  tg.launch();
      
};