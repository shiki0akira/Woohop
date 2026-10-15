import React, { createContext, useMemo, useState } from 'react';

export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [playerCount, setPlayerCount] = useState(5);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const value = useMemo(
    () => ({
      playerCount,
      setPlayerCount,
      selectedRoles,
      setSelectedRoles,
    }),
    [playerCount, selectedRoles],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
