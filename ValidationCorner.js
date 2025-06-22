function getNestedRef(base, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], base);
}

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




const testObj = {
    flat: {
        offensive: {
            sword: { name: "Sword", power: 10 },
            axe: { name: "Axe", power: 15 }
        },
        defensive: {
            shield: { name: "Shield", power: 5 }
        }
    },
    percent: {
        stats: {
            offensive: {
                fire: { name: "Fire", power: 20 }
            },
            defensive: {
                armor: { name: "Armor", power: 8 }
            }
        }
    }
};

const testPaths = [
    'flat.offensive',
    'percent.stats.defensive'
];

const entries = getNamesAtPaths(testObj.flat.offensive);
console.log(entries);