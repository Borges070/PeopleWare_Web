const form = document.getElementById('registrationForm');
        const messageBox = document.getElementById('messageBox');
        const universitySelect = document.getElementById('universidade');
        
        // Function to display messages in the custom box
        function showMessage(message, isError = false) {
            messageBox.textContent = message;
            messageBox.classList.remove('hidden', 'error-message', 'success-message');

            if (isError) {
                messageBox.classList.add('error-message');
            } else {
                messageBox.classList.add('success-message');
            }
        }

        // Event listener for form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            messageBox.classList.add('hidden'); // Clear previous messages

            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;
            
            // Basic Form Validation: Check if University is selected
            if (universitySelect.value === "") {
                showMessage('Por favor, selecione sua universidade.', true);
                return;
            }

            // Basic Form Validation: Check if passwords match
            if (senha !== confirmarSenha) {
                showMessage('As senhas não coincidem. Por favor, tente novamente.', true);
                return;
            }

            // Basic Form Validation: Check password length
            if (senha.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', true);
                return;
            }
            
            // If all checks pass, simulate successful submission
            showMessage('Cadastro realizado com sucesso! (Funcionalidade de API desativada)', false);
            
            // Data would typically be sent to a server here...
            
            form.reset(); // Optionally reset the form after success
        });

        // Set the default text color for the select element until a choice is made
        universitySelect.addEventListener('change', function() {
            if (this.value === "") {
                this.classList.add('placeholder-text');
            } else {
                this.classList.remove('placeholder-text');
            }
        });
        
        // Initial check to ensure placeholder color is applied on load
        if (universitySelect.value === "") {
            universitySelect.classList.add('placeholder-text');
        }
