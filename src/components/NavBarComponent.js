import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function NavBarComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleNavigate = () => {
    navigate("/profil-user");
  };

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: "none",
      color: isActive ? "#6576ff" : "inherit",
      padding: "8px 12px",
      fontSize: "14px",
      whiteSpace: "nowrap",
    };
  };

  return (
    <div
      className="nk-header nk-header-fixed is-light"
      style={{ position: "relative" }}
    >
      <div className="container">
        <div
          className="nk-header-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            minHeight: "60px",
          }}
        >
          <div className="nk-header-brand">
            <Link to="/" className="logo-link">
              <img
                className="logo-light logo-img"
                src={`${process.env.PUBLIC_URL}/assets/images/logoNat.png`}
                height={50}
                alt="logo"
              />
              <img
                className="logo-dark logo-img"
                src={`${process.env.PUBLIC_URL}/assets/images/logoNat.png`}
                alt="logo-dark"
              />
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="nk-header-menu ml-auto d-none d-md-block">
            <ul
              className="nk-menu nk-menu-main"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                margin: 0,
                padding: 0,
                listStyle: "none",
                flexWrap: "wrap",
              }}
            >
              <li className="nk-menu-item">
                <Link
                  to="/"
                  className="nk-menu-link"
                  style={getNavLinkStyle("/")}
                >
                  <span className="nk-menu-text">Accueil</span>
                </Link>
              </li>
              <li className="nk-menu-item">
                <Link
                  to="/conditions"
                  className="nk-menu-link"
                  style={getNavLinkStyle("/conditions")}
                >
                  <span className="nk-menu-text">Conditions</span>
                </Link>
              </li>
              <li className="nk-menu-item">
                <Link
                  to="/aide"
                  className="nk-menu-link"
                  style={getNavLinkStyle("/aide")}
                >
                  <span className="nk-menu-text">Aide</span>
                </Link>
              </li>
              <li className="nk-menu-item">
                <Link
                  to="/contact"
                  className="nk-menu-link"
                  style={getNavLinkStyle("/contact")}
                >
                  <span className="nk-menu-text">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Bouton menu mobile */}
          <div className="nk-header-toggle d-md-none">
            <button
              className="btn btn-icon btn-trigger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ border: "none", background: "transparent" }}
            >
              <em
                className={`icon ni ${
                  isMobileMenuOpen ? "ni-cross" : "ni-menu"
                }`}
              ></em>
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {isMobileMenuOpen && (
          <div
            className="nk-header-mobile-menu d-md-none"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              borderTop: "1px solid #e5e9f2",
              zIndex: 999,
              padding: "20px",
            }}
          >
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}>
                <Link
                  to="/"
                  className="nk-menu-link"
                  style={{
                    ...getNavLinkStyle("/"),
                    display: "block",
                    padding: "15px",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nk-menu-text">Accueil</span>
                </Link>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <Link
                  to="/conditions"
                  className="nk-menu-link"
                  style={{
                    ...getNavLinkStyle("/conditions"),
                    display: "block",
                    padding: "15px",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nk-menu-text">Conditions</span>
                </Link>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <Link
                  to="/aide"
                  className="nk-menu-link"
                  style={{
                    ...getNavLinkStyle("/aide"),
                    display: "block",
                    padding: "15px",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nk-menu-text">Aide</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="nk-menu-link"
                  style={{
                    ...getNavLinkStyle("/contact"),
                    display: "block",
                    padding: "15px",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nk-menu-text">Contact</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="dropdown user-dropdown">
                <a
                  href="#"
                  className="dropdown-toggle mr-n1"
                  data-toggle="dropdown"
                >
                  <div className="user-toggle">
                    <div className="user-avatar sm">
                      <em className="icon ni ni-user-alt" />
                    </div>
                    <div className="user-info d-none d-xl-block">
                      <div className="user-status user-status-unverified">
                        Unverified
                      </div>
                      <div className="user-name dropdown-indicator">
                        Abu Bin Ishityak
                      </div>
                    </div>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-md dropdown-menu-right">
                  <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
                    <div className="user-card">
                      <div className="user-avatar">
                        <span>AB</span>
                      </div>
                      <div className="user-info">
                        <span className="lead-text">Abu Bin Ishtiyak</span>
                        <span className="sub-text">info@softnio.com</span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-inner">
                    <ul className="link-list">
                      <li onClick={handleNavigate}>
                        <a href="#">
                          <em className="icon ni ni-user-alt" />
                          <span>View Profile</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown-inner">
                    <ul className="link-list">
                      <li onClick={handleLogout}>
                        <a href="#">
                          <em className="icon ni ni-signout" />
                          <span>Se deconnecter</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div> */}
      </div>
    </div>

    // <div className="header header-32 has-header-main-s1 bg-dark" id="home">
    //   <div className="header-main header-main-s1 is-sticky is-transparent on-dark">
    //     <div className="container header-container">
    //       <div className="header-wrap">
    //         <div className="header-logo">
    //           <a href="html/index.html" className="logo-link">
    //             <img
    //               className="logo-light logo-img"
    //               src="./images/logo.png"
    //               srcSet="./images/logo2x.png 2x"
    //               alt="logo"
    //             />
    //             <img
    //               className="logo-dark logo-img"
    //               src="./images/logo-dark.png"
    //               srcSet="./images/logo-dark2x.png 2x"
    //               alt="logo-dark"
    //             />
    //           </a>
    //         </div>
    //         <div className="header-toggle">
    //           <button className="menu-toggler" data-target="mainNav">
    //             <em className="menu-on icon ni ni-menu" />
    //             <em className="menu-off icon ni ni-cross" />
    //           </button>
    //         </div>
    //         {/* .header-nav-toggle */}
    //         <nav className="header-menu" data-content="mainNav">
    //           <ul className="menu-list ml-lg-auto">
    //             <li className="menu-item has-sub">
    //               <a href="#" className="menu-link menu-toggle">
    //                 Landing
    //               </a>
    //               <div className="menu-sub">
    //                 <ul className="menu-list">
    //                   <li className="menu-item">
    //                     <a href="html/index.html" className="menu-link">
    //                       Landing Page - v1
    //                     </a>
    //                   </li>
    //                   <li className="menu-item">
    //                     <a href="html/index-v2.html" className="menu-link">
    //                       Landing Page - v2
    //                     </a>
    //                   </li>
    //                   <li className="menu-item">
    //                     <a href="html/index-v3.html" className="menu-link">
    //                       Landing Page - v3
    //                     </a>
    //                   </li>
    //                   <li className="menu-item">
    //                     <a href="html/index-v4.html" className="menu-link">
    //                       Landing Page - v4
    //                     </a>
    //                   </li>
    //                   <li className="menu-item">
    //                     <a href="html/index-v5.html" className="menu-link">
    //                       Landing Page - v5
    //                     </a>
    //                   </li>
    //                   <li className="menu-item">
    //                     <a href="html/index-v6.html" className="menu-link">
    //                       Landing Page - v6
    //                     </a>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </li>
    //             <li className="menu-item has-sub">
    //               <a href="#" className="menu-link menu-toggle">
    //                 Pages
    //               </a>
    //               <div className="menu-sub">
    //                 <ul className="menu-list">
    //                   <li className="menu-item has-sub">
    //                     <a href="#" className="menu-link menu-toggle">
    //                       Auth Pages
    //                     </a>
    //                     <div className="menu-sub">
    //                       <ul className="menu-list">
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-login.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Login / Signin
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-login-v2.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Login / Signin v2
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-login-v3.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Login / Signin v3
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-register.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Register / Signup
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-register-v2.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Register / Signup v2
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-register-v3.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Register / Signup v3
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-reset.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Forgot Password
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-reset-v2.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Forgot Password v2
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/auths/auth-reset-v3.html"
    //                             className="menu-link"
    //                             target="_blank"
    //                           >
    //                             Forgot Password v3
    //                           </a>
    //                         </li>
    //                       </ul>
    //                     </div>
    //                   </li>
    //                   <li className="menu-item has-sub">
    //                     <a href="#" className="menu-link menu-toggle">
    //                       Error Pages
    //                     </a>
    //                     <div className="menu-sub">
    //                       <ul className="menu-list">
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/errors/404-classic.html"
    //                             target="_blank"
    //                             className="menu-link"
    //                           >
    //                             404 Classic
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/errors/404-modern.html"
    //                             target="_blank"
    //                             className="menu-link"
    //                           >
    //                             404 Modern
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/errors/504-classic.html"
    //                             target="_blank"
    //                             className="menu-link"
    //                           >
    //                             504 Classic
    //                           </a>
    //                         </li>
    //                         <li className="menu-item">
    //                           <a
    //                             href="html/pages/errors/504-modern.html"
    //                             target="_blank"
    //                             className="menu-link"
    //                           >
    //                             504 Modern
    //                           </a>
    //                         </li>
    //                       </ul>
    //                     </div>
    //                   </li>
    //                 </ul>
    //               </div>
    //             </li>
    //             <li className="menu-item">
    //               <a href="#home" className="menu-link nav-link">
    //                 Home
    //               </a>
    //             </li>
    //             <li className="menu-item">
    //               <a href="#feature" className="menu-link nav-link">
    //                 Features
    //               </a>
    //             </li>
    //             <li className="menu-item">
    //               <a href="#pricing" className="menu-link nav-link">
    //                 Pricing
    //               </a>
    //             </li>
    //             <li className="menu-item">
    //               <a href="#story" className="menu-link nav-link">
    //                 Story
    //               </a>
    //             </li>
    //           </ul>
    //           <ul className="menu-btns">
    //             <li>
    //               <a
    //                 href="https://1.envato.market/e0y3g"
    //                 target="_blank"
    //                 className="btn btn-primary btn-lg"
    //               >
    //                 Download App
    //               </a>
    //             </li>
    //           </ul>
    //         </nav>
    //         {/* .nk-nav-menu */}
    //       </div>
    //       {/* .header-warp*/}
    //     </div>
    //     {/* .container*/}
    //   </div>
    //   {/* .header-main*/}
    //   <div className="header-content py-6 is-dark mt-lg-n1 mt-n3">
    //     <div className="container">
    //       <div className="row flex-row-reverse justify-content-center text-center g-gs">
    //         <div className="col-lg-6 col-md-7">
    //           <div className="header-caption">
    //             <h1 className="header-title">
    //               Powelful Tool To Represent Your Dashboard.
    //             </h1>
    //             <p>
    //               A powerful admin dashboard template that especially build for
    //               developers and programmers. DashLite comes with all kind of
    //               components.
    //             </p>
    //             <ul className="header-action btns-inline py-3">
    //               <li>
    //                 <a href="#" className="btn btn-primary btn-lg">
    //                   <span>Get Started</span>
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="#" className="btn btn-danger btn-lg">
    //                   <span>View Demo</span>
    //                 </a>
    //               </li>
    //             </ul>
    //             {/* .header-action */}
    //             <ul className="header-icon list-inline pt-1">
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/javascript.png"
    //                   alt=""
    //                 />
    //               </li>
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/sass.png"
    //                   alt=""
    //                 />
    //               </li>
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/gulp.png"
    //                   alt=""
    //                 />
    //               </li>
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/bootstrap.png"
    //                   alt=""
    //                 />
    //               </li>
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/html5.png"
    //                   alt=""
    //                 />
    //               </li>
    //               <li>
    //                 <img
    //                   className="h-20px"
    //                   src="./images/icon/libs/css3.png"
    //                   alt=""
    //                 />
    //               </li>
    //             </ul>
    //           </div>
    //           {/* .header-caption */}
    //         </div>
    //         {/* .col */}
    //       </div>
    //       {/* .row */}
    //     </div>
    //     {/* .container */}
    //   </div>
    //   {/* .header-content */}
    // </div>
  );
}
