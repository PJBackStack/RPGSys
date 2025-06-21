
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
    }

    adjustHealth(amount = 0) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    adjustResource(amount = 0) {
        this.resource += amount;
        if (this.resource > this.maxResource) {
            this.resource = this.maxResource;
        }
    }

    isAlive() {
        return this.hp > 0;
    }

    resetStatusEffects() {
        this.statusEffects = [];
    }
}

class Player extends Character {
    constructor(config) {
        super(config);
        this.experience = 0;
        this.requiredExperience = 100;
        this.isPlayer = true;

        this.inventory = {};
        this.equipment = {};
        // Should look like:
        // potion: { quantity: 1, use() => {w/e} }, just check against itemList for static info
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

    addItemToInventory(key, quantity = 1) {
        const itemData = itemList[key];
        if (!itemData) return;

        if (!inventory[key]) {
            inventory[key] = {
                quantity,
                ...(itemData.isUseable && {
                    use() {
                        applyItemEffect(this.name);
                        this.quantity = Math.max(0, this.quantity - 1);
                    }
                }),
                ...(itemData.isEquippable && {
                    equip() {
                        equipItem(this.name);
                    }
                })
            }
        } else {
            inventory[key].quantity += quantity;
        }
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
    health_potion: {
        name: "Health Potion",
        type: "consumable",
        description: "Restores 50 HP when used.",
        effects: { heal: 50 },
        stackable: true,
        usable: true,
    },
    iron_sword: {
        name: "Iron Sword",
        type: "weapon",
        description: "A basic iron sword. Increases attack power.",
        effects: { attackBonus: 10 },
        equipable: true
    },
    leather_armor: {
        name: "Leather Armor",
        type: "armor",
        description: "Light armor that increases defense.",
        effects: { defenseBonus: 8 },
        equipable: true
    },
    torch: {
        name: "Torch",
        type: "consumable",
        description: "Lights dark areas for a limited time.",
        effects: { lightDuration: 30 }, // turns
        stackable: true,
        usable: true,
    }
};
// const booleanDefault = item.targetBool ?? 0; Probably not necessary but if you have time makes code look more professional
// const effectChanceDefault = item.effectChance ?? 1.0; USE THIS IN LOGIC
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