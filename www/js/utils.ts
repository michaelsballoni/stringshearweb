function setStatus(statusText: string): void {
    document.getElementById("statusText").innerText = statusText;
}

function getInputElement(id: string): HTMLInputElement {
    return <HTMLInputElement>document.getElementById(id);
}

function parseFloatWithCheck(floatStr: string, varName: string): number {
    var retVal = parseFloat(floatStr);
    if (isNaN(retVal))
        throw new Error("Parsing config setting failed: " + varName + ": " + floatStr);
    return retVal;
}
