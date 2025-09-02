import React, { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import NavBarComponent from "../components/NavBarComponent";
import { useNavigate } from "react-router-dom";
import FooterComponent from "../components/FooterComponent";

export default function DetailVoyage({ id }) {
  const [voyage, setVoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleBackNavigation = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchVoyage = async () => {
      try {
        const docRef = doc(collection("voyages"), id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVoyage(docSnap.data());
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.log("Error fetching voyage: ", error);
        setLoading(false);
      }
    };
    fetchVoyage();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nk-body bg-lighter npc-default has-sidebar ">
      <div className="nk-app-root">
        {/* main @s */}
        <div className="nk-main ">
          <div className="nk-wrap ">
            {/* main header @s */}
            <NavBarComponent />
            {/* main header @e */}
            {/* content @s */}
            <div className="nk-content ">
              <div className="container">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    <div className="nk-block-head nk-block-head-sm">
                      <div className="nk-block-between g-3">
                        <div className="nk-block-head-content">
                          <h3 className="nk-block-title page-title">
                            Voyage /{" "}
                            <strong className="text-primary small">
                              {voyage?.titre}
                            </strong>
                          </h3>
                          <div className="nk-block-des text-soft">
                            <ul className="list-inline">
                              <li>
                                User ID:{" "}
                                <span className="text-base">UD003054</span>
                              </li>
                              <li>
                                Last Login:{" "}
                                <span className="text-base">
                                  15 Feb, 2019 01:02 PM
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
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
                    </div>
                    {/* .nk-block-head */}
                    <div className="nk-block">
                      <div className="card">
                        <div className="card-aside-wrap">
                          <div className="card-content">
                            <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                              <li className="nav-item">
                                <a className="nav-link active" href="#">
                                  <em className="icon ni ni-user-circle" />
                                  <span>Information sur le voyage</span>
                                </a>
                              </li>
                            </ul>
                            {/* .nav-tabs */}
                            <div className="card-inner">
                              <div className="nk-block">
                                <div className="nk-block-head">
                                  <h5 className="title">
                                    Information sur le voyage
                                  </h5>
                                  <p>
                                    Basic info, like your name and address, that
                                    you use on Nio Platform.
                                  </p>
                                </div>
                                {/* .nk-block-head */}
                                <div className="profile-ud-list">
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Titre
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.titre}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Description
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.description}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Date de debut
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.dateDebut}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Date de fin
                                      </span>
                                      <span className="profile-ud-value">
                                        IO
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Mobile Number
                                      </span>
                                      <span className="profile-ud-value">
                                        01713040400
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Email Address
                                      </span>
                                      <span className="profile-ud-value">
                                        info@softnio.com
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* .profile-ud-list */}
                              </div>
                              {/* .nk-block */}
                              <div className="nk-block">
                                <div className="nk-block-head nk-block-head-line">
                                  <h6 className="title overline-title text-base">
                                    Additional Information
                                  </h6>
                                </div>
                                {/* .nk-block-head */}
                                <div className="profile-ud-list">
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Joining Date
                                      </span>
                                      <span className="profile-ud-value">
                                        08-16-2018 09:04PM
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Reg Method
                                      </span>
                                      <span className="profile-ud-value">
                                        Email
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Country
                                      </span>
                                      <span className="profile-ud-value">
                                        United State
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Nationality
                                      </span>
                                      <span className="profile-ud-value">
                                        United State
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* .profile-ud-list */}
                              </div>
                              {/* .nk-block */}
                              <div className="nk-divider divider md" />
                              <div className="nk-block">
                                <div className="nk-block-head nk-block-head-sm nk-block-between">
                                  <h5 className="title">Admin Note</h5>
                                  <a href="#" className="link link-sm">
                                    + Add Note
                                  </a>
                                </div>
                                {/* .nk-block-head */}
                                <div className="bq-note">
                                  <div className="bq-note-item">
                                    <div className="bq-note-text">
                                      <p>
                                        Aproin at metus et dolor tincidunt
                                        feugiat eu id quam. Pellentesque
                                        habitant morbi tristique senectus et
                                        netus et malesuada fames ac turpis
                                        egestas. Aenean sollicitudin non nunc
                                        vel pharetra.{" "}
                                      </p>
                                    </div>
                                    <div className="bq-note-meta">
                                      <span className="bq-note-added">
                                        Added on{" "}
                                        <span className="date">
                                          November 18, 2019
                                        </span>{" "}
                                        at <span className="time">5:34 PM</span>
                                      </span>
                                      <span className="bq-note-sep sep">|</span>
                                      <span className="bq-note-by">
                                        By <span>Softnio</span>
                                      </span>
                                      <a
                                        href="#"
                                        className="link link-sm link-danger"
                                      >
                                        Delete Note
                                      </a>
                                    </div>
                                  </div>
                                  {/* .bq-note-item */}
                                  <div className="bq-note-item">
                                    <div className="bq-note-text">
                                      <p>
                                        Aproin at metus et dolor tincidunt
                                        feugiat eu id quam. Pellentesque
                                        habitant morbi tristique senectus et
                                        netus et malesuada fames ac turpis
                                        egestas. Aenean sollicitudin non nunc
                                        vel pharetra.{" "}
                                      </p>
                                    </div>
                                    <div className="bq-note-meta">
                                      <span className="bq-note-added">
                                        Added on{" "}
                                        <span className="date">
                                          November 18, 2019
                                        </span>{" "}
                                        at <span className="time">5:34 PM</span>
                                      </span>
                                      <span className="bq-note-sep sep">|</span>
                                      <span className="bq-note-by">
                                        By <span>Softnio</span>
                                      </span>
                                      <a
                                        href="#"
                                        className="link link-sm link-danger"
                                      >
                                        Delete Note
                                      </a>
                                    </div>
                                  </div>
                                  {/* .bq-note-item */}
                                </div>
                                {/* .bq-note */}
                              </div>
                              {/* .nk-block */}
                            </div>
                            {/* .card-inner */}
                          </div>
                          {/* .card-content */}
                          <div
                            className="card-aside card-aside-right user-aside toggle-slide toggle-slide-right toggle-break-xxl"
                            data-content="userAside"
                            data-toggle-screen="xxl"
                            data-toggle-overlay="true"
                            data-toggle-body="true"
                          >
                            <div className="card-inner-group" data-simplebar="">
                              <div className="card-inner">
                                <div className="user-card user-card-s2">
                                  <div className="user-avatar lg bg-primary">
                                    <span>AB</span>
                                  </div>
                                  <div className="user-info">
                                    <div className="badge badge-outline-light badge-pill ucap">
                                      Investor
                                    </div>
                                    <h5>Abu Bin Ishtiyak</h5>
                                    <span className="sub-text">
                                      info@softnio.com
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner card-inner-sm">
                                <ul className="btn-toolbar justify-center gx-1">
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-shield-off" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-mail" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-download-cloud" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-bookmark" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon text-danger"
                                    >
                                      <em className="icon ni ni-na" />
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <div className="overline-title-alt mb-2">
                                  In Account
                                </div>
                                <div className="profile-balance">
                                  <div className="profile-balance-group gx-4">
                                    <div className="profile-balance-sub">
                                      <div className="profile-balance-amount">
                                        <div className="number">
                                          2,500.00{" "}
                                          <small className="currency currency-usd">
                                            USD
                                          </small>
                                        </div>
                                      </div>
                                      <div className="profile-balance-subtitle">
                                        Invested Amount
                                      </div>
                                    </div>
                                    <div className="profile-balance-sub">
                                      <span className="profile-balance-plus text-soft">
                                        <em className="icon ni ni-plus" />
                                      </span>
                                      <div className="profile-balance-amount">
                                        <div className="number">1,643.76</div>
                                      </div>
                                      <div className="profile-balance-subtitle">
                                        Profit Earned
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <div className="row text-center">
                                  <div className="col-4">
                                    <div className="profile-stats">
                                      <span className="amount">23</span>
                                      <span className="sub-text">
                                        Total Order
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="profile-stats">
                                      <span className="amount">20</span>
                                      <span className="sub-text">Complete</span>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="profile-stats">
                                      <span className="amount">3</span>
                                      <span className="sub-text">Progress</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <h6 className="overline-title-alt mb-2">
                                  Additional
                                </h6>
                                <div className="row g-3">
                                  <div className="col-6">
                                    <span className="sub-text">User ID:</span>
                                    <span>UD003054</span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      Last Login:
                                    </span>
                                    <span>15 Feb, 2019 01:02 PM</span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      KYC Status:
                                    </span>
                                    <span className="lead-text text-success">
                                      Approved
                                    </span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      {voyage?.dateFin}
                                    </span>
                                    <span>Nov 24, 2019</span>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <h6 className="overline-title-alt mb-3">
                                  Groups
                                </h6>
                                <ul className="g-1">
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      investor
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      support
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      another tag
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              {/* .card-inner */}
                            </div>
                            {/* .card-inner */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* content @e */}
            {/* footer @s */}
            <FooterComponent />
            {/* footer @e */}
          </div>
          {/* wrap @e */}
        </div>
        {/* main @e */}
      </div>
    </div>
  );
}
