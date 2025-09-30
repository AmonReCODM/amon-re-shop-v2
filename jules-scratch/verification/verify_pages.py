import re
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    # Give the server time to start
    time.sleep(10)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the landing page
        print("Navigating to landing page...")
        page.goto("http://localhost:5173")
        expect(page.get_by_role("heading", name="Amon Re X Shop")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01-landing-page.png")
        print("Landing page verified.")

        # 2. Navigate to the login page
        print("Navigating to login page...")
        page.get_by_role("button", name="Commander / Mon Compte").click()
        expect(page.get_by_role("heading", name="Espace Client")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02-login-page.png")
        print("Login page verified.")

        # 3. Navigate to the sign-up page
        print("Navigating to sign-up page...")
        page.get_by_role("button", name="Pas de compte ? S'inscrire").click()
        expect(page.get_by_role("heading", name="Créer un compte")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03-signup-page.png")
        print("Sign-up page verified.")

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