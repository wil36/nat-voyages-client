import React from "react";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";
import { Link } from "react-router-dom";

export default function Aide() {
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
                      Aide & Support
                    </h3>
                    <div className="nk-block-des text-soft">
                      <p>Centre d'aide et documentation</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="nk-block">
                <div className="card">
                  <div id="faqs" className="accordion">
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head"
                        data-toggle="collapse"
                        data-target="#faq-q1"
                      >
                        <h6 className="title">What is DashLite?</h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse show"
                        id="faq-q1"
                        data-parent="#faqs"
                      >
                        <div className="accordion-inner">
                          <p>
                            An overview of <strong>DashLite</strong> – is fully
                            clean and premium designed admin template which
                            included beautiful hand-crafted components &amp;
                            elements. <strong>DashLite</strong> completely
                            focusing on <strong>conceptual base apps</strong> or
                            dashboard, as it’s equipped with pre-built screens
                            as well.
                          </p>
                          <p>
                            <strong>DashLite</strong> is powerful{" "}
                            <strong>admin dashboard</strong> template that
                            especially build for developers and programmers.{" "}
                            <strong>DashLite</strong> comes with all kind of
                            components, necessary elements and pre-build pages
                            including <strong>3 conceptual apps</strong> screen
                            that helps you to create your web apps or
                            application.{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* .accordion-item */}
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-q2"
                      >
                        <h6 className="title">
                          Do I need a Regular License or an Extended License?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-q2"
                        data-parent="#faqs"
                      >
                        <div className="accordion-inner">
                          <p>
                            If your <strong>end product</strong> including the
                            item is going to be free to the end user then a{" "}
                            <strong>Regular License</strong> is what you need.
                            An <strong>Extended License</strong> is required if
                            the <strong>end user</strong> must pay to use the{" "}
                            <strong>end product</strong>.
                          </p>
                          <p>
                            You may charge your client for your services to
                            create an end product, even under the{" "}
                            <strong>Regular License</strong>.{" "}
                            <strong>
                              But you can’t use one of our Standard Licenses on
                              multiple clients or jobs.
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* .accordion-item */}
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-q3"
                      >
                        <h6 className="title">What is Item Support?</h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-q3"
                        data-parent="#faqs"
                      >
                        <div className="accordion-inner">
                          <p>
                            We always provide{" "}
                            <strong>free support for first 6 months</strong>{" "}
                            from the purchase date. If you’re about to purchase
                            the item, you’ll have the option to purchase{" "}
                            <strong>extended item support</strong>, increasing
                            the item support period up to a{" "}
                            <strong>maximum of 12 months</strong> from the date
                            of purchase.
                          </p>
                          <p>
                            Yes, you can! If you have less than{" "}
                            <strong>6 months remaining</strong> on a support
                            item you’re eligible to renew your support.
                          </p>
                          <h6>What else is included?</h6>
                          <ul className="list list-sm list-checked">
                            <li>
                              Answering all questions including technical about
                              the item
                            </li>
                            <li>
                              Help with defects in the item or included
                              third-party assets
                            </li>
                            <li>
                              Item updates to ensure ongoing compatibility and
                              to resolve security vulnerabilities
                            </li>
                            <li>
                              Updates to ensure the item works as described and
                              is protected against major security concerns
                            </li>
                            <li>Included version updates for all items</li>
                          </ul>
                          <h6>What's not included in item support?</h6>
                          <ul className="list list-sm list-cross">
                            <li>Installation of the item</li>
                            <li>Hosting, server environment, or software</li>
                            <li>
                              Help from authors of included third-party assets
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* .accordion-item */}
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-q4"
                      >
                        <h6 className="title">How to download your Item</h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-q4"
                        data-parent="#faqs"
                      >
                        <div className="accordion-inner">
                          <p>
                            Item should be downloaded{" "}
                            <strong>immediately</strong> after{" "}
                            <strong>purchasing</strong>. You will get email with{" "}
                            <strong>download link</strong> from Envato once you
                            paid.
                          </p>
                          <h6>Also you can download your item:</h6>
                          <ul className="list list-sm">
                            <li>
                              Hover over your username and click '
                              <strong>Downloads'</strong> from the drop-down
                              menu.
                            </li>
                            <li>
                              The downloads section displays a list of all the
                              items purchased using your account.
                            </li>
                            <li>
                              Click the <strong>'Download'</strong> button next
                              to the item and select{" "}
                              <strong>‘Main File(s)’</strong> which contains all
                              files, or{" "}
                              <strong>
                                ‘Licence Certificate and Purchase Code’
                              </strong>{" "}
                              for the item licence information only.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* .accordion-item */}
                    <div className="accordion-item">
                      <a
                        href="#"
                        className="accordion-head collapsed"
                        data-toggle="collapse"
                        data-target="#faq-q5"
                      >
                        <h6 className="title">
                          How to contact before purchase?
                        </h6>
                        <span className="accordion-icon" />
                      </a>
                      <div
                        className="accordion-body collapse"
                        id="faq-q5"
                        data-parent="#faqs"
                      >
                        <div className="accordion-inner">
                          <p>
                            If you want to ask questions about our product, or
                            need help using our item you’ve purchased or just
                            want to tell us how much you love our work, that's
                            great!
                          </p>
                          <p>
                            Contact us via email{" "}
                            <a href="mailto:info@softnio.com">
                              info(at)softnio.com
                            </a>{" "}
                            or Post your comment (are visible to everyone) on
                            our item page after login into your account.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* .accordion-item */}
                  </div>
                  {/* .accordion */}
                </div>
                {/* .card */}
              </div>
              {/* .nk-block */}

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
