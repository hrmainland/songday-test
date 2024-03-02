import React, { useState, useEffect } from "react";

function NewSession() {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    const callBackendAPI = async () => {
      try {
        // change to /api/players for dev
        // maybe add this line to client package.json: "proxy": "http://localhost:3500"
        const response = await fetch("/players");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const body = await response.json();
        setPlayers(body);
      } catch (error) {
        console.error(error.message);
      }
    };
    callBackendAPI();
  }, []);

  return (
    <div>
      {players.map((player, i) => (
        <h2 key={i}>{player}</h2>
      ))}
    </div>
  );
}

export default NewSession;
