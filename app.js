const bolsonaroQuotes = require("./bolsonaro.quotes.json")
const Discord = require('discord.js');
const client = new Discord.Client();

const fileLineArray = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!, I should be online now`);
});

function getRandomLine() {
    const filesize = 25;
    return bolsonaroQuotes[parseInt(Math.random()*filesize)];
}

client.on('message', msg => {
// for now invocation line is b.
    if (msg.content.startsWith('b.', 0) == true) {
        if (msg.content.search('quote') != -1) {
            msg.channel.send(getRandomLine())
        }
    }
    
//   random text replies section EASTEREGGS
    if (msg.content.search('adriano') != -1) {
        msg.reply('Adriano é viado eim')
    }
    if (msg.content.search('joao') != -1) {
        msg.reply('joao é corno')
    }
    if (msg.content.search('web dev') != -1 || msg.content.search('webedeve') != -1) {
        msg.reply('Web dev nem gente é')
    }

    if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
  
});

client.login('Njk0NjYzNjk1MDg2NjQ5MzY2.XoO-FQ.z2CJqdlEBnX-Hy2s6WJahQsG5ng');