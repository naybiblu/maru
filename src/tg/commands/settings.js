module.exports = {
    name: "settings",
    async execute (ctx) {

        await ctx.scene.enter("settings");
        
    }
}