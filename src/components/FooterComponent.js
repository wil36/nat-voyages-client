export default function FooterComponent() {
  return (
    <div className="nk-footer" style={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: '#fff', borderTop: '1px solid #e5e9f2'}}>
      <div className="container">
        <div className="nk-footer-wrap">
          <div className="nk-footer-copyright">
            &copy; 2025 Nat Voyages. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}
