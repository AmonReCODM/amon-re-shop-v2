import time
from playwright.sync_api import sync_playwright, expect

def run_admin_verification(playwright):
    """
    Ce script vérifie uniquement le flux de connexion de l'administrateur
    et prend une capture d'écran du tableau de bord.
    """
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    BASE_URL = "http://localhost:5173"

    print("\n--- Démarrage de la vérification du tableau de bord administrateur ---")
    admin_email = "admin@amonre.dev"
    admin_password = "password123"

    try:
        page.goto(BASE_URL)

        # Aller à la page de connexion
        page.get_by_role("button", name="Accès Administrateur").click()

        # Attendre que la page de connexion soit visible
        expect(page.get_by_role("heading", name="Espace Client")).to_be_visible(timeout=10000)

        # Se connecter en tant qu'admin en utilisant les labels
        # CORRECTION: Utilisation de get_by_label pour une sélection robuste
        page.get_by_label("Email").fill(admin_email)
        page.get_by_label("Mot de passe").fill(admin_password)
        page.get_by_role("button", name="Se connecter").click()

        # Vérifier qu'on est sur le tableau de bord admin
        print("Connexion admin réussie, vérification du tableau de bord admin...")
        expect(page.get_by_role("heading", name="Tableau de Bord Administrateur")).to_be_visible(timeout=15000)

        # Attendre que la table des commandes soit visible (signe que les données sont chargées)
        expect(page.get_by_role("table")).to_be_visible(timeout=10000)

        # Prendre une capture d'écran du tableau de bord admin
        page.screenshot(path="jules-scratch/verification/admin_dashboard_final_check.png")
        print("Capture d'écran du tableau de bord admin prise avec succès.")

    except Exception as e:
        print(f"Erreur lors de la vérification du flux admin : {e}")
        page.screenshot(path="jules-scratch/verification/admin_flow_error.png")

    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_admin_verification(p)