import { components } from "../../../api/schema";
import { DiceButton, DiceButtonWrapper } from "../../general/DiceRoller/DiceButtonWrapper.tsx";
import { capitalize } from "lodash";

type Ability = components["schemas"]["Action-Output"];

export const E5Ability = ({ ability, statblock }: { ability: Ability; statblock: string }) => {
    return (
        <li key={ability.name} className={"e5-ability"}>
            <span className={"ability-info"}>
                <b>{ability.name}.</b>{" "}
                <DiceButtonWrapper text={ability.desc} context={`${capitalize(ability.name)}`} statblock={statblock} />
            </span>
            <span className={"ability-extra-info"}>
                {ability.attack_bonus ? (
                    <span>
                        <i>Attack bonus</i>:
                        <DiceButton
                            dice={`d20+${ability.attack_bonus}`}
                            text={`+${ability.attack_bonus}`}
                            context={`${capitalize(ability.name)}: To Hit`}
                            statblock={statblock}
                        />
                    </span>
                ) : null}
                {ability.damage_dice ? (
                    <span>
                        <i>Damage</i>:{" "}
                        <DiceButton
                            dice={ability.damage_dice}
                            text={ability.damage_dice}
                            context={`${capitalize(ability.name)}: Damage`}
                            statblock={statblock}
                        />
                    </span>
                ) : null}
            </span>
        </li>
    );
};
