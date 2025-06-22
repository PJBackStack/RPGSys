
//region Top level generic functions

// Helper function to access deeply nested properties in an object using a dot-separated path string.
// Example: getNestedRef(obj, "temporary.flat.offensive") returns obj.temporary.flat.offensive
function getNestedRef(base, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], base);
}

// Returns an int corresponding to the amount of unique values in an array
function getUniqueCount(inputArray = []) {
    return new Set(inputArray).size;
}

// Helper function to get the name property of an object
function getNamesAtPaths(base, paths = []) {
    const results = [];

    const sources = paths.length > 0
        ? paths.map(path => getNestedRef(base, path)).filter(obj => obj && typeof obj === 'object')
        : [base]; // fallback: treat base as the object to extract from

    for (const obj of sources) {
        for (const value of Object.values(obj)) {
            if (value && typeof value === 'object' && 'name' in value) {
                results.push(value.name.toLowerCase());
            }
        }
    }

    return results;
}

//endregion

//region Text Parsing



//endregion



//region Character Definitions
class Character {


    constructor({
                    name,
                    level = 1,
                    maxHealth = 100,
                    maxResource = 50,
                    strength = 10,
                    magic = 10,
                    speed = 10,
                    defense = 10,
                    resistance = 10,
                }) {
        this.name = name;
        this.level = level;
        this.maxHealth = maxHealth
        this.health = maxHealth;
        this.maxResource = maxResource;
        this.resource = maxResource;
        this.strength = strength;
        this.magic = magic;
        this.speed = speed;
        this.defense = defense;
        this.resistance = resistance;
        this.statusEffects = []; // array of status objects like stun, burn, etc.
        this.equipment =
            {
                head: {slot: {name: 'head', equipmentName: 'empty'}},

            };
        this.modifiers =
            {
                // Persistent modifiers originating from equipment, class passives etc.
                persistent:
                    {
                        // Flat buff rates, inapplicable to statusResist (unless you add logic for it yourself).
                        flat:
                            {
                                // Stat categories
                                offensive: {}, // Offensive is called in damage formulas and the likes, includes: Strength, Magic.
                                defensive: {}, // Defensive is called in calculations of defense etc. includes: Defense, Resistance.
                                general: {}    // General is called in every calculation where applicable, includes: Speed.
                                // What a modifier object should look like:
                                // targetstat_X: { value: Y, source: "" } EXAMPLE: strength_0: { value: 10, source : "iron_sword" }
                            },
                        percent: //
                            {
                                stats:
                                    {
                                        offensive: {},
                                        defensive: {},
                                        general: {}
                                    },
                                statusResist: {},
                            },
                    },
                temporary:
                    {
                        flat:
                            {
                                offensive: {},
                                defensive: {},
                                general: {}
                            },
                        percent:
                            {
                                stats:
                                    {
                                        offensive: {},
                                        defensive:{},
                                        general: {}
                                    },
                                statusResist: {},
                            },
                    }
            }


    }

    // Handles all end of turn logic, and possibly calls for damage calculations to be made
    handleTurn() {
        this.handleModifierTicks()
    }

    handleModifierTicks() {
        // List of paths to all nested categories within temporary modifiers
        const modifierPaths = [
            'flat.offensive',
            'flat.defensive',
            'flat.general',
            'percent.stats.offensive',
            'percent.stats.defensive',
            'percent.stats.general',
            'percent.statusResist'
        ];

        // Iterate through each nested modifier path and decrement the duration of each modifier.
        // Remove any modifier whose duration has reached 0 or below.
        for (const path of modifierPaths) {
            const modCategory = getNestedRef(this.modifiers.temporary, path);
            if (!modCategory) continue;

            for (const key in modCategory) {
                const mod = modCategory[key];
                mod.duration -= 1;
                if (mod.duration <= 0) {
                    delete modCategory[key];
                }
            }
        }
    }

    adjustHealth(amount = 0) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        } else if (this.health < 0) {
            this.health = 0;
        }
    }

    adjustResource(amount = 0) {
        this.resource += amount;
        if (this.resource > this.maxResource) {
            this.resource = this.maxResource;
        } else if (this.resource < 0) {
            this.resource = 0;
        }
    }

    isAlive() {
        return this.health > 0;
    }

    resetStatusEffects() {
        this.statusEffects = [];
    }


    addItemToInventory(key, quantity = 1) {
        const itemData = itemList[key];
        if (!itemData) return;

        if (!this.inventory[key]) {
            this.inventory[key] = {
                quantity,
                ...(itemData.isUseable && {
                    use: () => useItem(key)
                }),
                ...(itemData.isEquippable && {
                    equip: () => equipItem(key)
                })
            }
        } else {
            this.inventory[key].quantity += quantity;
        }
    }
}

class Player extends Character {
    constructor(config) {
        super(config);
        this.experience = 0;
        this.requiredExperience = 100;
        this.isPlayer = true;

        this.inventory = {};
        // Should look like:
        // potion: { quantity: 1, use() => { useItem(key) } }, just check against itemList for static info



    }

    addExperience(experience = 0) {
        this.experience += experience;
        while (this.experience >= this.requiredExperience) {
            this.levelUp()
        }
    }

    levelUp() {
        this.experience -= this.requiredExperience;
        this.requiredExperience = Math.round(1.21 * this.requiredExperience);
        this.level++;
    }
}

class Enemy extends Character {
    constructor(config, specialization = 'balanced') {
        super(config);
        this.specialization = specialization;
        this.isEnemy = true;
        this.skills = config.skills || []; // Skills assigned on generation
    }
}

//endregion

//region Items
const itemList = {
    consumables: {
        health_potion_s: {
            name: "Minor Health Potion",
            description: "Restores 50 HP when used.",
            effects: { heal: 50 },
            stackable: true,
            usable: true,
            rarity: 1
        },
        health_potion_m: {
            name: "Health Potion",
            description: "Restores 150 HP when used.",
            effects: { heal: 150 },
            stackable: true,
            usable: true,
            rarity: 2
        },
        torch: {
            name: "Torch",
            description: "Lights dark areas for a limited time.",
            effects: { lightDuration: 30 }, // turns
            stackable: true,
            usable: true,
            rarity: 1
        }
    },
    equipment: {
        iron_sword: {
            name: "Iron Sword",
            type: "weapon",
            description: "A basic iron sword. Increases attack power.",
            effects: { attackBonus: 10 },
            equipable: true,
            rarity: 1
        },
        leather_armor: {
            name: "Leather Armor",
            type: "armor",
            description: "Light armor that increases defense.",
            effects: { defenseBonus: 8, resistanceBonus: 4 },
            equipable: true,
            rarity: 1
        },
        iron_ring: {
            name: "Iron Ring",
            type: "accessoire",
            description: "A simple ring made of iron. Increases resistance.",
            effects: { resistanceBonus: 5 },
            equipable: true,
            rarity: 1
        }
    }

};
// effectChanceDefault: item.effectChance ?? 1.0; USE THIS IN LOGIC

function useItem(key)
{

}

//endregion

//region Skills

const skillList = {
    Fire: {
        ember: {
            name: "Ember",
            basePower: 25,
            statType: "magic",
            cost: 5,
            description: "A small fire attack that burns the target.",
            type: "offensive",
            effects: ["burn"],
            effectChance: 0.3  // 30% chance to burn
        },
        blaze: {
            name: "Blaze",
            basePower: 50,
            statType: "magic",
            cost: 10,
            description: "A stronger fire burst engulfing the enemy.",
            type: "offensive",
            effects: ["burn"],
            effectChance: 0.5  // 50% chance to apply burn & area effect
        }
    },
    Ice: {
        frostbite: {
            name: "Frostbite",
            basePower: 40,
            statType: "magic",
            cost: 8,
            description: "Chills the enemy, slowing their movement.",
            type: "offensive",
            effects: ["slow"],
            effectChance: 0.4  // 40% chance to slow
        }
    },
    Nature: {
        thornStrike: {
            name: "Thorn Strike",
            basePower: 35,
            statType: "strength",
            cost: 6,
            description: "Strikes with sharp thorns, causing bleeding.",
            type: "offensive",
            effects: ["bleed"],
            effectChance: 0.35
        }
    },
}

//endregion




/*
function saveTurnSnapshot(player, enemy) {
    combatState.turnLog.push({
        player: JSON.parse(JSON.stringify(player)),
        enemy: JSON.parse(JSON.stringify(enemy)),
    });
}

function undoLastTurn() {
    if (combatState.turnLog.length > 0) {
        const snapshot = combatState.turnLog.pop();
        return {
            player: snapshot.player,
            enemy: snapshot.enemy,
        };
    }
    return null;
}
*/