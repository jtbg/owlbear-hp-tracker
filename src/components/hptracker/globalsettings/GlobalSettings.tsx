import React, { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../../../helper/hooks.ts";
import { ID, sceneMetadata } from "../../../helper/variables.ts";
import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { SceneMetadata } from "../../../helper/types.ts";
import "./global-settings.scss";
import { SceneReadyContext } from "../../../context/SceneReadyContext.ts";
import { updateHpBarOffset } from "../../../helper/shapeHelpers.ts";
import { updateTextOffset } from "../../../helper/textHelpers.ts";

export const GlobalSettings = ({ sceneId }: { sceneId: string }) => {
    const [offset, setOffset] = useLocalStorage<number>(`${ID}.offset`, 0);
    const [segments, setSegments] = useLocalStorage<number>(`${ID}.hpSegments`, 0);
    const [allowNegativNumbers, setAllowNegativeNumbers] = useLocalStorage<boolean>(
        `${ID}.allowNegativeNumbers`,
        false
    );
    const [groups, setGroups] = useLocalStorage<string>(`${ID}.${sceneId}.groups`, "Default");
    const groupInputRef = useRef<HTMLInputElement>(null);
    const { isReady } = SceneReadyContext();
    const [hide, setHide] = useState<boolean>(true);

    useEffect(() => {
        const setSceneMetadata = async () => {
            const metadata: Metadata = await OBR.scene.getMetadata();
            (metadata[sceneMetadata] as SceneMetadata).hpBarOffset = offset;
            (metadata[sceneMetadata] as SceneMetadata).hpBarSegments = segments;
            (metadata[sceneMetadata] as SceneMetadata).allowNegativeNumbers = allowNegativNumbers;
            await OBR.scene.setMetadata(metadata);
        };
        if (isReady) {
            setSceneMetadata();
        }
    }, [offset, segments, allowNegativNumbers]);

    useEffect(() => {
        const setSceneMetadata = async () => {
            const metadata: Metadata = await OBR.scene.getMetadata();
            if (
                groups.split(" ").length > 0 &&
                (metadata[sceneMetadata] as SceneMetadata).groups?.toString() !== groups
            ) {
                (metadata[sceneMetadata] as SceneMetadata).groups = groups.split(" ");
                await OBR.scene.setMetadata(metadata);
            }
        };
        if (isReady) {
            setSceneMetadata();
        }
    }, [groups]);

    useEffect(() => {
        const setInitialGroups = async () => {
            const metadata: Metadata = await OBR.scene.getMetadata();
            const data = metadata[sceneMetadata] as SceneMetadata;
            if (data.groups) {
                setGroups(data.groups.join(" "));
            }
        };
        if (isReady) {
            setInitialGroups();
        }
    }, []);

    const handleOffsetChange = (value: number) => {
        updateHpBarOffset(value);
        updateTextOffset(value);
        setOffset(value);
    };

    const handleGroupsChange = (value: string) => {
        const g = value.split(" ").filter((value, index, array) => {
            return index === array.indexOf(value) && value !== "";
        });
        if (!g.includes("Default")) {
            g.splice(0, 0, "Default");
        }
        setGroups(g.join(" "));
        groupInputRef.current!.value = g.join(" ");
    };

    return (
        <div className={"global-setting"}>
            <div className={"heading"}>
                <h3>Global Settings</h3> <button onClick={() => setHide(!hide)}>{hide ? "Show" : "Hide"}</button>
            </div>
            {hide ? null : (
                <>
                    <div className={"hp-mode setting"}>
                        HP Bar Segments:{" "}
                        <input
                            type={"text"}
                            size={2}
                            value={segments}
                            onChange={(e) => {
                                const nValue = Number(e.target.value.replace(/[^0-9]/g, ""));
                                setSegments(nValue);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowUp") {
                                    setSegments(segments + 1);
                                } else if (e.key === "ArrowDown") {
                                    setSegments(segments - 1);
                                }
                            }}
                        />
                    </div>
                    <div className={"hp-position setting"}>
                        Text and Bar Offset:{" "}
                        <input
                            type={"text"}
                            size={2}
                            value={offset}
                            onChange={(e) => {
                                const factor = e.target.value.startsWith("-") ? -1 : 1;
                                const nValue = Number(e.target.value.replace(/[^0-9]/g, ""));
                                handleOffsetChange(nValue * factor);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowUp") {
                                    handleOffsetChange(offset + 1);
                                } else if (e.key === "ArrowDown") {
                                    handleOffsetChange(offset - 1);
                                }
                            }}
                        />
                    </div>
                    <div className={"negative-numbers setting"}>
                        Allow negative HP/AC:
                        <input
                            type={"checkbox"}
                            checked={allowNegativNumbers}
                            onChange={() => {
                                setAllowNegativeNumbers(!allowNegativNumbers);
                            }}
                        />
                    </div>
                    <div className={"groups"}>
                        Groups:
                        <input
                            ref={groupInputRef}
                            type={"text"}
                            defaultValue={groups}
                            onBlur={(e) => {
                                handleGroupsChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleGroupsChange(e.currentTarget.value);
                                }
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
