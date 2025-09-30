import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    """
    Ce script vérifie les flux client et admin de l'application Amon Re Shop.
    """
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    BASE_URL = "http://localhost:5173"

    # --- Étape 1: Flux d'inscription du client ---
    print("--- Démarrage du flux d'inscription client ---")

    unique_email = f"testuser_{int(time.time())}@example.com"
    password = "password123"

    try:
        page.goto(BASE_URL)

        # Aller à la page de connexion
        page.get_by_role("button", name="Commander / Mon Compte").click()

        # Aller à la page d'inscription depuis la page de connexion
        page.get_by_text("Pas de compte ? S'inscrire").click()

        # Remplir le formulaire d'inscription
        # CORRECTION: Utiliser le bon titre de la page d'inscription
        expect(page.get_by_role("heading", name="Créer un compte")).to_be_visible()
        page.get_by_placeholder("Votre email").fill(unique_email)
        page.get_by_placeholder("Votre mot de passe").fill(password)
        page.get_by_role("button", name="S'inscrire").click()

        # Après l'inscription, on doit être sur la page de connexion
        print("Inscription réussie, redirection vers la connexion...")
        expect(page.get_by_role("heading", name="Espace Client")).to_be_visible(timeout=10000)

        # Se connecter avec le nouveau compte
        page.get_by_placeholder("Votre email").fill(unique_email)
        page.get_by_placeholder("Votre mot de passe").fill(password)
        page.get_by_role("button", name="Se connecter").click()

        # Vérifier qu'on est sur le tableau de bord client
        print("Connexion réussie, vérification du tableau de bord client...")
        expect(page.get_by_role("heading", name="Mon Espace Client")).to_be_visible(timeout=10000)
        expect(page.get_by_text(f"Bienvenue, {unique_email}")).to_be_visible()

        # Prendre une capture d'écran du tableau de bord client
        page.screenshot(path="jules-scratch/verification/client_dashboard.png")
        print("Capture d'écran du tableau de bord client prise.")

        # Se déconnecter
        page.get_by_role("button", name="Se Déconnecter").click()
        expect(page.get_by_role("heading", name="Amon Re Shop")).to_be_visible()
        print("Déconnexion client réussie.")

    except Exception as e:
        print(f"Erreur lors du flux client : {e}")
        page.screenshot(path="jules-scratch/verification/client_flow_error.png")

    # --- Étape 2: Flux de connexion de l'administrateur ---
    print("\n--- Démarrage du flux de connexion administrateur ---")
    admin_email = "admin@amonre.dev"
    admin_password = "password123"

    try:
        page.goto(BASE_URL)

        # Aller à la page de connexion
        page.get_by_role("button", name="Accès Administrateur").click()

        # Se connecter en tant qu'admin
        expect(page.get_by_role("heading", name="Espace Client")).to_be_visible()
        page.get_by_placeholder("Votre email").fill(admin_email)
        page.get_by_placeholder("Votre mot de passe").fill(admin_password)
        page.get_by_role("button", name="Se connecter").click()

        # Vérifier qu'on est sur le tableau de bord admin
        print("Connexion admin réussie, vérification du tableau de bord admin...")
        expect(page.get_by_role("heading", name="Tableau de Bord Administrateur")).to_be_visible(timeout=10000)
        expect(page.get_by_text(f"Connecté en tant que: {admin_email} (Admin)")).to_be_visible()

        # Attendre que la table des commandes soit visible
        expect(page.get_by_role("table")).to_be_visible(timeout=5000)

        # Prendre une capture d'écran du tableau de bord admin
        page.screenshot(path="jules-scratch/verification/admin_dashboard.png")
        print("Capture d'écran du tableau de bord admin prise.")

    except Exception as e:
        print(f"Erreur lors du flux admin : {e}")
        page.screenshot(path="jules-scratch/verification/admin_flow_error.png")

    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)