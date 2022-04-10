// TODO: ADD AUTO CLEARING WHEN THE STATUS UPDATES TO ONLINE

const Discord = require('discord.js');
const ms = require('ms');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fetch = require('node-fetch');
const config = require('./config.json');
const client = new Discord.Client({
    intents: [
        //https://ziad87.net/intents/
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES"
    ],
    partials: [
        "MESSAGE",
        "CHANNEL",
        //"REACTION",
        "GUILD_MEMBER",
        //"USER"
    ]
});
require('dotenv').config();

const ip = process.env.IP;
const port = process.env.PORT || 25565;

resetStatus()

let currentlyOnline = false;
let currentPlayers = null;
let maintenanceMode = false;
let customMessage = undefined;
//let oldStatus = 0;
//let currentStatus = 0;

// maintenance 2
// offline 0
// online 1


function resetStatus() {
    getServerInfo().then(res => {
        if (res.online === false || res.offline === true) {
            getServerInfoV1().then(function(resSecond) {
                if(resSecond.online === false || resSecond.offline === true) {
                    currentlyOnline = false;
                    currentPlayers = null;
                    console.log('The server is offline!');
                } else {
                    if (resSecond.version === "Maintenance") {
                        maintenanceMode = true
                    } else {
                        maintenanceMode = false
                    }
                    currentlyOnline = true;
                    currentPlayers = `${resSecond.players.online}/${resSecond.players.max}`;
                    console.log(`The server is online!\nCurrent Players: ${currentPlayers}!`);
                }
            })
        } else {
            if (res.version === "Maintenance") {
                maintenanceMode = true
            } else {
                maintenanceMode = false
            }
            currentlyOnline = true;
            currentPlayers = `${res.players.online}/${res.players.max}`;
            console.log(`The server is online!\nCurrent Players: ${currentPlayers}!`);
        }
    }).catch(e => {
        console.log(e);
    })
}

async function getServerInfo() {
    const response = await fetch(`https://api.mcsrvstat.us/2/${ip}:${port}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    return data;
}

async function getServerInfoV1() {
    const response = await fetch(`https://api.mcsrvstat.us/1/${ip}:${port}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    return data;
}

function updateStatus() {
    const channel = client.channels.cache.get(process.env.CHANNELID);
    if (!channel) return new Error('Channel ID is undefined!');

    if (!process.env.MESSAGEID) {
        const setupEmbed = new Discord.MessageEmbed()
        .setTitle('Setting up!')
        .setDescription('The bot is currently being set up! This is a message to grab the message ID from witch we can then edit this message!')
        .setTimestamp()
        
        channel.send({ embeds: [setupEmbed] }).then(() => {
            console.log('SETUP MODE ACTIVATED UNTIL MESSAGEID IS DEFINED IN THE .env FILE!')
            process.exit();
        });
    }

//    if (maintenanceMode === true) {
//        currentStatus = 2;
//    } else if (currentlyOnline === true) {
//        currentStatus = 1;
//    } else {
//        currentStatus = 0;
//    }

    // maintenance 2
    // offline 0
    // online 1

//    console.log(currentStatus);
//    console.log(oldStatus);

//    if (currentStatus === 1 && !oldStatus === 1) {
//        console.log('Switch to online');
//        customMessage = undefined;
//        oldStatus = 1;
//    }

    if (maintenanceMode === true) {
        client.user.setPresence({ activities: [{ name: config.customStatus.maintenance, type: config.customStatus.maintenanceType }], status: config.customStatus.maintenanceStatus });
    } else if (currentlyOnline === true) {
        client.user.setPresence({ activities: [{ name: config.customStatus.online.replace('{online/max}', currentPlayers).replace('{online}/{max}', currentPlayers), type: config.customStatus.onlineType }], status: config.customStatus.onlineStatus });
    } else {
        client.user.setPresence({ activities: [{ name: config.customStatus.offline, type: config.customStatus.offlineType }], status: config.customStatus.offlineStatus });
    }

    channel.messages.fetch(process.env.MESSAGEID).then(msg => {
        if (maintenanceMode === true) {
            const Embed = new Discord.MessageEmbed()
            .setColor(config.maintenancemode.colour)
            .setTitle(config.servername + ' Server Status!')
            .setURL(config.website)
            .setAuthor(config.servername, config.youricon, config.website)
            .setDescription(config.maintenancemode.description)
            .setThumbnail(config.youricon)
            .addFields(
                { name: config.maintenancemode.fieldName, value: config.maintenancemode.fieldValue },
                { name: 'Ammout of online players:', value: currentPlayers },
                { name: 'Connection IP:', value: config.displayip },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/Reason:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter(config.maintenancemode.footer, config.youricon);
            msg.edit({ embeds: [Embed] })
        } else if (currentlyOnline === true) {
            const Embed = new Discord.MessageEmbed()
            .setColor(config.online.colour)
            .setTitle(config.servername + ' Server Status!')
            .setURL(config.website)
            .setAuthor(config.servername, config.youricon, config.website)
            .setDescription(config.online.description)
            .setThumbnail(config.youricon)
            .addFields(
                { name: 'Ammout of online players:', value: currentPlayers },
                { name: 'Connection IP:', value: config.displayip },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/s:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter(config.online.footer, config.youricon);
            msg.edit({ embeds: [Embed] })
        } else {
            const Embed = new Discord.MessageEmbed()
            .setColor(config.offline.colour)
            .setTitle(config.servername + ' Server Status!')
            .setURL(config.website)
            .setAuthor(config.servername, config.youricon, config.website)
            .setDescription(config.offline.description)
            .setThumbnail(config.youricon)
            .addFields(
                { name: 'Connection IP:', value: config.displayip },
                { name: 'Connection Port:', value: process.env.PORT },
                { name: 'Message/Reason:', value: customMessage || 'No current messages.'}
            )
            .setTimestamp()
            .setFooter(config.offline.footer, config.youricon);
            msg.edit({ embeds: [Embed] })
        }
    });
    console.log('Status has been updated!')
}

client.on('ready', c => {
    console.log(`Logged in as ${c.user.tag}`);
    updateStatus();
    setInterval(() => {
        updateStatus();
    }, ms(config.UpdateIntervalEmbed));

    if (config.commands.enableSlashCommands === true) {
        const commands = [
            new SlashCommandBuilder().setName('setmessage').setDescription('Sets the custom messagge!')
            .addStringOption((option) => option.setName('message').setDescription('The message you want to set the custom message to!')),
        ].map(command => command.toJSON());

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        rest.put(Routes.applicationGuildCommands(client.user.id, config.guildid), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    }
});

setInterval(() => {
    resetStatus();
}, ms(config.UpdateIntervalAPIChecking));

if (config.commands.enableMessageCommands === true) {
    client.on('messageCreate', message => {
        if (message.author.bot) return;
        
        let prefix = config.commands.prefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (cmd === 'setmessage') {
            if (!message.member.permissions.has(config.commands.requiredPermission)) return message.reply(`You are missing the permission \`${config.commands.requiredPermission}\`!`)
            if (!args.length >= 1) {
                customMessage = undefined;
                message.reply('The status has been cleared!');
            } else {
                customMessage = args.join(' ');
                message.reply('The status has been changed!');
            }
            updateStatus();
        }
    });
}

if (config.commands.enableSlashCommands === true) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'setmessage') {
            if (!interaction.memberPermissions.has(config.commands.requiredPermission)) return interaction.reply({ content: `You are missing the permission \`${config.commands.requiredPermission}\`!`, ephemeral: true })
            let args = interaction.options.getString('message');
            if (args === null) {
                customMessage = undefined;
                interaction.reply({ content: 'The status has been cleared!', ephemeral: true });
            } else {
                customMessage = args;
                interaction.reply({ content: 'The status has been changed!', ephemeral: true });
            }
            updateStatus();
        } 
    });
}

client.login(process.env.TOKEN).catch((error) => console.log(error));
