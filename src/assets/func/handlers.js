const { readdirSync } = require("fs");
const express = require("express");
const { message } = require("telegraf/filters");
require("dotenv").config();
const { tg } = require("./clients");
const { log, readDirGetJS } = require("./misc");

exports.initializeCollections = () => {

  tg.commands = new Map();

};

exports.setServer = async () => {

  express()
    .enable("trust proxy")
    .set("etag", false)
    .set("view engine", "ejs")
    .use(await tg.createWebhook({ domain: webhookDomain }))
    .get('/', async (req, res) => res.send('Shh!'))
    .listen(3000, async () => {

    log.success(
      "Express", 
      `Online.` 
    );

    });

};

exports.eventHandler = () => {

  readdirSync("./src/tg/events").forEach((event) => {

    readDirGetJS(`./src/tg/events/${event}`, (file) => {

      let data = require(`./../../tg/events/${event}/${file}`);

      switch (event) {

        case "message": tg.on(message(data.type), data.run.bind(tg));
  
      }

    });
      
  });
  
};
  
exports.commandHandler = () => {
  
  readdirSync("./src/tg/commands").forEach((type) => {
        
    tg.commands.set(code.data?.name, code);

  });
  
  log.success(
    "Telegram", 
    `Registered ${tg.commands.size} command${tg.commands.size > 1 ? "s" : ""}.`
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

exports.initializeBot = () => {

  const { 
    initializeCollections: a,
    eventHandler: b, 
    commandHandler: c, 
    catchErrors: d
  } = this;
      
  a();
  b();
  c();
  d();
  tg.launch();
      
};