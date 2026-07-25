import { supabase, toast, currentUser } from "./supabase.js";

let mode = "signin"; // signin | signup | forgot

const $ = (id) => document.getElementById(id);

function applyMode() {
  const name = $("f-name"), pw = $("pw-wrap"), title = $("a-title"), sub = $("a-sub"),
    submit = $("btn-submit"), forgot = $("mode-forgot"), signup = $("mode-signup"),
    google = $("btn-google"), divider = google.nextElementSibling;

  name.classList.toggle("hidden", mode !== "signup");
  pw.classList.toggle("hidden", mode === "forgot");
  google.classList.toggle("hidden", mode === "forgot");
  divider.classList.toggle("hidden", mode === "forgot");

  if (mode === "signin") {
    title.textContent = "Welcome back";
    sub.textContent = "Sign in to continue.";
    submit.textContent = "Sign in →";
    forgot.textContent = "Forgot password?";
    signup.innerHTML = 'New here? <span class="font-semibold text-primary">Sign up</span>';
  } else if (mode === "signup") {
    title.textContent = "Create your account";
    sub.textContent = "Start building your home library.";
    submit.textContent = "Create account →";
    forgot.textContent = "";
    signup.innerHTML = 'Have an account? <span class="font-semibold text-primary">Sign in</span>';
  } else {
    title.textContent = "Reset password";
    sub.textContent = "We'll email you a reset link.";
    submit.textContent = "Send reset link →";
    forgot.textContent = "";
    signup.innerHTML = 'Back to <span class="font-semibold text-primary">Sign in</span>';
  }
}

$("mode-forgot").addEventListener("click", () => { mode = mode === "forgot" ? "signin" : "forgot"; applyMode(); });
$("mode-signup").addEventListener("click", () => {
  mode = mode === "signup" ? "signin" : (mode === "forgot" ? "signin" : "signup"); applyMode();
});

$("pw-toggle").addEventListener("click", () => {
  const inp = $("f-password");
  inp.type = inp.type === "password" ? "text" : "password";
});

$("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submit = $("btn-submit");
  submit.disabled = true;
  try {
    const email = $("f-email").value.trim();
    const password = $("f-password").value;
    const name = $("f-name").value.trim();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      if (error) throw error;
      toast("Check your email to confirm your account.", "success");
    } else if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast("Welcome back!", "success");
      location.href = "/";
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });
      if (error) throw error;
      toast("Password reset link sent.", "success");
    }
  } catch (err) {
    toast(err.message || "Something went wrong.", "error");
  } finally {
    submit.disabled = false;
  }
});

$("btn-google").addEventListener("click", async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  } catch (err) {
    toast(err.message || "Sign-in failed", "error");
  }
});

// Redirect signed-in users away
(async () => {
  const u = await currentUser();
  if (u) location.href = "/";
})();

applyMode();
