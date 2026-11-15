import { supabase } from "./supabase.js";

// Login Form
const loginForm = document.getElementById("login-form");

const loginMessage = document.getElementById("login-message");

// Login
loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";

    try {

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        loginMessage.textContent = "Login successful!";

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        loginMessage.textContent = "Invalid email or password.";

    }

});