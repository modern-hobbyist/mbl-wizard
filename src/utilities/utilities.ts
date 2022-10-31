export const normalizeGCode = (gcode, {sendLineNumber: sendLineNumber}) => {
    let line = gcode;

    //Remove comments
    line = line.replace(/;.+/, '');

    return `${line}\n`;
};
