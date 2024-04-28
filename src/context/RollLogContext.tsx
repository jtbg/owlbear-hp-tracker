import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ID } from "../helper/variables.ts";
import { IRollValue, IRollValueImage } from "dddice-js";
import { withStorageDOMEvents } from "../helper/hooks.ts";
import { createStore } from "zustand/vanilla";

export type RollLogEntryType = {
    uuid: string;
    created_at: string;
    equation: string;
    label?: string;
    total_value: string | Array<string | IRollValueImage>;
    username: string;
    owlbear_user_id?: string;
    values: Array<IRollValue>;
};

export type RollLogContextType = {
    log: Array<RollLogEntryType>;
    addRoll: (roll: RollLogEntryType) => void;
    clear: () => void;
};

export const rollLogStore = createStore<RollLogContextType>()(
    persist(
        (set) => ({
            log: [],
            addRoll: (roll) =>
                set((state) => {
                    state.log.push(roll);
                    if (state.log.length > 100) {
                        state.log.splice(0, state.log.length - 100);
                    }
                    window.dispatchEvent(new StorageEvent("storage", { newValue: "new roll", key: `${ID}.roll-log` }));
                    return { ...state };
                }),
            clear: () => {
                set(() => {
                    window.dispatchEvent(new StorageEvent("storage", { newValue: "clear", key: `${ID}.roll-log` }));
                    return { log: [] };
                });
            },
        }),
        {
            name: `${ID}.roll-log`,
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export function useRollLogContext(): RollLogContextType;
export function useRollLogContext<T>(selector: (state: RollLogContextType) => T): T;
export function useRollLogContext<T>(selector?: (state: RollLogContextType) => T) {
    return useStore(rollLogStore, selector!);
}

withStorageDOMEvents(rollLogStore);
