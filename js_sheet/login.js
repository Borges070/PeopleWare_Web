// Function to handle form submission
function handleLogin(event) {
    // Prevent the default form submission (which would reload the page)
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('message-box');

    // Clear previous classes
    messageBox.classList.remove('message-box-success', 'message-box-error', 'hidden');

        // Simple validation and success message
        if (email && password) {
            // In a real application, you would send this data to a server for authentication.
            const simulatedAuthToken = Math.random().toString(36).substring(2, 15);
            
            messageBox.innerHTML = `
                <p class="font-semibold">
                    Login successful!
                </p>
                <p class="text-sm mt-1">
                    E-mail: ${email}
                </p>
                <p class="text-sm">
                    Simulated Token: ${simulatedAuthToken}
                </p>
            `;
            messageBox.classList.add('message-box-success');
            window.location.href = "index.html"           

    if (email && password) {
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    messageBox.innerHTML = data.error;
                    messageBox.classList.add('message-box-error');
                } else {
                    messageBox.innerHTML = `
                    <p class="font-semibold">
                        Login successful!
                    </p>
                    <p class="text-sm mt-1">
                        Welcome, ${data.user.name}
                    </p>
                `;
                    messageBox.classList.add('message-box-success');
                    document.getElementById('login-form').reset();

                    // Store user info and redirect
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messageBox.innerHTML = 'Erro ao conectar com o servidor.';
                messageBox.classList.add('message-box-error');
            });

    } else {
        messageBox.innerHTML = 'Preencha todos os campos para continuar.';
        messageBox.classList.add('message-box-error');
    }

    // Auto-hide the message box after 5 seconds
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

// Attach the event listener when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
});
}
