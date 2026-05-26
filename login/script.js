const login_btn = document.querySelector('.btn-login');

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('token');

    if (token) {
        window.location.href = '../';
        return;
    }

    // button click
    login_btn.addEventListener('click', handleLogin);

    // enter key
    document.getElementById('password').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

async function handleLogin() {

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const errorMsg = document.getElementById('errorMsg');
    const btn = document.querySelector('.btn-login');

    // validation
    if (!username || !password) {
        errorMsg.textContent = 'Please enter both username and password.';
        errorMsg.style.display = 'block';
        return;
    }

    btn.textContent = 'Signing in...';
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {

        const response = await fetch(
            `https://referencenumber.onrender.com/login`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passkey: password })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            errorMsg.textContent = data.error || 'Invalid username or password.';
            errorMsg.style.display = 'block';

            btn.textContent = 'Sign in';
            btn.disabled = false;
            return;
        }

        localStorage.setItem('token', data.token);

        window.location.href = '../';

    } catch (err) {

        console.error(err);

        errorMsg.textContent = 'Could not connect to server.';
        errorMsg.style.display = 'block';

        btn.textContent = 'Sign in';
        btn.disabled = false;
    }
}