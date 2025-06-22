const skillPattern = /skill\s+([^\s.,;!?]+)/gi;

const text = "The player used skill fireball burst, then skill dragon's wrath! Later, skill fly and skill ice spear were used. Skill fireball, skill ice spear x";

function sortSkillsByLength(skills) {
    return skills.slice().sort((a, b) => b.length - a.length);
}

const rawSkills = [
    "fireball burst",
    "dragon's wrath",
    "ice spear",
    "shield wall",
    "fireball",
    "ice spear x"
];

const knownSkills = sortSkillsByLength(rawSkills);

const lowerText = text.toLowerCase();

/**
 * Extract all skill candidates with their start positions.
 */
function extractSkillPositions(text, pattern) {
    const positions = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
        positions.push({ candidate: match[1], startIndex: match.index });
    }
    return positions;
}

/**
 * Get text segments from each skill start to next skill or end of text.
 */
function getSegments(text, positions) {
    const segments = [];
    for (let i = 0; i < positions.length; i++) {
        const { candidate, startIndex } = positions[i];
        const endIndex = i + 1 < positions.length ? positions[i + 1].startIndex : text.length;
        segments.push({ candidate, segment: text.slice(startIndex, endIndex) });
    }
    return segments;
}

/**
 * Validate candidate skills against known skills.
 */
function validateCandidates(segments, knownSkills) {
    return segments.map(({ candidate, segment }) => {
        const possibleMatches = knownSkills.filter(ks => ks.toLowerCase().startsWith(candidate));

        if (possibleMatches.length === 1) {
            return possibleMatches[0];
        }
        if (possibleMatches.length > 1) {
            // Escape regex special chars and check whole word matches only
            const found = possibleMatches.find(ks => {
                const escaped = ks.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`);
                return regex.test(segment);
            });
            return found || `(unknown: ${candidate})`;
        }
        return `(unknown: ${candidate})`;
    });
}

const skillPositions = extractSkillPositions(lowerText, skillPattern);
const segments = getSegments(lowerText, skillPositions);
const validated = validateCandidates(segments, knownSkills);

console.log(validated);