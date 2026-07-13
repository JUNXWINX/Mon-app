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

// Simuler la saisie d'email et le passage d'écran
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
                button.click();
            }
        }
    });
});

// Validation email simple
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validation mot de passe
function validatePassword(password) {
    return password.length >= 6;
}