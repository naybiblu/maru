const Markup = require('telegraf/markup');
const { model } = require("./../../assets/db/models/user");

module.exports = {
    name: "foodtrip",
    async execute (ctx) {

        await model.updateOne(
            { id: ctx.update.message.from.id }, 
            { $set: { indexPagination: 0 } }
        );

        await ctx.reply(
            `*🍴 Welcome to /foodtrip, your guide to every food establishment within and around PUP.*\n\nKindly choose a location you want to visit or contribute with us in updating the _PUP Sta. Mesa Food Price Watch_ Google Sheets file.`, 
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('PUP Lagoon', 'ftLoc1'),
                    Markup.button.callback('PUP Stop and Shop', 'ftLoc2'),
                    Markup.button.callback('Teresa Drive', 'ftLoc3'),
                    Markup.button.url('Contribute', 'https://docs.google.com/spreadsheets/d/1NfHae5yGx0fbi_0WnbbZKKW0fuUOhLluYvBO53Ej2XM/edit?usp=sharing')
                ],  
                { columns: 1 } )
            }
        );
        
    }
}