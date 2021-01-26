class AppSettings {
    timeSlice: string = "0.01";
    simulationSpeed: string = "Fast";
    tension: string = cDefaultTension.toString();
    outOfPhase: string = "0.5";

    leftEnabled: boolean = true;
    rightEnabled: boolean = true;

    leftFrequencies: string = "20";
    rightFrequencies: string = "";

    constructor(parsed: any = undefined) {
        if (!parsed)
            return;

        this.timeSlice = parsed.timeSlice;
        this.simulationSpeed = parsed.simulationSpeed;
        this.tension = parsed.tension;
        this.outOfPhase = parsed.outOfPhase;

        this.leftEnabled = parsed.leftEnabled;
        this.rightEnabled = parsed.rightEnabled;

        this.leftFrequencies = parsed.leftFrequencies;
        this.rightFrequencies = parsed.rightFrequencies;
    }

    toSimSettings(): SimSettings {
        let simSettings: SimSettings = new SimSettings();

        simSettings.timeSlice = parseFloatWithCheck(this.timeSlice, "timeSlice") / 1000.0;
        simSettings.tension = parseFloatWithCheck(this.tension, "tension");

        switch (this.simulationSpeed) {
            case "Fast":
                simSettings.delayMs = 0;
                simSettings.runCount = 100;
                break;

            case "Slow":
                simSettings.delayMs = 2;
                simSettings.runCount = 10;
                break;

            default:
                alert("Invalid speed: " + this.simulationSpeed);
                return null;
        }

        simSettings.leftFrequencies = getFrequencies(this.leftFrequencies, this.leftEnabled);
        if (simSettings.leftFrequencies == null) {
            alert("Invalid left frequencies:\n\n" + this.leftFrequencies);
            return null;
        }

        simSettings.rightFrequencies = getFrequencies(this.rightFrequencies, this.rightEnabled);
        if (simSettings.rightFrequencies == null) {
            alert("Invalid right frequencies:\n\n" + this.rightFrequencies);
            return null;
        }

        simSettings.outOfPhase = parseFloatWithCheck(this.outOfPhase, "outOfPhase");

        return simSettings;
    }
}

const cAppSettingsLocalStorageItemName = "appsettings.1.0.2";

function getAppSettings(): AppSettings {
    let settingsStr = localStorage.getItem(cAppSettingsLocalStorageItemName);
    if (settingsStr) {
        let parsed = JSON.parse(settingsStr);
        return new AppSettings(parsed);;
    }
    else
        return new AppSettings();
}

function saveAppSettings(appSettings: AppSettings): void {
    localStorage.setItem(cAppSettingsLocalStorageItemName, JSON.stringify(appSettings));
}

function clearAppSettings(): void {
    localStorage.removeItem(cAppSettingsLocalStorageItemName);
}

function getFrequencies(uiString: string, enabled: boolean): number[] {
    let retVal: number[] = new Array(0);
    if (!enabled)
        return retVal;

    let strings: string[] = uiString.split('\n');
    for (let nStringIndex = 0; nStringIndex < strings.length; ++nStringIndex) {
        let str: string = strings[nStringIndex].trim();
        if (str.length == 0)
            continue;

        let frequency: number = parseFloat(str);
        if (isNaN(frequency)) {
            console.log("Invalid frequency: " + str);
            return null;
        }

        retVal.push(frequency);
    }
    return retVal;
}

function selfTestAppSettings() {
    console.log("App Settings Self Test - Start");

    let freqs: number[] = getFrequencies("10\n \n 20 \n ", true);
    console.assert(freqs != null);
    console.assert(freqs[0] == 10);
    console.assert(freqs[1] == 20);

    let appSettings = new AppSettings();

    let simSettings = appSettings.toSimSettings();

    console.assert(simSettings != null);

    console.assert(simSettings.timeSlice == 0.01 / 1000.0);
    console.assert(simSettings.tension == cDefaultTension);
    console.assert(simSettings.delayMs == 0);
    console.assert(simSettings.runCount == 100); // fast

    console.assert(simSettings.leftFrequencies.length == 1);
    console.assert(simSettings.leftFrequencies[0] == 20);

    console.assert(simSettings.rightFrequencies.length == 0);

    console.assert(simSettings.outOfPhase == 0.5);

    console.log("App Settings Self Test - Complete");
}
selfTestAppSettings();
