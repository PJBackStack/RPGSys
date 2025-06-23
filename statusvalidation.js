
const statusList = {
    bleed: (target, effect) => {
        console.log(`${target.name} bleeds for ${effect.damage} damage.`);
        target.adjustHealth(-effect.damage);
        effect.duration--;
    },
    burn: (target, effect) => { /* ... */ },
    stun: (target, effect) => { /* ... */ },
};

const effectList = {
    bleed: (target, value, damage) => {
        target.statusEffects.push({
            name: 'bleed',
            duration: value,
            damage: damage,
            handler: function () {
                statusList[this.name](target, this);
            }
        });
    }
    // Add more effects like burn/stun if needed
};

// --- Character class ---

class Character {
    constructor(name, maxHealth = 100) {
        this.name = name;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.statusEffects = [];
    }

    adjustHealth(amount = 0) {
        this.health = Math.max(0, Math.min(this.maxHealth, this.health + amount));
    }

    handleStatusTicks() {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.handler();
            if (effect.duration <= 0) {
                this.statusEffects.splice(i, 1); // remove expired effect
            }
        }
    }
}

// --- Validation test ---

const goblin = new Character('Goblin', 50);

// Apply bleed effect for 3 turns, 5 damage per turn
effectList.bleed(goblin, 3, 5);

console.log(`Initial health: ${goblin.health}`);

for (let turn = 1; turn <= 4; turn++) {
    console.log(`--- Turn ${turn} ---`);
    goblin.handleStatusTicks();
    console.log(`Health: ${goblin.health}`);
}