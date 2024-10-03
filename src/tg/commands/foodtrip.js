const { model } = require("../../assets/db/models/user");
const Markup = require('telegraf/markup')

module.exports = {
    name: "foodtrip",
    async execute (ctx, args) {

        ctx.reply('One time keyboard', Markup
            .keyboard(['/simple one', '/inline', '/pyramid'])
            .oneTime()
            .resize()
          )
        
    }
}