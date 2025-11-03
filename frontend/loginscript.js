localStorage.clear();

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const signupUsernameMessage = document.getElementById("signupUsernameMessage");
const signupPasswordMessage = document.getElementById("signupPasswordMessage");

const loginUsernameMessage = document.getElementById("loginUsernameMessage");
const loginPasswordMessage = document.getElementById("loginPasswordMessage");

const signupForm = document.querySelector(".sign-up-container form");
const loginForm = document.querySelector(".sign-in-container form");

// Check token and redirect if needed

// Toggle sign up / sign in panels
signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

//signup form

signupForm.addEventListener("submit" , async (e) =>{
    e.preventDefault();

    const username = signupForm.querySelectorAll("input")[0].value.trim();
    const password = signupForm.querySelectorAll("input")[1].value.trim();

    signupUsernameMessage.textContent = "";
    signupPasswordMessage.textContent = "";

    if (!username) {
        signupUsernameMessage.textContent = "Please enter a username";
        return;
    }
    if (!password) {
        signupPasswordMessage.textContent = "Please enter a password";
        return;
    }

    try{
        const res = await fetch("/auth/signup",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful! You can now log in.");
            container.classList.remove("right-panel-active");
            signupForm.reset();
        }else {
            if (data.message.includes("Username")) {
                signupUsernameMessage.textContent = data.message;
                signupUsernameMessage.style.color = "red";

            } else if (data.message.includes("Password")) {
                signupPasswordMessage.textContent = data.message;
                signupPasswordMessage.style.color = "red";

            } else {
                alert(data.message);
            }
        }

    }catch (err){
        console.error("Network error:", err);
        alert("Something went wrong. Please try again later.");
    }
})


//login form

loginForm.addEventListener("submit" , async (e) =>{
    e.preventDefault();

    const username = loginForm.querySelectorAll("input")[0].value.trim();
    const password = loginForm.querySelectorAll("input")[1].value.trim();

    loginUsernameMessage.textContent = "";
    loginPasswordMessage.textContent = "";

    if (!username) {
        loginUsernameMessage.textContent = "Please enter your username";
        return;
    }
    if (!password) {
        loginPasswordMessage.textContent = "Please enter your password";
        return;
    }

    try{
        const res = await fetch("/auth/login",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user.id);
            window.location.href = "index.html";

        }else {
            if (data.message.includes("Username")) {
                loginUsernameMessage.textContent = data.message;
                loginUsernameMessage.style.color = "red";

            } else if (data.message.includes("Password")) {
                loginPasswordMessage.textContent = data.message;
                loginPasswordMessage.style.color = "red";

            } else {
                alert(data.message);
            }
        }

    }catch (err){
        console.error("Network error:", err);
        alert("Something went wrong. Please try again later.");
    }

})