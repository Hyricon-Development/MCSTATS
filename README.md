# MCSTATS









**VPS INSTALLATION**
`git clone https://github.com/Evolution-Development/MCSTATS.git`
<br>
`cd MCSTATS`
<br>
EDIT `config.json` And Create `.env` file 

<hr>

Use This Config In
**.env** file

```
TOKEN=BOT_TOKEN
IP=SERVER_IP_DO_NOT_USE_LOCALHOST
PORT=SERVER_PORT_DEFAULT_TO_25565_IF_LEFT_BLANK
CHANNELID=CHANNEL_ID
MESSAGEID=MASSAGE_ID
```
<hr>

**Installation:**
Run npm i if you havent already.
Rename .env.sample to .env
Rename config.json.sample to config.json
Edit the config.json file to your liking (I recommend setting this up fully before you start the bot to minimise errors)
Fill in the Discord bot's Token, Server IP, Port, Display IP and the channel where you want the message embed to go in the .env file.
Start the bot using node .
Stop the bot once the message has been sent.
Copy the message ID and paste it into the .env file.
Start the bot again.


**TO START THE BOT**
1. Run `node .`
2. Run `node index.js`
