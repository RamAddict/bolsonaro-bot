// Import Dependencies
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
// Import Commands
import { registry } from "./commands/music.js";
// Load Env
const {
    NODE_ENV: nodeEnv,
    DISCORD_TOKEN: token,
    DISCORD_DEV_GUILD_ID: guildId,
    DISCORD_APPLICATION_ID: appId,
} = process.env;
// Load Commands
const commands = [...registry].map((cmd) => cmd.toJSON());
// Register Commands
const restClient = new REST({ version: "9" }).setToken(token);

console.info("Started refreshing application (/) commands.");
if (nodeEnv === "production") {
    await restClient.put(Routes.applicationCommands(appId), {
        body: commands,
    });
} else {
    await restClient.put(Routes.applicationGuildCommands(appId, guildId), {
        body: commands,
    });
}
console.info("Successfully reloaded application (/) commands.");
