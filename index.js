const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Groq } = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

// === Environment Variables ===
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

if (!supabaseUrl || !supabaseKey || !groqApiKey) {
    console.error("❌ Please set SUPABASE_URL, SUPABASE_KEY, and GROQ_API_KEY in environment variables.");
    process.exit(1);
}

// === Supabase Setup ===
const supabase = createClient(supabaseUrl, supabaseKey);

// === Groq Client Setup ===
const groq = new Groq({ apiKey: groqApiKey });

// === WhatsApp Client ===
// Ensure session directory exists before creating client
const fs = require('fs');
const path = require('path');

const sessionDataPath = process.env.SESSION_DATA_PATH || "./sessions/";
const sessionPath = path.join(sessionDataPath, 'session-soulmate-bot');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDataPath)) {
    try {
        fs.mkdirSync(sessionDataPath, { recursive: true, mode: 0o777 });
        console.log(`✅ Created session data directory: ${sessionDataPath}`);
    } catch (err) {
        console.log(`⚠️ Could not create session data directory: ${err.message}`);
    }
}

if (!fs.existsSync(sessionPath)) {
    try {
        fs.mkdirSync(sessionPath, { recursive: true, mode: 0o777 });
        console.log(`✅ Created session directory: ${sessionPath}`);
    } catch (err) {
        console.log(`⚠️ Could not create session directory: ${err.message}`);
    }
}

const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
    },
    authStrategy: new LocalAuth({ 
        clientId: "soulmate-bot",
        dataPath: sessionDataPath
    })
});

// === Generate QR for first-time login ===
client.on('qr', qr => {
    console.log("=========================================");
    console.log("SCAN THE QR CODE BELOW TO LOGIN TO WHATSAPP:");
    console.log("=========================================");
    qrcode.generate(qr, { small: true });
    console.log("=========================================");
    console.log("QR CODE END");
    console.log("=========================================");
    
    // Also save QR code to a file for web access
    const fs = require('fs');
    const qrFile = './qr.txt';
    fs.writeFileSync(qrFile, qr);
    console.log(`QR code also saved to ${qrFile}`);
});

// === Ready Event ===
client.on('ready', () => {
    console.log("=========================================");
    console.log("✅ Soulmate Bot is now connected to WhatsApp!");
    console.log("=========================================");
});

// === Authentication Error ===
client.on('auth_failure', msg => {
    console.log("=========================================");
    console.log("❌ AUTHENTICATION FAILURE:", msg);
    console.log("=========================================");
});

// === Client Error ===
client.on('error', error => {
    console.log("=========================================");
    console.log("❌ CLIENT ERROR:", error.message);
    console.log("=========================================");
});

// === Character Prompts ===
const characterPrompts = {
    father: "You are a father. Speak warmly, give advice, ask about studies/health. Be caring but sometimes strict. Keep answers short and natural.",
    mother: "You are a mother. Speak with love and emotion. Always ask about food, health, and feelings. Be gentle, supportive, and encouraging.",
    girlfriend: "You are a girlfriend. Be caring, playful, flirty, and supportive. Speak casually, ask about the day, and use emojis naturally."
};

// === Supabase Helpers ===
async function getUser(phone) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();
    if (error) return null;
    return data;
}

async function addUser(phone) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ phone, conversation: [] }]);
    if (error) console.log("Supabase Insert Error:", error);
    return data;
}

async function updateUser(phone, field, value) {
    const { error } = await supabase
        .from('users')
        .update({ [field]: value })
        .eq('phone', phone);
    if (error) console.log("Supabase Update Error:", error);
}

async function addMessage(phone, role, content) {
    const user = await getUser(phone);
    if (!user) return;
    const conv = user.conversation || [];
    conv.push({ role, content });
    await updateUser(phone, 'conversation', conv);
}

// === Main Message Handler ===
client.on('message', async msg => {
    const from = msg.from;
    const text = msg.body.toLowerCase();

    if (msg.fromMe || msg.notifyName) return;

    let user = await getUser(from);

    if (!user) {
        await addUser(from);
        user = await getUser(from);
    }

    const step = user.step || "start";

    // Switch Character
    if (text === "/switch") {
        await updateUser(from, 'step', 'choose_character');
        return msg.reply("Who do you want to chat with now?\nType: father 👨, mother 👩, or girlfriend ❤️");
    }

    // Conversation flow
    if (step === "start") {
        if (text === "hi") {
            await updateUser(from, 'step', 'choose_character');
            return msg.reply("Hello 😊 Who do you want to chat with?\nType: father 👨, mother 👩, or girlfriend ❤️");
        } else {
            return;
        }
    }

    if (step === "choose_character") {
        if (text.includes("father") || text.includes("mother") || text.includes("girlfriend")) {
            await updateUser(from, 'character', text);
            await updateUser(from, 'step', 'ask_age');
            return msg.reply("Okay 👍 Tell me your age?");
        } else {
            return msg.reply("Please choose: father 👨, mother 👩, or girlfriend ❤️");
        }
    }

    if (step === "ask_age") {
        await updateUser(from, 'age', msg.body);
        await updateUser(from, 'step', 'ask_status');
        return msg.reply("Good. Are you in school, college, or working?");
    }

    if (step === "ask_status") {
        await updateUser(from, 'status', msg.body);
        await updateUser(from, 'step', 'chat');
        return msg.reply(`Great! I’ll remember you are ${msg.body} and let's start our chat 😊`);
    }

    // Chat Mode
    if (step === "chat") {
        try {
            const chatCompletion = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: `${characterPrompts[user.character]} The person is ${user.age} years old and is in ${user.status}.`
                    },
                    { role: "user", content: msg.body }
                ],
                temperature: 1,
                max_completion_tokens: 8192,
                top_p: 1,
                stream: false,
                reasoning_effort: "medium",
            });

            const reply = chatCompletion.choices[0]?.message?.content || "I’m not able to reply right now, beta.";
            await addMessage(from, 'user', msg.body);
            await addMessage(from, 'assistant', reply);

            msg.reply(reply);

        } catch (err) {
            console.error("❌ AI Error:", err);
            msg.reply("I’m not able to reply right now, beta.");
        }
    }
});

// Log startup
console.log("=========================================");
console.log("🚀 Starting Soulmate Bot...");
console.log("=========================================");

// Add error handling for client initialization
client.on('error', error => {
    console.log("=========================================");
    console.log("❌ CLIENT ERROR:", error.message);
    console.log("Error details:", error);
    console.log("=========================================");
});

// Start Client
try {
    client.initialize();
} catch (error) {
    console.log("=========================================");
    console.log("❌ CLIENT INITIALIZATION ERROR:", error.message);
    console.log("Error details:", error);
    console.log("=========================================");
}
