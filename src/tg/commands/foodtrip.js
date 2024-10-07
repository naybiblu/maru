const Markup = require('telegraf/markup');
const { model } = require("./../../assets/db/models/user");

module.exports = {
    name: "foodtrip",
    async execute (ctx) {

        await ctx.scene.enter("foodtrip");
        
    }
}