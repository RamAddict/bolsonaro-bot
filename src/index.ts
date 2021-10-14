// Import Dependencies
import pino from "pino";
import { Client } from "discord.js";
import { DisTube } from "distube";
import { playSong, skipSong, stopSong } from "./commands/music.js";
import semver from "semver";
// console.log(process.env)
// Define Logger
const logger = pino({
    prettyPrint: process.env.NODE_ENV !== "production",
});
// Define Client
const client = new Client({
    // Define what events the bot will listen
    intents: ["GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILDS"],
    // Define current activity
    presence: {
        status: "online",
        activities: [
            {
                name: "-help",
                type: "WATCHING",
            },
        ],
    },
});
// Register Distube
const distube = new DisTube(client, { emitNewSongOnly: true, nsfw: true });
// Define Listeners
client.on("ready", () => {
    // Started
    logger.info("Started successfully");
});
client.on("interactionCreate", (interaction) => {
    // Ignore Non Commands
    if (!interaction.isCommand()) return;
    // Get Command Data
    const { commandName } = interaction;
    // Switch Command
    try {
        switch (commandName) {
            case "play":
                return playSong(
                    interaction,
                    distube,
                    logger.child({ command: "play" })
                );
            case "stop":
                return stopSong(
                    interaction,
                    distube,
                    logger.child({ command: "stop" })
                );
            case "skip":
                return skipSong(
                    interaction,
                    distube,
                    logger.child({ command: "skip" })
                );
            default:
                return logger.warn(`Invalid command: ${commandName}`);
        }
    } catch (error) {
        logger.error(error as Error);
    }
});
// Start Bot
try {
    await client.login(process.env.DISCORD_TOKEN);
} catch (error: any) {
    // Log Message Error
    logger.error(error.message);
    // Exit from System
    process.exit(1);
}
