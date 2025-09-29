import React from "react";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";
import { Link } from "react-router-dom";

export default function Aide() {
  return (
    <>
      <NavBarComponent />
      <div className="nk-content" style={{ paddingBottom: "80px" }}>
        <div className="container">
          <div className="nk-content-inner">
            <div className="nk-content-body">
              <div className="nk-block-head nk-block-head-sm">
                <div className="nk-block-between">
                  <div className="nk-block-head-content">
                    <h3 className="nk-block-title page-title">
                      Aide & Support
                    </h3>
                    <div className="nk-block-des text-soft">
                      <p>Centre d'aide et documentation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h4 className="card-title mb-4">Foire Aux Questions (FAQ) - Application NAT Voyage</h4>
                  </div>
                </div>
              </div> */}

              {/* Section 1: Généralités sur l'Application */}
              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h5 className="card-title">
                      1. Généralités sur l'Application
                    </h5>
                  </div>
                  <div id="faqs-section1" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head"
                        data-toggle="collapse"
                        data-target="#faq-s1-q1"
                      >
                        <h6 className="title">Qu'est-ce que NAT Voyage ?</h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse show"
                        id="faq-s1-q1"
                        data-parent="#faqs-section1"
                      >
                        <div className="accordion-inner">
                          <p>
                            NAT Voyage est une application mobile qui vous
                            permet d'acheter et de payer en ligne des tickets de
                            voyage pour le bus, le bateau, le train et l'avion,
                            auprès de différentes compagnies de transport
                            opérant au Gabon.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s1-q2"
                      >
                        <h6 className="title">
                          Doit-on créer un compte pour acheter un ticket ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s1-q2"
                        data-parent="#faqs-section1"
                      >
                        <div className="accordion-inner">
                          <p>
                            Non. Vous pouvez acheter vos tickets directement
                            dans l'application sans créer de compte. Cependant,
                            fournir votre email vous permet de recevoir le
                            ticket par courriel en plus de le voir à l'écran.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s1-q3"
                      >
                        <h6 className="title">
                          Quels types de transport puis-je réserver via NAT
                          Voyage ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s1-q3"
                        data-parent="#faqs-section1"
                      >
                        <div className="accordion-inner">
                          <p>
                            Nous proposons la réservation pour le transport
                            maritime (bateau), terrestre (bus, certaines
                            navettes), ferroviaire (train) et aérien (vols
                            intérieurs ou régionaux, selon les partenariats).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s1-q4"
                      >
                        <h6 className="title">
                          L'application NAT Voyage est-elle gratuite ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s1-q4"
                        data-parent="#faqs-section1"
                      >
                        <div className="accordion-inner">
                          <p>
                            Oui, l'application NAT Voyage est entièrement
                            gratuite à télécharger et à utiliser. Seuls les
                            frais de service sont ajoutés au prix du ticket lors
                            de l'achat.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s1-q5"
                      >
                        <h6 className="title">
                          Sur quelles plateformes l'application est-elle
                          disponible ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s1-q5"
                        data-parent="#faqs-section1"
                      >
                        <div className="accordion-inner">
                          <p>
                            L'application NAT Voyage est disponible sur Android
                            et iOS. Vous pouvez la télécharger gratuitement
                            depuis Google Play Store ou Apple App Store.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>

              {/* Section 2: Achat et Paiement */}
              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h5 className="card-title">2. Achat et Paiement</h5>
                  </div>
                  <div id="faqs-section2" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s2-q1"
                      >
                        <h6 className="title">
                          Comment acheter un ticket sur NAT Voyage ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s2-q1"
                        data-parent="#faqs-section2"
                      >
                        <div className="accordion-inner">
                          <ul className="list list-sm">
                            <li>
                              ➡️ Ouvrez l'application et sélectionnez votre
                              trajet (départ, destination, date, type de
                              transport).
                            </li>
                            <li>
                              ➡️ Choisissez l'heure et la compagnie de transport
                              souhaitée.
                            </li>
                            <li>
                              ➡️ Renseignez les informations du passager (nom,
                              contact) de manière exacte.
                            </li>
                            <li>➡️ Procédez au paiement sécurisé.</li>
                            <li>
                              ➡️ Votre ticket électronique (e-ticket) s'affiche
                              immédiatement.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s2-q2"
                      >
                        <h6 className="title">
                          Quels sont les moyens de paiement acceptés ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s2-q2"
                        data-parent="#faqs-section2"
                      >
                        <div className="accordion-inner">
                          <p>
                            Nous acceptons principalement le paiement sécurisé
                            via Airtel Money et d'autres solutions de paiement
                            mobile locales. Les cartes bancaires peuvent être
                            acceptées selon les options disponibles.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s2-q3"
                      >
                        <h6 className="title">
                          Le prix du ticket sur l'application est-il le même
                          qu'en agence ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s2-q3"
                        data-parent="#faqs-section2"
                      >
                        <div className="accordion-inner">
                          <p>
                            Le prix sur l'application inclut le prix de base du
                            ticket fixé par la compagnie de transport plus des
                            frais de service qui couvrent les coûts de la
                            transaction en ligne et de la plateforme NAT Voyage.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s2-q4"
                      >
                        <h6 className="title">
                          Que se passe-t-il si mon paiement échoue ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s2-q4"
                        data-parent="#faqs-section2"
                      >
                        <div className="accordion-inner">
                          <p>
                            Si votre paiement échoue, vérifiez que le solde de
                            votre compte Airtel Money ou bancaire est suffisant.
                            Si le problème persiste, contactez notre service
                            client avec l'heure de la tentative et le numéro
                            utilisé. Aucun ticket n'est émis tant que le
                            paiement n'est pas validé.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s2-q5"
                      >
                        <h6 className="title">
                          Puis-je acheter plusieurs tickets en une seule fois ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s2-q5"
                        data-parent="#faqs-section2"
                      >
                        <div className="accordion-inner">
                          <p>
                            Oui, vous pouvez acheter plusieurs tickets lors
                            d'une même transaction. Assurez-vous de renseigner
                            correctement les informations de chaque passager.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>

              {/* Section 3: Le Ticket et le Voyage */}
              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h5 className="card-title">3. Le Ticket et le Voyage</h5>
                  </div>
                  <div id="faqs-section3" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s3-q1"
                      >
                        <h6 className="title">
                          Comment et quand vais-je recevoir mon ticket ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s3-q1"
                        data-parent="#faqs-section3"
                      >
                        <div className="accordion-inner">
                          <p>
                            Votre ticket électronique (e-ticket) est généré et
                            affiché immédiatement à l'écran après la validation
                            du paiement. Vous pouvez le télécharger au format
                            PDF et/ou le recevoir par email si vous avez
                            renseigné cette information.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s3-q2"
                      >
                        <h6 className="title">
                          Que dois-je présenter le jour du voyage ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s3-q2"
                        data-parent="#faqs-section3"
                      >
                        <div className="accordion-inner">
                          <p>
                            Vous devez présenter votre e-ticket (sur votre
                            téléphone ou imprimé) ainsi qu'une pièce d'identité
                            valide (CNI, Passeport, etc.) au comptoir de la
                            compagnie de transport.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s3-q3"
                      >
                        <h6 className="title">
                          Que dois-je faire en cas de retard, d'annulation ou de
                          changement d'horaire ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s3-q3"
                        data-parent="#faqs-section3"
                      >
                        <div className="accordion-inner">
                          <p>
                            NAT Voyage est un intermédiaire. En cas de problème
                            lié au trajet (retard, annulation), vous devez
                            contacter directement l'agence de transport
                            concernée. Leurs conditions générales s'appliquent.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s3-q4"
                      >
                        <h6 className="title">
                          Mon ticket est-il transférable à une autre personne ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s3-q4"
                        data-parent="#faqs-section3"
                      >
                        <div className="accordion-inner">
                          <p>
                            Non, les tickets sont nominatifs et non
                            transférables. Le nom sur le ticket doit
                            correspondre exactement à celui de la pièce
                            d'identité présentée le jour du voyage.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>

              {/* Section 4: Annulation, Modification et Remboursement */}
              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h5 className="card-title">
                      4. Annulation, Modification et Remboursement
                    </h5>
                  </div>
                  <div id="faqs-section4" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s4-q1"
                      >
                        <h6 className="title">
                          Puis-je modifier mon ticket après l'achat ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s4-q1"
                        data-parent="#faqs-section4"
                      >
                        <div className="accordion-inner">
                          <p>
                            Toute modification (date, heure) dépend des règles
                            de l'agence de transport choisie. Vous devez la
                            contacter pour savoir si une modification est
                            possible et si des frais s'appliquent.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s4-q2"
                      >
                        <h6 className="title">
                          Puis-je annuler mon ticket et être remboursé ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s4-q2"
                        data-parent="#faqs-section4"
                      >
                        <div className="accordion-inner">
                          <p>
                            La possibilité d'annulation et le montant du
                            remboursement sont définis par la politique de
                            l'agence de transport.
                          </p>
                          <p>
                            <strong>Attention :</strong> Les frais de service
                            perçus par NAT Voyage lors de l'achat en ligne ne
                            sont <strong>JAMAIS remboursables</strong>, même si
                            l'agence de transport accepte l'annulation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s4-q3"
                      >
                        <h6 className="title">
                          Combien de temps avant le départ puis-je annuler ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s4-q3"
                        data-parent="#faqs-section4"
                      >
                        <div className="accordion-inner">
                          <p>
                            Les délais d'annulation varient selon chaque
                            compagnie de transport. Consultez directement leur
                            politique ou contactez-les pour connaître les
                            conditions spécifiques à votre réservation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>

              {/* Section 5: Support et Assistance */}
              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <h5 className="card-title">5. Support et Assistance</h5>
                  </div>
                  <div id="faqs-section5" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s5-q1"
                      >
                        <h6 className="title">
                          Comment contacter le service client NAT Voyage ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s5-q1"
                        data-parent="#faqs-section5"
                      >
                        <div className="accordion-inner">
                          <p>
                            Vous pouvez nous contacter via la section "Contact"
                            de l'application, par email ou par téléphone. Nos
                            coordonnées sont disponibles dans la section contact
                            de l'application.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s5-q2"
                      >
                        <h6 className="title">
                          Que faire si j'ai perdu mon ticket électronique ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s5-q2"
                        data-parent="#faqs-section5"
                      >
                        <div className="accordion-inner">
                          <p>
                            Si vous avez fourni votre email lors de l'achat,
                            vérifiez votre boîte de réception. Sinon, contactez
                            notre service client avec les détails de votre
                            transaction (heure, montant, numéro de téléphone
                            utilisé) pour récupérer votre ticket.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-s5-q3"
                      >
                        <h6 className="title">
                          L'application fonctionne-t-elle sans connexion
                          internet ?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-s5-q3"
                        data-parent="#faqs-section5"
                      >
                        <div className="accordion-inner">
                          <p>
                            Une connexion internet est nécessaire pour effectuer
                            des recherches et acheter des tickets. Cependant,
                            une fois téléchargé, votre ticket peut être consulté
                            hors ligne.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>

              <div className="nk-block">
                <div className="card">
                  <div className="card-inner">
                    <div className="align-center flex-wrap flex-md-nowrap g-4">
                      <div className="nk-block-image w-120px flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 120 118"
                        >
                          <path
                            d="M8.916,94.745C-.318,79.153-2.164,58.569,2.382,40.578,7.155,21.69,19.045,9.451,35.162,4.32,46.609.676,58.716.331,70.456,1.845,84.683,3.68,99.57,8.694,108.892,21.408c10.03,13.679,12.071,34.71,10.747,52.054-1.173,15.359-7.441,27.489-19.231,34.494-10.689,6.351-22.92,8.733-34.715,10.331-16.181,2.192-34.195-.336-47.6-12.281A47.243,47.243,0,0,1,8.916,94.745Z"
                            transform="translate(0 -1)"
                            fill="#f6faff"
                          />
                          <rect
                            x={18}
                            y={32}
                            width={84}
                            height={50}
                            rx={4}
                            ry={4}
                            fill="#fff"
                          />
                          <rect
                            x={26}
                            y={44}
                            width={20}
                            height={12}
                            rx={1}
                            ry={1}
                            fill="#e5effe"
                          />
                          <rect
                            x={50}
                            y={44}
                            width={20}
                            height={12}
                            rx={1}
                            ry={1}
                            fill="#e5effe"
                          />
                          <rect
                            x={74}
                            y={44}
                            width={20}
                            height={12}
                            rx={1}
                            ry={1}
                            fill="#e5effe"
                          />
                          <rect
                            x={38}
                            y={60}
                            width={20}
                            height={12}
                            rx={1}
                            ry={1}
                            fill="#e5effe"
                          />
                          <rect
                            x={62}
                            y={60}
                            width={20}
                            height={12}
                            rx={1}
                            ry={1}
                            fill="#e5effe"
                          />
                          <path
                            d="M98,32H22a5.006,5.006,0,0,0-5,5V79a5.006,5.006,0,0,0,5,5H52v8H45a2,2,0,0,0-2,2v4a2,2,0,0,0,2,2H73a2,2,0,0,0,2-2V94a2,2,0,0,0-2-2H66V84H98a5.006,5.006,0,0,0,5-5V37A5.006,5.006,0,0,0,98,32ZM73,94v4H45V94Zm-9-2H54V84H64Zm37-13a3,3,0,0,1-3,3H22a3,3,0,0,1-3-3V37a3,3,0,0,1,3-3H98a3,3,0,0,1,3,3Z"
                            transform="translate(0 -1)"
                            fill="#798bff"
                          />
                          <path
                            d="M61.444,41H40.111L33,48.143V19.7A3.632,3.632,0,0,1,36.556,16H61.444A3.632,3.632,0,0,1,65,19.7V37.3A3.632,3.632,0,0,1,61.444,41Z"
                            transform="translate(0 -1)"
                            fill="#6576ff"
                          />
                          <path
                            d="M61.444,41H40.111L33,48.143V19.7A3.632,3.632,0,0,1,36.556,16H61.444A3.632,3.632,0,0,1,65,19.7V37.3A3.632,3.632,0,0,1,61.444,41Z"
                            transform="translate(0 -1)"
                            fill="none"
                            stroke="#6576ff"
                            strokeMiterlimit={10}
                            strokeWidth={2}
                          />
                          <line
                            x1={40}
                            y1={22}
                            x2={57}
                            y2={22}
                            fill="none"
                            stroke="#fffffe"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                          <line
                            x1={40}
                            y1={27}
                            x2={57}
                            y2={27}
                            fill="none"
                            stroke="#fffffe"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                          <line
                            x1={40}
                            y1={32}
                            x2={50}
                            y2={32}
                            fill="none"
                            stroke="#fffffe"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                          <line
                            x1="30.5"
                            y1="87.5"
                            x2="30.5"
                            y2="91.5"
                            fill="none"
                            stroke="#9cabff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="28.5"
                            y1="89.5"
                            x2="32.5"
                            y2="89.5"
                            fill="none"
                            stroke="#9cabff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="79.5"
                            y1="22.5"
                            x2="79.5"
                            y2="26.5"
                            fill="none"
                            stroke="#9cabff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="77.5"
                            y1="24.5"
                            x2="81.5"
                            y2="24.5"
                            fill="none"
                            stroke="#9cabff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="90.5"
                            cy="97.5"
                            r={3}
                            fill="none"
                            stroke="#9cabff"
                            strokeMiterlimit={10}
                          />
                          <circle
                            cx={24}
                            cy={23}
                            r="2.5"
                            fill="none"
                            stroke="#9cabff"
                            strokeMiterlimit={10}
                          />
                        </svg>
                      </div>
                      <div className="nk-block-content">
                        <div className="nk-block-content-head px-lg-4">
                          <h5>Nous sommes là pour vous aider !</h5>
                          <p className="text-soft">
                            Demandez une question, déposez un ticket de support,
                            gérez votre demande ou signalez un problème. Notre
                            équipe de support vous répondra par courriel.
                          </p>
                        </div>
                      </div>
                      <div className="nk-block-content flex-shrink-0">
                        <Link
                          to="/contact"
                          className="btn btn-lg btn-outline-primary"
                        >
                          Obtenir de l'aide maintenant
                        </Link>
                      </div>
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
