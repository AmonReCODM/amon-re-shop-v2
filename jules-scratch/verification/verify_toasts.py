import re
from playwright.sync_api import sync_playwright, expect
import random
import string
import time

def run(playwright):
    # Give the server time to start
    time.sleep(10)

    # Generate a unique email for the test run
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"almaric2013k+{random_suffix}@gmail.com"
    password = "password123"

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the app
        page.goto("http://localhost:3000")

        # 1. Navigate from Landing to Login page
        page.get_by_role("button", name="Login").click()

        # 2. On the login page, click sign up
        page.get_by_role("button", name="Sign Up").click()

        # 3. Fill out the sign-up form and submit
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill(password)
        page.get_by_role("button", name="Sign Up").click()

        # 4. Verify login toast and take screenshot
        login_toast = page.locator('[role="status"]', has_text="Connexion réussie ! Bienvenue !")
        expect(login_toast).to_be_visible(timeout=15000)
        page.screenshot(path="jules-scratch/verification/login-toast-verification.png")

        # 5. Verify the "Bienvenue" message is displayed
        expect(page.get_by_role("heading", name="Formulaire de Commande")).to_be_visible()

        # 6. Log out and verify logout toast
        page.get_by_role("button", name="Logout").click()

        logout_toast = page.locator('[role="status"]', has_text="Vous avez été déconnecté.")
        expect(logout_toast).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/logout-toast-verification.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Capture a final screenshot on error for debugging
        error_locator = page.locator("p.bg-red-100")
        if error_locator.is_visible():
            error_text = error_locator.inner_text()
            print(f"Found UI error message: '{error_text}'")
        page.screenshot(path="jules-scratch/verification/error.png")
        raise e

    finally:
        # Clean up
        browser.close()

with sync_playwright() as playwright:
    run(playwright)