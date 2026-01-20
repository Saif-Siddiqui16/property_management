/**
 * Normalizes a bedroom identifier to the format: {CivicNumber}-{UnitNumber}-{BedroomIndex}
 * 
 * Rules:
 * 1. Removes "Floor" and related text from the unit identifier.
 * 2. Checks if the civic number is already prefixed to the unit identifier.
 * 3. Prepends the civic number only if missing.
 * 4. Appends the bedroom index (room number).
 * 
 * @param {string|number} civicNumber - The building's civic number (e.g., "82")
 * @param {string} unitIdentifier - The unit number or name (e.g., "101", "82-101", "Floor 1 Unit 101")
 * @param {number} roomNumber - The bedroom index/room number (e.g., 1)
 * @returns {string} The normalized identifier (e.g., "82-101-1")
 */
const normalizeBedroomIdentifier = (civicNumber, unitIdentifier, roomNumber) => {
    if (!civicNumber || !unitIdentifier || !roomNumber) {
        return ''; // Or handle error appropriately
    }

    // Convert inputs to strings for safe manipulation
    const civicStr = String(civicNumber).trim();
    let unitStr = String(unitIdentifier).trim();

    // 1. Remove "Floor" and its number (e.g., "Floor 1", "Floor-1")
    // Regex: Match "floor" followed optionally by separators and digits
    unitStr = unitStr.replace(/(?:^|[-_\s])floor(?:\s*[-_]?\s*\d+)?/gi, '');

    // 2. Remove "Unit" keyword only (keep the number) (e.g., "Unit 101" -> "101")
    unitStr = unitStr.replace(/unit/gi, '').trim();

    // Remove any leading/trailing special characters that might have been left
    unitStr = unitStr.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');

    // 2. Check for duplicate civic number overlap
    // Example: civic="82", unit="82-101". Result should NOT be "82-82-101".

    // Normalize separator to hyphen for check
    const normalizedUnitStr = unitStr.replace(/[^a-zA-Z0-9]/g, '-');

    // If unit string starts with civic number, don't prepend it
    // We check both exact match + separator, or just exact match if unitStr IS the civic number (unlikely for a unit but possible)
    let finalPrefix = civicStr;

    // Clean checking:
    // If unitStr is "82-101" and civic is "82", we want "82-101" not "82-82-101"
    if (unitStr.startsWith(civicStr)) {
        // checks if the character after civicStr is a separator or end of string
        const charAfter = unitStr.charAt(civicStr.length);
        if (charAfter === '' || /[^a-zA-Z0-9]/.test(charAfter)) {
            finalPrefix = ''; // Already present
        }
    }

    // 3. Assemble
    // If finalPrefix is empty, it means unitStr already contains it.
    // Ensure we join with a single clear separator.
    let base = finalPrefix ? `${finalPrefix}-${unitStr}` : unitStr;

    // Clean up any double separators created by simple joining
    base = base.replace(/-+/g, '-');

    // 4. Append room number
    return `${base}-${roomNumber}`;
};

module.exports = {
    normalizeBedroomIdentifier
};
