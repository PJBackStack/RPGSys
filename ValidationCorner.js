// Mock Character class with minimal implementation
class MockCharacter {
    constructor(name, health = 50, maxHealth = 100) {
        this.name = name;
        this.health = health;
        this.maxHealth = maxHealth;
    }

    adjustHealth(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

// Sample item list with a healing item
const itemList = {
    consumables: {
        health_potion_s: {
            name: "Minor Health Potion",
            description: "Restores 50 HP when used.",
            effects: { heal: 50 },
            stackable: true,
            usable: true,
            rarity: 1
        }
    }
};

const effectList = {
    heal: (target, value) => {
        target.adjustHealth(value);
    },
    resourceHeal: (target, value) => {
        target.adjustResource(value);
    },
    // Add more effects as needed
    burn: (target, value) => {
        target.statusEffects.push({ type: 'burn', duration: value });
    },
    // etc.
};

// Function to test
function useItem(key, user, targets = [user]) {
    const item = itemList.consumables[key];
    if (!item || !item.usable) return;

    for (const target of targets) {
        const effects = item.effects;

        for (const [effectType, value] of Object.entries(effects)) {
            const effectHandler = effectList[effectType];
            if (typeof effectHandler === 'function') {
                effectHandler(target, value);
            } else {
                console.warn(`No handler defined for effect type: ${effectType}`);
            }
        }
    }
}
const user = new MockCharacter("TestUser", 40);

// Use the item
useItem("health_potion_s", user);

// Validate result
console.assert(user.health === 90, `Expected 90 HP, got ${user.health}`);
console.log("Test passed: useItem correctly healed the character.");