// Import Dependencies
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import type { DisTube } from "distube";
import type { Logger } from "pino";
// Define Types
// Register Commands Meta
export const registry = [
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song")
        .addStringOption((arg) =>
            arg
                .setName("song")
                .setDescription("Song to be played")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops playing music on the guild"),
    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current music in queue"),
];
// Define Commands
export const playSong = async (
    interaction: CommandInteraction,
    distube: DisTube,
    logger: Logger
): Promise<void> => {
    // Get Params
    const { options, guild, user } = interaction;
    // Get Song Name
    const songName = options.getString("song", true);
    // Get User Channel
    const userChannel = guild?.members.cache.get(user.id)?.voice?.channel;
    if (userChannel) {
        // Search Song
        const [searchResult] = await distube.search(songName, { limit: 1 });
        if (searchResult) {
            // Notify User
            const alreadyPlaying = distube.getQueue(guild.id)?.playing;
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(alreadyPlaying ? "Queued" : "Playing Now")
                        .setDescription(searchResult.name)
                        .setThumbnail(searchResult.thumbnail || "")
                        .setURL(searchResult.url)
                        .setFields(
                            searchResult.uploader.name
                                ? [
                                      {
                                          name: "Channel",
                                          value: searchResult.uploader.name,
                                          inline: true,
                                      },
                                  ]
                                : []
                        ),
                ],
            });
            // Play Song
            logger.info(`[GUID: %d] Playing %s`, guild.id, searchResult.name);
            await distube.playVoiceChannel(userChannel, searchResult.url, {
                skip: false,
            });
        } else {
            // Alert User
            await interaction.reply({
                content: "Could not find any content related to this",
            });
        }
    } else {
        // Alert Not In Channel
        await interaction.reply({
            content: "You're not in a voice channel",
        });
    }
};

export const stopSong = async (
    interaction: CommandInteraction,
    distube: DisTube,
    logger: Logger
): Promise<void> => {
    // Get Params
    const { guildId } = interaction;
    // Stop Playing in Guild
    if (guildId) {
        logger.info(`[GUID: %d] Stop playing`, guildId);
        await distube.stop(guildId);
        // Reply Success
        await interaction.reply({
            content: "Vamos parar com isso aí *taokey*?",
        });
    } else {
        await interaction.reply({ content: "Invalid guild data" });
    }
};

export const skipSong = async (
    interaction: CommandInteraction,
    distube: DisTube,
    logger: Logger
): Promise<void> => {
    // Get Params
    const { guildId } = interaction;
    // Stop Playing in Guild
    if (guildId) {
        try {
            logger.info(`[GUID: %d] Skipping queue`, guildId);
            const nextSong = await distube.skip(guildId);
            // Notify User
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Playing Now")
                        .setDescription(nextSong.name || "")
                        .setThumbnail(nextSong.thumbnail || "")
                        .setURL(nextSong.url)
                        .setFields(
                            nextSong.uploader.name
                                ? [
                                      {
                                          name: "Channel",
                                          value: nextSong.uploader.name,
                                          inline: true,
                                      },
                                  ]
                                : []
                        ),
                ],
            });
        } catch {
            logger.warn(`[GUID: %d] No music to play after skipping`, guildId);
            // No More Musics
            await distube.stop(guildId);
            await interaction.reply({
                content: "Eu não sou coveiro, mas sua playlist chegou ao fim",
            });
        }
    } else {
        await interaction.reply({ content: "Invalid guild data" });
    }
};
