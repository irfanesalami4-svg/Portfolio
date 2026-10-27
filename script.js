/* ==========================================================================
   SCRIPT.JS – Portfolio d'Omo-Lara E. Irfane SALAMI
   Les projets ont maintenant leurs propres pages .html (projet-onduleur.html, etc.).
   Ce fichier ne fait donc plus que deux choses :
     1. Envoyer le formulaire de contact par e-mail (page d'accueil)
     2. Remplacer une photo absente par un cadre « Photo à ajouter » (pages projet)
   ========================================================================== */

'use strict';
// 'use strict' : active le mode strict de JavaScript. Il signale plus tôt certaines erreurs
// (par exemple l'utilisation d'une variable jamais déclarée).

const parId = (identifiant) => document.getElementById(identifiant);
// Fonction fléchée : (paramètre) => résultat.
// document.getElementById("x") cherche dans la page la balise qui a id="x" (null si elle n'existe pas).


/* ==========================================================================
   1. FORMULAIRE DE CONTACT
   Le site n'a pas de serveur : le bouton « Envoyer » ouvre l'application
   de messagerie de la personne avec le message déjà rédigé (lien mailto:).
   ========================================================================== */

const ADRESSE_ENVOI = "https://api.web3forms.com/submit"; // adresse du service qui reçoit le formulaire

function activerFormulaire() {
    const formulaire = parId("f");                // cherche <form id="f"> (présent seulement dans index.html)
    if (!formulaire) return;                      // absent (pages projet) → on arrête la fonction ici

    const bouton = formulaire.querySelector('button[type="submit"]'); // le bouton « Envoyer »
    const retour = parId("ok");                   // le paragraphe qui affiche le résultat (succès ou erreur)

    // Affiche un message sous le formulaire ; estErreur = true le colore en rose (erreur).
    const afficherMessage = (texte, estErreur) => {
        retour.textContent = texte;               // écrit le texte dans le paragraphe
        retour.classList.toggle("formulaire__confirmation--erreur", estErreur); // ajoute ou retire la classe d'erreur
        retour.style.display = "block";           // rend le paragraphe visible (caché par défaut dans le CSS)
    };

    formulaire.addEventListener("submit", async (evenement) => {
        // « quand le formulaire est envoyé, exécute cette fonction » ; async permet d'attendre la réponse (await)
        evenement.preventDefault();               // empêche le rechargement automatique de la page

        bouton.disabled = true;                   // désactive le bouton pour éviter les doubles envois
        bouton.textContent = "Envoi en cours…";   // informe la personne que l'envoi est en cours

        try {                                     // on tente l'envoi ; en cas de problème, on passe au bloc catch
            const donnees = Object.fromEntries(new FormData(formulaire));
            // FormData lit tous les champs (name, email, message, clé…) ; fromEntries en fait un objet simple

            const reponse = await fetch(ADRESSE_ENVOI, {   // fetch envoie la requête ; await attend la réponse
                method: "POST",                            // POST = envoi de données
                headers: {
                    "Content-Type": "application/json",    // on envoie les données au format JSON
                    "Accept": "application/json"           // on attend une réponse au format JSON
                },
                body: JSON.stringify(donnees)              // transforme l'objet en texte JSON
            });

            const resultat = await reponse.json();         // lit la réponse du service

            if (!resultat.success) {                       // le service signale un refus (clé invalide, spam…)
                throw new Error(resultat.message);         // on saute directement au bloc catch
            }

            afficherMessage("Merci ! Votre message a bien été envoyé.", false); // succès
            formulaire.reset();                            // vide les champs du formulaire
        } catch (erreur) {                                 // exécuté si une erreur s'est produite
            console.error("Envoi du formulaire impossible :", erreur); // trace visible dans la console du navigateur (F12)
            afficherMessage("L'envoi a échoué. Réessayez, ou écrivez directement par e-mail ou sur WhatsApp.", true);
        } finally {                                        // exécuté dans tous les cas, succès ou échec
            bouton.disabled = false;                       // réactive le bouton
            bouton.textContent = "Envoyer le message";     // remet le texte d'origine
        }
    });
}


/* ==========================================================================
   2. PHOTOS ABSENTES
   Tant que tu n'as pas déposé une photo dans le dossier images/,
   la page affiche un cadre en pointillés au lieu d'une image cassée.
   ========================================================================== */

// Remplace une image introuvable par un cadre « Photo à ajouter ».
function remplacerImageManquante(image) {
    const cadre = document.createElement("div");  // crée une nouvelle boîte <div> (pas encore dans la page)
    cadre.className = "galerie__vide";            // lui donne sa classe CSS (cadre en pointillés)
    cadre.textContent = `Photo à ajouter : ${image.getAttribute("src")}`; // texte indiquant le fichier attendu
    image.closest("a").replaceWith(cadre);        // closest("a") = le lien qui entoure l'image ; il est remplacé par le cadre
}

// Surveille toutes les images de la galerie.
function remplacerImagesManquantes() {
    document.querySelectorAll(".galerie__image").forEach((image) => {
        // querySelectorAll : trouve tous les éléments portant cette classe ; forEach : répète pour chacun
        if (image.complete && image.naturalWidth === 0) {
            remplacerImageManquante(image);       // chargement déjà en échec (fichier absent) → remplacement immédiat
        } else {
            image.addEventListener("error", () => remplacerImageManquante(image));
            // sinon : si le chargement échoue plus tard, on remplace à ce moment-là
        }
    });
}


/* ==========================================================================
   3. LANCEMENT
   Chaque fonction vérifie elle-même si les éléments dont elle a besoin
   existent : on peut donc toutes les appeler sur toutes les pages.
   ========================================================================== */

activerFormulaire();                              // active le formulaire (page d'accueil seulement)
remplacerImagesManquantes();                      // remplace les photos absentes (pages projet seulement)