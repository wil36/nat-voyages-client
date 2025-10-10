import React from "react";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

export default function Contact() {
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
                      Contactez-nous
                    </h3>
                    <div className="nk-block-des text-soft">
                      <p>N'hésitez pas à nous contacter pour toute question</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nk-block">
                <div className="row g-gs justify-content-center">
                  <div className="col-lg">
                    <div className="card">
                      <div className="card-inner">
                        <div className="card-head">
                          <h5 className="card-title">
                            Informations de contact
                          </h5>
                        </div>
                        <div className="row g-3">
                          {/* <div className="col-12">
                            <div className="contact-item">
                              <div className="contact-icon">
                                <em className="icon ni ni-map-pin"></em>
                              </div>
                              <div className="contact-text">
                                <h6>Adresse</h6>
                                <p>
                                  123 Rue de la Paix
                                  <br />
                                  75001 Paris, France
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="contact-item">
                              <div className="contact-icon">
                                <em className="icon ni ni-call"></em>
                              </div>
                              <div className="contact-text">
                                <h6>Téléphone</h6>
                                <p>+33 1 23 45 67 89</p>
                              </div>
                            </div>
                          </div> */}
                          <div className="col-12">
                            <div className="contact-item">
                              <div className="contact-icon">
                                <em className="icon ni ni-mail"></em>
                              </div>
                              <div className="contact-text">
                                <h6>Email</h6>
                                <p><a href="mailto:contact.natvoyage@gmail.com">contact.natvoyage@gmail.com</a></p>
                              </div>
                            </div>
                          </div>
                          {/* <div className="col-12">
                            <div className="contact-item">
                              <div className="contact-icon">
                                <em className="icon ni ni-clock"></em>
                              </div>
                              <div className="contact-text">
                                <h6>Horaires d'ouverture</h6>
                                <p>
                                  Lun - Ven: 9h00 - 18h00
                                  <br />
                                  Sam: 9h00 - 12h00
                                </p>
                              </div>
                            </div>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* <div className="card">
                      <div className="card-inner">
                        <div className="card-head">
                          <h5 className="card-title">Suivez-nous</h5>
                        </div>
                        <div className="d-flex ">
                          <ul className="social-list list-inline">
                            <li>
                              <a href="#" className="social-link">
                                <em className="icon ni ni-facebook-f"></em>
                              </a>
                            </li>
                            <li>
                              <a href="#" className="social-link">
                                <em className="icon ni ni-twitter"></em>
                              </a>
                            </li>
                            <li>
                              <a href="#" className="social-link">
                                <em className="icon ni ni-instagram"></em>
                              </a>
                            </li>
                            <li>
                              <a href="#" className="social-link">
                                <em className="icon ni ni-linkedin"></em>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <FooterComponent />
    </>
  );
}
