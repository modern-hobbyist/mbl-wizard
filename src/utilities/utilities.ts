export const normalizeGCode = (gcode, {sendLineNumber: sendLineNumber}) => {
    let line = gcode;

    //Remove comments
    line = line.replace(/;.+/, '');

    return `${gcode}\n`;
};

export function parseResponse(response: string): string[] {
    const parsedResponse = [];
    for (let line of response.split("\n")) {
        line = line.replace(`echo:`, ``).trim();
        if (line.length > 0) {
            parsedResponse.push(line);
        }
    }

    return parsedResponse;
}