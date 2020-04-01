const bolsonaroQuotes = require("./bolsonaro.quotes.json")
const Discord = require('discord.js');

function getRandomLine() {
    const filesize = 25;
    return bolsonaroQuotes[parseInt(Math.random() * filesize)];
}

function clientHandlerReady(client) {
    console.log(`Logged in as ${client.user.tag}!, I should be online now`);
}

/** @param {import("discord.js").Message} msg */
function clientHandlerMesssage(msg) {
    lowerCaseMessage = msg.content.toLowerCase();
    // for now invocation line is b.
    if (lowerCaseMessage.startsWith('b.', 0) == true) {
        // b.Help function
        if (lowerCaseMessage.search('help') != -1) {
            const embed = new Discord.MessageEmbed()
            .setTitle('Bolsonaro command list:')
            .setColor(0xFCAA00)
            // .setThumbnail('https://i.imgur.com/lCZ1lnx.jpg')
            .setDescription('Use b. para falar comigo')
            .addField('Quote', 'Mando uma elocução do passado', true)
            .addField('Help', 'Mostro essa mensagem', false);
            msg.channel.send('Brasil acima de tudo, Deus acima de todos.', embed);
        }
        else
        // b.Quote function
        if (lowerCaseMessage.search('quote') != -1) {
            msg.channel.send(getRandomLine())
        }
    }
    // only respond to non bot messages
    if (!msg.author.bot) {
        //   random text replies section EASTEREGGS
        if (lowerCaseMessage.search('adriano') != -1) {
            msg.reply('Adriano é viado eim')
        }
        if (lowerCaseMessage.search('joao') != -1) {
            msg.reply('joao é corno')
        }
        if (lowerCaseMessage.search('web dev') != -1 || lowerCaseMessage.search('webedeve') != -1) {
            msg.reply('Web dev nem gente é')
        }
    }
}

function initializeBot() {
    const client = new Discord.Client();
    client.on('ready', () => clientHandlerReady(client));
    client.on('message', clientHandlerMesssage);
    client.login('Njk0NjYzNjk1MDg2NjQ5MzY2.XoQBUw.Oxk-eWFIp0hTUnXYX59SnjRPbJw');
}

// Begin Listen
initializeBot()