import "./e5spell.scss";
import "./pfspell.scss";
import { useState } from "react";
import { highlightDice } from "../../../helper/diceHelper.tsx";
import { getDamage } from "../../../helper/helpers.ts";
import { PfSpell, usePfGetSpell } from "../../../ttrpgapi/pf/usePfApi.ts";
import { components } from "../../../ttrpgapi/schema";
import { SpellFilter } from "./SpellFilter.tsx";

export type PfSpellCategory = components["schemas"]["SpellCategoryOut"];
export type PfSpellList = components["schemas"]["SpelllistOut"];
export type PfSpellOut = components["schemas"]["SpellOut"];

const Spell = (props: { spell: PfSpellOut }) => {
    const [open, setOpen] = useState<boolean>(false);

    const spellQuery = usePfGetSpell(props.spell.slug);

    const spell: PfSpell | null = spellQuery.isSuccess && spellQuery.data ? spellQuery.data : null;

    const damage = getDamage(spell?.description?.text || "");

    return (
        <li className={`spell`}>
            <div className={"spell-main"}>
                <div className={"spell-info"}>
                    <div className={"spell-header"}>
                        <h4 className={"spell-name"}>{spell?.name}</h4>
                    </div>
                    {damage ? <span className={"spell-damage"}>Damage: {damage}</span> : null}
                    {spell?.cast ? (
                        <div className={"spell-components"}>
                            {spell.cast.verbal ? "V" : null}
                            {spell.cast.somatic ? "S" : null}
                            <span className={"spell-materials"}>
                                {spell.cast.material ? `M` : null}
                                <span className={"material-details"}>
                                    {!!spell.cast.cost ? ` (${spell.cast.cost})` : null}
                                </span>
                            </span>
                        </div>
                    ) : null}
                </div>
                <button className={`expand ${open ? "open" : null}`} onClick={() => setOpen(!open)}></button>
            </div>
            <div className={`spell-more-info ${open ? "open" : null}`}>
                <div className={"more-info-content"}>
                    <div className={"info-bits"}>
                        {!!spell?.traits && spell.traits.length > 0 ? (
                            <span>
                                <b>Traits</b>: {spell.traits.map((trait) => trait.name).join(", ")}
                            </span>
                        ) : null}
                        {!!spell?.traditions && spell.traditions.length > 0 ? (
                            <span>
                                <b>Traditions</b>: {spell.traditions.map((tradition) => tradition.name).join(", ")}
                            </span>
                        ) : null}
                        {spell?.bloodlines && spell.bloodlines.length > 0 ? (
                            <span>
                                <b>Bloodlines</b>: {spell.bloodlines.map((bloodline) => bloodline.name).join(", ")}
                            </span>
                        ) : null}
                        {spell?.deities && spell.deities.length > 0 ? (
                            <span>
                                <b>Deities</b>: {spell.deities.map((deity) => deity.name).join(", ")}
                            </span>
                        ) : null}
                        {spell?.domains && spell.domains.length > 0 ? (
                            <span>
                                <b>Domains</b>: {spell.domains.map((d) => d.name).join(", ")}
                            </span>
                        ) : null}
                        {spell?.mysteries && spell.mysteries.length > 0 ? (
                            <span>
                                <b>Mysteries</b>: {spell.mysteries.map((mystery) => mystery.name).join(", ")}
                            </span>
                        ) : null}
                        {spell?.range ? (
                            <span>
                                <b>Range</b>: {spell?.range}
                            </span>
                        ) : null}
                        {spell?.area ? (
                            <span>
                                <b>Area</b>: {spell?.area}
                            </span>
                        ) : null}
                        {spell?.targets ? (
                            <span>
                                <b>Targets</b>: {spell?.targets}
                            </span>
                        ) : null}
                        {spell?.duration ? (
                            <span>
                                <b>Duration</b>: {spell?.duration}
                            </span>
                        ) : null}
                        {spell?.saving_throws ? (
                            <span>
                                <b>Saving Throws</b>: {spell?.saving_throws}
                            </span>
                        ) : null}
                        {spell?.trigger ? (
                            <span>
                                <b>Trigger</b>: {spell?.trigger}
                            </span>
                        ) : null}
                    </div>
                    <div className={"spell-description"}>
                        <b>Description</b>: {highlightDice(spell?.description?.text || "")}
                        {spell?.description?.details && spell.description.details.length > 0 ? (
                            <ul>
                                {spell?.description.details.map((details, index) => {
                                    return (
                                        <li key={index}>
                                            <b>{details.title}</b>: {details.text}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}
                    </div>
                    {spell?.heightened && spell.heightened.length > 0 ? (
                        <div className={"spell-higher-level"}>
                            <b>Heightened</b>:
                            <div>
                                {spell.heightened.map((heightened, index) => {
                                    return (
                                        <div key={index}>
                                            <div className={"modifier"}>{heightened.modifier}</div>
                                            <div className={"description"}>{highlightDice(heightened.description)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </li>
    );
};

const PfSpellListComponent = (props: { list: PfSpellList }) => {
    return (
        <div className={"spell-list"}>
            <h4 className={"spell-list-title"}>
                <span className={"spell-list-type"}>{props.list.type}s</span>{" "}
                <span className={"spell-list-level"}>{props.list.level} Level</span>
            </h4>
            <ul className={"spells"}>
                {!!props.list.spells
                    ? props.list.spells.map((spell) => {
                          return <Spell spell={spell} key={spell.slug} />;
                      })
                    : null}
            </ul>
        </div>
    );
};

const PfSpellCategory = (props: { spellCategory: PfSpellCategory }) => {
    const [spellFilter, setSpellFilter] = useState<Array<number>>([]);
    const [open, setOpen] = useState<boolean>(false);

    const sortFilters = (a: string, b: string) => {
        if (a === "All") {
            return -1;
        } else if (b === "All") {
            return 1;
        } else if (a === "Cant" || a === "Const") {
            return -1;
        } else if (b === "Cant" || b === "Const") {
            return 1;
        } else {
            return parseInt(a) - parseInt(b);
        }
    };

    const filters = ["All"]
        .concat(
            props.spellCategory.spell_lists
                ? props.spellCategory.spell_lists.map((list) => {
                      if (list.type.toLowerCase().startsWith("cantrip")) {
                          return "Cant";
                      } else if (list.type.toLowerCase().startsWith("constant")) {
                          return "Const";
                      } else {
                          return list.level;
                      }
                  })
                : []
        )
        .filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
        .sort(sortFilters);

    return (
        <div className={"spell-category"}>
            <div className={"spell-category-main"}>
                <div className={"spell-category-header"}>
                    <h3 className={"spell-category-name"}>{props.spellCategory.name}</h3>
                    <span className={"spell-category-info"}>
                        {props.spellCategory.dc ? `DC: ${props.spellCategory.dc}` : null}{" "}
                        {props.spellCategory.attack ? `Attack: ${props.spellCategory.attack}` : null}
                    </span>
                </div>
                <button className={`expand ${open ? "open" : null}`} onClick={() => setOpen(!open)}></button>
            </div>
            <div className={`spell-category-details ${open ? "open" : null}`}>
                <div className={"spell-category-details-content"}>
                    <SpellFilter filters={filters} spellFilter={spellFilter} setSpellFilter={setSpellFilter} />
                    {!!props.spellCategory.spell_lists
                        ? props.spellCategory.spell_lists
                              .sort((a, b) => {
                                  let aName = a.level;
                                  let bName = b.level;
                                  if (a.type.toLowerCase().startsWith("cantrip")) {
                                      aName = "Cant";
                                  } else if (a.type.toLowerCase().startsWith("constant")) {
                                      aName = "Const";
                                  }
                                  if (b.type.toLowerCase().startsWith("cantrip")) {
                                      bName = "Cant";
                                  } else if (b.type.toLowerCase().startsWith("constant")) {
                                      bName = "Const";
                                  }
                                  return sortFilters(aName, bName);
                              })
                              .filter((list) => {
                                  if (spellFilter.length === 0) {
                                      return true;
                                  }
                                  if (list.type === "spell") {
                                      return spellFilter.indexOf(parseInt(list.level)) >= 0;
                                  } else {
                                      if (list.type.toLowerCase().startsWith("cantrip")) {
                                          return spellFilter.indexOf(0) >= 0;
                                      } else {
                                          return spellFilter.indexOf(-1) >= 0;
                                      }
                                  }
                              })
                              .map((list) => {
                                  return <PfSpellListComponent key={list.type + list.level} list={list} />;
                              })
                        : null}
                </div>
            </div>
        </div>
    );
};

export const PfSpells = (props: { spells: Array<PfSpellCategory> }) => {
    return (
        <div className={"spells"}>
            <h3 className={"section-title"}>Spells</h3>
            {props.spells.map((spellCategory) => {
                return !!spellCategory ? (
                    <PfSpellCategory key={spellCategory.name} spellCategory={spellCategory} />
                ) : null;
            })}
        </div>
    );
};
