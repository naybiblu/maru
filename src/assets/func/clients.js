const { Telegraf } = require('telegraf');
const { TELEGRAM_APIKEY: tg } = process.env;
require("dotenv").config();

exports.tg = new Telegraf(tg);