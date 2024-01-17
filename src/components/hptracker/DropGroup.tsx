import { Droppable } from "react-beautiful-dnd";
import { DraggableTokenList } from "./TokenList.tsx";
import OBR, { Item, Metadata } from "@owlbear-rodeo/sdk";
import { HpTrackerMetadata, SceneMetadata } from "../../helper/types.ts";
import { characterMetadata, sceneMetadata } from "../../helper/variables.ts";
import {
    getAcOnMap,
    getCanPlayersSee,
    getHpBar,
    getHpOnMap,
    toggleAcOnMap,
    toggleCanPlayerSee,
    toggleHpBar,
    toggleHpOnMap,
} from "../../helper/multiTokenHelper.ts";

type DropGroupProps = {
    title: string;
    list: Array<Item>;
    selected: Array<string>;
    metadata: SceneMetadata;
    tokenLists: Map<string, Array<Item>>;
};

export const DropGroup = (props: DropGroupProps) => {
    const setOpenGroupSetting = async (name: string) => {
        const metadata: Metadata = await OBR.scene.getMetadata();
        const hpTrackerSceneMetadata = metadata[sceneMetadata] as SceneMetadata;
        if (hpTrackerSceneMetadata.openGroups && hpTrackerSceneMetadata.openGroups.indexOf(name) >= 0) {
            hpTrackerSceneMetadata.openGroups.splice(hpTrackerSceneMetadata.openGroups.indexOf(name), 1);
        } else {
            hpTrackerSceneMetadata.openGroups?.push(name);
        }
        const ownMetadata: Metadata = {};
        ownMetadata[sceneMetadata] = hpTrackerSceneMetadata;
        await OBR.scene.setMetadata(ownMetadata);
    };

    const setInitiative = async () => {
        await OBR.scene.items.updateItems(props.list, (items) => {
            items.forEach((item) => {
                const value =
                    Math.floor(Math.random() * (props.metadata.initiativeDice ?? 20)) +
                    1 +
                    (item.metadata[characterMetadata] as HpTrackerMetadata).stats.initiativeBonus;
                (item.metadata[characterMetadata] as HpTrackerMetadata).initiative = value;
            });
        });
    };

    return (
        <div
            className={`group-wrapper ${
                props.metadata.openGroups && props.metadata.openGroups?.indexOf(props.title) >= 0 ? "" : "hidden"
            }`}
        >
            <div className={"group-title"}>
                <div className={"group-name"}>
                    <span>{props.title}</span>
                </div>
                <div className={"settings"}>
                    <button
                        title={"Toggle HP Bar visibility for GM and Players"}
                        className={`toggle-button hp ${getHpBar(props.list) ? "on" : "off"}`}
                        onClick={() => {
                            toggleHpBar(props.list);
                        }}
                    />
                    <button
                        title={"Toggle HP displayed on Map"}
                        className={`toggle-button map ${getHpOnMap(props.list) ? "on" : "off"}`}
                        onClick={() => {
                            toggleHpOnMap(props.list);
                        }}
                    />
                    <button
                        title={"Toggle AC displayed on Map"}
                        className={`toggle-button ac ${getAcOnMap(props.list) ? "on" : "off"}`}
                        onClick={async () => {
                            toggleAcOnMap(props.list);
                        }}
                    />
                    <button
                        title={"Toggle HP/AC visibility for players"}
                        className={`toggle-button players ${getCanPlayersSee(props.list) ? "on" : "off"}`}
                        onClick={() => {
                            toggleCanPlayerSee(props.list);
                        }}
                    />
                </div>
                <button
                    title={"Roll Initiative (including initiative modifier from statblock)"}
                    className={`toggle-button initiative-button`}
                    onClick={() => {
                        setInitiative();
                    }}
                />
                <button
                    className={"hide-group"}
                    onClick={async () => {
                        await setOpenGroupSetting(props.title);
                    }}
                ></button>
            </div>
            <div className={"drop-list-wrapper"}>
                <div className={"drop-list"}>
                    <Droppable droppableId={props.title}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <DraggableTokenList
                                    tokens={props.list}
                                    selected={props.selected}
                                    metadata={props.metadata}
                                    tokenLists={props.tokenLists}
                                />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </div>
    );
};
