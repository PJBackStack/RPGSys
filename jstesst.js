const skillList = {
    Fire: {
        ember: {
            name: "Ember",
            basePower: 25,
            statType: "magic",
            cost: 5,
            cooldown: 1,
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
            cooldown: 2,
            description: "A stronger fire burst engulfing the enemy.",
            type: "offensive",
            effects: ["burn", "area"],
            effectChance: 0.5  // 50% chance to apply burn & area effect
        }
    },
    Ice: {
        frostbite: {
            name: "Frostbite",
            basePower: 40,
            statType: "magic",
            cost: 8,
            cooldown: 2,
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
            cooldown: 1,
            description: "Strikes with sharp thorns, causing bleeding.",
            type: "offensive",
            effects: ["bleed"],
            effectChance: 0.35
        }
    },
    // ... rest unchanged except adding effectChance for skills with effects
};
const statusEffects = {
    burn: {
        name: "Burn",
        duration: 3,
        description: "Takes damage over time.",
        onTurnStart: (target) => {
            const burnDamage = Math.floor(target.maxHP * 0.05);
            target.hp -= burnDamage;
            log(`${target.name} suffers ${burnDamage} burn damage.`);
        }
    },
    stun: {
        name: "Stun",
        duration: 1,
        description: "Prevents target from acting this turn.",
        onTurnStart: (target) => {
            target.stunned = true;
            log(`${target.name} is stunned and cannot act!`);
        }
    },
    bleed: {
        name: "Bleed",
        duration: 2,
        description: "Deals minor physical damage over time.",
        onTurnStart: (target) => {
            const bleedDamage = 5; // arbitrary
            target.hp -= bleedDamage;
            log(`${target.name} bleeds for ${bleedDamage} damage.`);
        }
    }
    // Add more as needed
};

function takeTurn(entity, target) {
    // Handle status effects first
    for (let i = entity.statuses.length - 1; i >= 0; i--) {
        const status = entity.statuses[i];
        const effect = statusEffects[status.name];

        if (effect?.onTurnStart) effect.onTurnStart(entity);

        status.duration--;
        if (status.duration <= 0) {
            entity.statuses.splice(i, 1);
            log(`${entity.name} is no longer affected by ${status.name}.`);
        }
    }

    // If stunned, skip action
    if (entity.stunned) {
        entity.stunned = false; // Reset stun for next turn
        return;
    }

    // Pick and use a skill (random here, logic can be AI/strategy)
    const skill = pickSkill(entity); // Your logic here
    useSkill(skill, entity, target);
}