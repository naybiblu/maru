const { Telegraf } = require('telegraf');
const { Client, Partials } = require("discord.js");
const { 
    TELEGRAM_APIKEY: tg,
 } = process.env;
require("dotenv").config();

exports.tg = new Telegraf(tg);

exports.dc = new Client({
    intents: [
      "Guilds",
      "GuildMessages",
      "GuildMembers",
      "DirectMessages",
      "MessageContent"
    ],
    partials: [
      Partials.Channel
    ]
});
