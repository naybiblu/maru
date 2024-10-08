const { tg } = require("./clients");

exports.commands = async () => {

    tg.telegram.setMyCommands([
        {
            command: "start",
            description: "Start this bot."
        },
        {
            command: "menu",
            description: "Interact with the main menu."
        },
        {
            command: "foodtrip",
            description: "Browse every food establishment within and around PUP."
        },
        {
            command: "colleges",
            description: "Look for a certain college that piques your interests."
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
            command: "spotifyplaylist",
            description: "Get a random Spotify playlist."
        },
        {
            command: "settings",
            description: "Configure your profile and preferences."
        }
    ]);

};