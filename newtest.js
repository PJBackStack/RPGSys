const commandPattern = /cmd_\S+/g;


//region Modular Regexes

// Regex expression maps, if you need more info look up a cheat sheet for regexes.
const parameterPatterns = {
    string: '(\\w+)',
    number: '(\\d+)',
    word: '(\\S+)',
    any: '(.+?)'
};

// Builds a regex according to the given parameters of a command defined in commandRegistry
function buildCommandRegex(cmdName = '', paramTypes = []) {
    const paramRegexParts = paramTypes.map(
        type => parameterPatterns[type] || parameterPatterns.any
    );
    const fullPattern = `^${cmdName}\\s+${paramRegexParts.join('\\s+')}$`;
    console.log(fullPattern);
    return new RegExp(fullPattern, 'i');
}

const commandRegistry = {
    cmd_move: {
        params: ['word'],
        handler: (direction) => {
            console.log('Moving:', direction);
        }
    },
    cmd_jump: {
        params: ['word'],
        handler: (target) => {
            console.log('Jumping to:', target);
        }
    }
};

const compiledCommands = {};

for (const [cmdName, cmdData] of Object.entries(commandRegistry)) {
    console.log(cmdName, cmdData.params);
    compiledCommands[cmdName] = {
        regex: buildCommandRegex(cmdName, cmdData.params),
        handler: cmdData.handler,
        paramTypes: cmdData.params
    };
};
//endregion