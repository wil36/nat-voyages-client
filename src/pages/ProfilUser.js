import { useNavigate } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";

export default function ProfilUser() {
  const navigate = useNavigate();
  const handleBackNavigation = () => {
    navigate("/");
  };
  return (
    <div className="nk-body bg-lighter npc-default has-sidebar ">
      <div className="nk-app-root">
        {/* main @s */}
        <div className="nk-main ">
          {/* wrap @s */}
          <div className="nk-wrap ">
            <NavBarComponent />
            {/* content @s */}
            <div className="nk-content ">
              <div className="container">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    <div className="nk-block">
                      <div className="row g-gs">
                        <div
                          className="nk-block-head-content"
                          onClick={handleBackNavigation}
                        >
                          <a
                            href="#"
                            className="btn btn-outline-light bg-white d-none d-sm-inline-flex"
                          >
                            <em className="icon ni ni-arrow-left" />
                            <span>Retour</span>
                          </a>
                          <a
                            href="#"
                            className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                          >
                            <em className="icon ni ni-arrow-left" />
                          </a>
                        </div>
                      </div>
                      <div className="card mt-3">
                        <div className="card-aside-wrap">
                          <div className="card-inner card-inner-lg">
                            <div className="nk-block-head nk-block-head-lg">
                              <div className="nk-block-between">
                                <div className="nk-block-head-content">
                                  <h4 className="nk-block-title">
                                    Personal Information
                                  </h4>
                                  <div className="nk-block-des">
                                    <p>
                                      Basic info, like your name and address,
                                      that you use on Nio Platform.
                                    </p>
                                  </div>
                                </div>
                                <div className="nk-block-head-content align-self-start d-lg-none">
                                  <a
                                    href="#"
                                    className="toggle btn btn-icon btn-trigger mt-n1"
                                    data-target="userAside"
                                  >
                                    <em className="icon ni ni-menu-alt-r" />
                                  </a>
                                </div>
                              </div>
                            </div>
                            {/* .nk-block-head */}
                            <div className="nk-block">
                              <div className="nk-data data-list">
                                <div className="data-head">
                                  <h6 className="overline-title">Basics</h6>
                                </div>
                                <div
                                  className="data-item"
                                  data-toggle="modal"
                                  data-target="#profile-edit"
                                >
                                  <div className="data-col">
                                    <span className="data-label">
                                      Full Name
                                    </span>
                                    <span className="data-value">
                                      Abu Bin Ishtiyak
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more">
                                      <em className="icon ni ni-forward-ios" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div
                                  className="data-item"
                                  data-toggle="modal"
                                  data-target="#profile-edit"
                                >
                                  <div className="data-col">
                                    <span className="data-label">
                                      Display Name
                                    </span>
                                    <span className="data-value">Ishtiyak</span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more">
                                      <em className="icon ni ni-forward-ios" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div className="data-item">
                                  <div className="data-col">
                                    <span className="data-label">Email</span>
                                    <span className="data-value">
                                      info@softnio.com
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more disable">
                                      <em className="icon ni ni-lock-alt" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div
                                  className="data-item"
                                  data-toggle="modal"
                                  data-target="#profile-edit"
                                >
                                  <div className="data-col">
                                    <span className="data-label">
                                      Phone Number
                                    </span>
                                    <span className="data-value text-soft">
                                      Not add yet
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more">
                                      <em className="icon ni ni-forward-ios" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div
                                  className="data-item"
                                  data-toggle="modal"
                                  data-target="#profile-edit"
                                >
                                  <div className="data-col">
                                    <span className="data-label">
                                      Date of Birth
                                    </span>
                                    <span className="data-value">
                                      29 Feb, 1986
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more">
                                      <em className="icon ni ni-forward-ios" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div
                                  className="data-item"
                                  data-toggle="modal"
                                  data-target="#profile-edit"
                                  data-tab-target="#address"
                                >
                                  <div className="data-col">
                                    <span className="data-label">Address</span>
                                    <span className="data-value">
                                      2337 Kildeer Drive,
                                      <br />
                                      Kentucky, Canada
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <span className="data-more">
                                      <em className="icon ni ni-forward-ios" />
                                    </span>
                                  </div>
                                </div>
                                {/* data-item */}
                              </div>
                              {/* data-list */}
                              <div className="nk-data data-list">
                                <div className="data-head">
                                  <h6 className="overline-title">
                                    Preferences
                                  </h6>
                                </div>
                                <div className="data-item">
                                  <div className="data-col">
                                    <span className="data-label">Language</span>
                                    <span className="data-value">
                                      English (United State)
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <a
                                      href="#"
                                      data-toggle="modal"
                                      data-target="#profile-language"
                                      className="link link-primary"
                                    >
                                      Change Language
                                    </a>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div className="data-item">
                                  <div className="data-col">
                                    <span className="data-label">
                                      Date Format
                                    </span>
                                    <span className="data-value">
                                      M d, YYYY
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <a
                                      href="#"
                                      data-toggle="modal"
                                      data-target="#profile-language"
                                      className="link link-primary"
                                    >
                                      Change
                                    </a>
                                  </div>
                                </div>
                                {/* data-item */}
                                <div className="data-item">
                                  <div className="data-col">
                                    <span className="data-label">Timezone</span>
                                    <span className="data-value">
                                      Bangladesh (GMT +6)
                                    </span>
                                  </div>
                                  <div className="data-col data-col-end">
                                    <a
                                      href="#"
                                      data-toggle="modal"
                                      data-target="#profile-language"
                                      className="link link-primary"
                                    >
                                      Change
                                    </a>
                                  </div>
                                </div>
                                {/* data-item */}
                              </div>
                              {/* data-list */}
                            </div>
                            {/* .nk-block */}
                          </div>

                          {/* card-aside */}
                        </div>
                        {/* .card-aside-wrap */}
                      </div>
                      {/* .card */}
                    </div>
                    {/* .nk-block */}
                  </div>
                </div>
              </div>
            </div>
            {/* content @e */}
            {/* footer @s */}
            <div className="nk-footer">
              <div className="container-fluid">
                <div className="nk-footer-wrap">
                  <div className="nk-footer-copyright">
                    {" "}
                    © 2020 DashLite. Template by{" "}
                    <a href="https://softnio.com" target="_blank">
                      Softnio
                    </a>
                  </div>
                  <div className="nk-footer-links">
                    <ul className="nav nav-sm">
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Terms
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Privacy
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Help
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* footer @e */}
          </div>
          {/* wrap @e */}
        </div>
        {/* main @e */}
      </div>
      {/* app-root @e */}
      {/* @@ Profile Edit Modal @e */}
      <div className="modal fade" role="dialog" id="profile-edit">
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <a href="#" className="close" data-dismiss="modal">
              <em className="icon ni ni-cross-sm" />
            </a>
            <div className="modal-body modal-body-lg">
              <h5 className="title">Update Profile</h5>
              <ul className="nk-nav nav nav-tabs">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-toggle="tab"
                    href="#personal"
                  >
                    Personal
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" data-toggle="tab" href="#address">
                    Address
                  </a>
                </li>
              </ul>
              {/* .nav-tabs */}
              <div className="tab-content">
                <div className="tab-pane active" id="personal">
                  <div className="row gy-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="full-name">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="full-name"
                          defaultValue="Abu Bin Ishtiyak"
                          placeholder="Enter Full name"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="display-name">
                          Display Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="display-name"
                          defaultValue="Ishtiyak"
                          placeholder="Enter display name"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone-no">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="phone-no"
                          defaultValue={+880}
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="birth-day">
                          Date of Birth
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg date-picker"
                          id="birth-day"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="latest-sale"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="latest-sale"
                        >
                          Use full name to display{" "}
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                        <li>
                          <a href="#" className="btn btn-lg btn-primary">
                            Update Profile
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            data-dismiss="modal"
                            className="link link-light"
                          >
                            Cancel
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* .tab-pane */}
                <div className="tab-pane" id="address">
                  <div className="row gy-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="address-l1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="address-l1"
                          defaultValue="2337 Kildeer Drive"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="address-l2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="address-l2"
                          defaultValue=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="address-st">
                          State
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="address-st"
                          defaultValue="Kentucky"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="address-county">
                          Country
                        </label>
                        <select
                          className="form-select"
                          id="address-county"
                          data-ui="lg"
                        >
                          <option>Canada</option>
                          <option>United State</option>
                          <option>United Kindom</option>
                          <option>Australia</option>
                          <option>India</option>
                          <option>Bangladesh</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                        <li>
                          <a href="#" className="btn btn-lg btn-primary">
                            Update Address
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            data-dismiss="modal"
                            className="link link-light"
                          >
                            Cancel
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* .tab-pane */}
              </div>
              {/* .tab-content */}
            </div>
            {/* .modal-body */}
          </div>
          {/* .modal-content */}
        </div>
        {/* .modal-dialog */}
      </div>
      {/* .modal */}
      {/* JavaScript */}
    </div>
  );
}
