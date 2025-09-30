import re
from playwright.sync_api import sync_playwright, expect
import random
import string

def run(playwright):
    # Generate a unique email for the test run
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"almaric2013k+{random_suffix}@gmail.com"
    password = "password123"

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Start at the home page, expect redirect to /login
        page.goto("http://localhost:3000")
        expect(page).to_have_url(re.compile(r".*/login"))
        print("Redirect to /login successful.")

        # Click sign up
        page.get_by_role("button", name="Sign Up").click()

        # Fill out the sign-up form and submit
        expect(page.get_by_role("heading", name="Créer un compte")).to_be_visible() # This seems to be missing in the new flow
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill(password)
        page.get_by_role("button", name="Sign Up").click()

        # After sign-up, user should be logged in and on the home page
        # Check for the login toast
        login_toast = page.locator('[role="status"]', has_text="Connexion réussie ! Bienvenue !")
        expect(login_toast).to_be_visible(timeout=15000) # Increased timeout
        print("Login toast verified.")
        page.screenshot(path="jules-scratch/verification/01-login-toast.png")

        # Verify that the order form is now visible
        expect(page.get_by_role("heading", name="Formulaire de Commande")).to_be_visible()
        print("Order form is visible.")
        page.screenshot(path="jules-scratch/verification/02-order-form.png")

        # Log out and verify the logout toast
        page.get_by_role("button", name="Logout").click()

        logout_toast = page.locator('[role="status"]', has_text="Vous avez été déconnecté.")
        expect(logout_toast).to_be_visible(timeout=10000)
        print("Logout toast verified.")
        page.screenshot(path="jules-scratch/verification/03-logout-toast.png")

        # Verify we are back on the login page
        expect(page).to_have_url(re.compile(r".*/login"))
        print("Redirect to /login after logout successful.")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        raise e

    finally:
        # Clean up
        browser.close()

with sync_playwright() as playwright:
    run(playwright)