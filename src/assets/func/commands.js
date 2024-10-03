const { tg } = require("./clients");

exports.commands = async () => {

    tg.telegram.setMyCommands([
        {
            command: "start",
            description: "Start this bot."
        },
        {
            command: "paperplane",
            description: "Send a message to a random PUPian."
        },
        {
            command: "reply",
            description: "Respond to a received message."
        },
        {
            command: "foodtrip",
            description: "Browse every food establishment within and around PUP."
        },
        {
            command: "settings",
            description: "Configure your profile and preferences."
        }
    ]);

};