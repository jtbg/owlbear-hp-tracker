import OBR from "@owlbear-rodeo/sdk";
import { PlayerContext, PlayerContextType } from "../context/PlayerContext.ts";
import { PropsWithChildren, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PluginGate } from "../context/PluginGateContext.tsx";

export const ContextWrapper = (props: PropsWithChildren) => {
    const [role, setRole] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const queryClient = new QueryClient();

    useEffect(() => {
        if (OBR.isAvailable) {
            OBR.onReady(async () => {
                setReady(true);
                setRole(await OBR.player.getRole());
                setPlayerId(OBR.player.id);
                setPlayerName(await OBR.player.getName());
            });
        }
    }, []);

    const playerContext: PlayerContextType = { role: role, id: playerId, name: playerName };

    if (ready) {
        return (
            <PluginGate>
                <QueryClientProvider client={queryClient}>
                    <PlayerContext.Provider value={playerContext}>{props.children}</PlayerContext.Provider>
                </QueryClientProvider>
            </PluginGate>
        );
    } else {
        return null;
    }
};
