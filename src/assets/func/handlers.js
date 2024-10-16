const { readdirSync } = require("fs");
const path = require('path');
const { TelegrafCommandHandler: Commands } = require('telegraf-command-handler-upgraded');
const { parse } = require('rss-to-json');
const { DISCORD_TOKEN: token } = process.env;
require("dotenv").config();
const { tg, dc } = require("./clients");
const { 
  log, 
  mongo, 
  sendDailyPUPWeather,
  sendLETData,
  revealLETAnswer
} = require("./misc");
const { commands: c1 } = require("./commands");
const { model } = require("./../db/models/user");

/*exports.eventHandler = async() => {

  readdirSync("./src/tg/events").forEach( async (event) => {

    readDirGetJS(`./src/tg/events/${event}`, async (file) => {

      let data = require(`./../../tg/events/${event}/${file}`);

      switch (event) {

        case "message": tg.on(message(data.type), data.run.bind(tg))
  
      }

    });
      
  });
  
};*/
  
exports.commandHandler = () => {

  let commandsDir = readdirSync("./src/tg/commands");
  let actionsDir = readdirSync("./src/tg/actions");

  actionsDir.forEach((name) => {
        
    let data = require(`./../../tg/actions/${name}`);

    tg.action(data.name, data.run.bind(tg)).catch(err => console.error(err));

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

exports.sceneHandler = async () => {

  require("./../../tg/scenes").run(tg).catch(err => console.error(err));;

  log.success(
    "Telegram", 
    `Registered scenes.`
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

    data.run().catch(err => console.error(err));

  });

  await model.updateMany(
    { }, 
    { $set: { indexPagination: 0 } }
  );

};

exports.connectDC = async () => {

  dc
    .on("ready", async () => {

      log.success(
        "Discord", 
        "Online."
      );

      try {

        //await sendLETData();
        await revealLETAnswer();
        await sendDailyPUPWeather();

        setInterval(async () => {
          
          await sendDailyPUPWeather();
          await revealLETAnswer();
        
        }, 20 * 1000);

      } catch (err) { console.error(err); }

    })
    .login(token);

}


exports.initializeBot = async () => {

  const { 
    //eventHandler: a,
    sceneHandler: b,
    commandHandler: c2,
    catchErrors: d,
    connectDB: e,
    connectDC: f
  } = this;

  //a();
  b();
  c1();
  c2();
  d();
  e();
  f();

  tg.launch();
      
};