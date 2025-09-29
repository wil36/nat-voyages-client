import React from "react";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

export default function Conditions() {
  return (
    <>
      <NavBarComponent />
      <div className="nk-content" style={{paddingBottom: '80px'}}>
        <div className="container">
          <div className="nk-content-inner">
            <div className="nk-content-body">
              <div className="nk-block-head nk-block-head-sm">
                <div className="nk-block-between">
                  <div className="nk-block-head-content">
                    <h3 className="nk-block-title page-title">
                      Conditions Générales
                    </h3>
                    <div className="nk-block-des text-soft">
                      <p>Conditions d'utilisation de nos services</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nk-block">
                <div className="card">
                  <div className="card-inner card-inner-xl">
                    <div className="entry">
                      <p>
                        Bienvenue sur NAT Voyage, votre application mobile de réservation et de paiement de tickets de voyage (bus, bateau, train et avion) au Gabon.
                        En utilisant cette application, vous acceptez les termes suivants.
                      </p>

                      <h4>1. Objet de l'Application et des CGU</h4>
                      <p>
                        NAT Voyage est une plateforme mobile éditée par l'agence NAT Voyage. Elle vous permet de réserver et payer des tickets de voyage auprès de différentes compagnies de transport opérant au Gabon. Ces CGU définissent les règles d'utilisation de l'Application entre vous (l'utilisateur) et NAT Voyage.
                      </p>

                      <h4>2. Propriété et Contenu</h4>
                      <p>
                        L'application NAT Voyage, son logo et son contenu (textes, images) sont la propriété de l'agence NAT Voyage. Vous disposez d'un droit d'usage limité à la réservation de tickets.
                      </p>
                      <p>
                        Vous êtes seul responsable de l'exactitude des informations (identité, dates, contact, etc.) que vous saisissez. Toute information fausse ou inappropriée pourra entraîner l'annulation de la réservation.
                      </p>

                      <h4>3. Utilisation, Achat et Paiement</h4>
                      
                      <h5><strong>Achat</strong></h5>
                      <p>
                        L'achat se fait directement sur l'application, sans nécessiter de compte utilisateur. Vous sélectionnez votre trajet (date, heure, destination, transporteur) et confirmez les détails.
                      </p>

                      <h5><strong>Paiement Sécurisé</strong></h5>
                      <p>
                        Le paiement de votre ticket se fait de manière sécurisée via Airtel Money ou tout autre moyen de paiement mobile ou bancaire proposé. Le prix affiché inclut les frais de service de NAT Voyage.
                      </p>

                      <h5><strong>Confirmation</strong></h5>
                      <p>
                        Une fois le paiement validé, votre ticket électronique (e-ticket) vous est délivré immédiatement dans l'application et par email (si fourni). Ce ticket est votre preuve d'achat et doit être présenté au transporteur.
                      </p>

                      <h5><strong>Interdictions</strong></h5>
                      <p>
                        Il est strictement interdit de tenter de modifier, pirater ou utiliser l'application pour des usages illégaux ou non autorisés.
                      </p>

                      <h4>4. Modification, Annulation et Remboursement</h4>
                      
                      <h5><strong>Conditions du Trajet</strong></h5>
                      <p>
                        NAT Voyage n'est qu'un intermédiaire. Les conditions de voyage (retards, annulations, taille des bagages, modification de l'heure) sont définies uniquement par l'agence de transport choisie (bus, bateau, train, avion).
                      </p>

                      <h5><strong>Modification/Annulation</strong></h5>
                      <p>
                        Toute demande de modification ou d'annulation doit être adressée directement à l'agence de transport concernée, conformément à leur politique.
                      </p>

                      <h5><strong>Frais de Service</strong></h5>
                      <p>
                        Les frais de service de NAT Voyage facturés lors de l'achat en ligne ne sont jamais remboursables, même en cas d'annulation.
                      </p>

                      <h4>5. Responsabilité et Garanties</h4>
                      
                      <h5><strong>Limite de Responsabilité</strong></h5>
                      <p>
                        NAT Voyage n'est pas responsable des incidents, accidents, retards, annulations ou tout désagrément survenant pendant le trajet. Notre rôle se limite à garantir l'achat et la validité de votre ticket.
                      </p>

                      <h5><strong>Garantie de Service</strong></h5>
                      <p>
                        L'application est fournie "telle quelle". En cas de problème technique (paiement non validé, ticket non reçu), nous nous engageons à mettre en œuvre tous les moyens raisonnables pour résoudre la situation (assistance par téléphone/email) dans les meilleurs délais.
                      </p>

                      <h4>6. Droit Applicable et Acceptation</h4>
                      
                      <h5><strong>Droit applicable</strong></h5>
                      <p>
                        Ces CGU sont régies par les lois de la République Gabonaise. Tout litige sera porté devant les tribunaux compétents du Gabon.
                      </p>

                      <h5><strong>Accord Intégral</strong></h5>
                      <p>
                        Ces CGU constituent l'accord complet entre vous et NAT Voyage concernant l'utilisation de l'application.
                      </p>

                      <h5><strong>Évolutions</strong></h5>
                      <p>
                        NAT Voyage peut modifier ces CGU à tout moment. La version la plus récente est toujours celle disponible dans l'application. En continuant à utiliser le service après la modification, vous acceptez les nouvelles conditions.
                      </p>
                    </div>
                  </div>
                  {/* .card-inner */}
                </div>
                {/* .card */}
              </div>
              {/* .nk-block */}
            </div>
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  );
}
