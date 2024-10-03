const { model } = require("../../assets/db/models/user");
const Markup = require('telegraf/markup')

module.exports = {
    name: "reply",
    async run (ctx) {

        ctx.reply(`/reply ${ctx.chat.id}`);
        
    }
}