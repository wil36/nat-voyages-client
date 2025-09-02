import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function NavBarComponent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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

  return (
    <div className="nk-header nk-header-fixed is-light">
      <div className="container">
        <div className="nk-header-wrap">
          <div className="nk-header-brand ">
            <a href="html/index.html" className="logo-link">
              <img
                className="logo-light logo-img"
                src={`${process.env.PUBLIC_URL}/assets/images/logo.png`}
                alt="logo"
              />
              <img
                className="logo-dark logo-img"
                src={`${process.env.PUBLIC_URL}/assets/images/logo-dark.png`}
                alt="logo-dark"
              />
            </a>
          </div>

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
    </div>
  );
}
