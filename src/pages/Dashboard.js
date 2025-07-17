// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoyages = async () => {
      if (!user) return;

      try {
        // ✅ On utilise la collection 'users' maintenant
        const clientRef = doc(db, "users", user.uid);

        const q = query(
          collection(db, "ventes"),
          where("client_reference", "==", clientRef)
        );

        const querySnapshot = await getDocs(q);
        const result = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          result.push({
            id: doc.id,
            destination: data.trajet?.[0]?.LieuDArriverLibelle || "Inconnu",
            depart: data.trajet?.[0]?.LieuDeDepartLibelle || "Inconnu",
            date: data.date_embarquement?.toDate().toLocaleDateString() || "",
            statut: data.status,
            montant: data.montant_ttc,
          });
        });

        setVoyages(result);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement voyages :", err);
      }
    };

    fetchVoyages();
  }, [user]);

  if (loading) return <p>Chargement des voyages...</p>;

  return (
    <div className="container mt-5">
      <h2>Bienvenue, {user.email}</h2>
      <h4 className="mt-4">Mes Voyages</h4>

      {voyages.length === 0 ? (
        <p>Aucun voyage trouvé.</p>
      ) : (
        <table className="table mt-3">
          <thead>
            <tr>
              <th>Départ</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            {voyages.map((v) => (
              <tr key={v.id}>
                <td>{v.depart}</td>
                <td>{v.destination}</td>
                <td>{v.date}</td>
                <td>{v.statut}</td>
                <td>{v.montant} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
