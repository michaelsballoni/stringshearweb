class Main {
    appSettings: AppSettings = new AppSettings();
    simSettings: SimSettings = this.appSettings.toSimSettings();

    drawing: Drawing = null;

    worker: Worker = null;
    simState: SimState = null;

    updateSettingsToUi(): void {
        getInputElement("timeSlice").value = this.appSettings.timeSlice;
        getInputElement("speed").value = this.appSettings.simulationSpeed;
        getInputElement("tension").value = this.appSettings.tension;

        getInputElement("leftEnabled").checked = this.appSettings.leftEnabled;
        getInputElement("rightEnabled").checked = this.appSettings.rightEnabled;

        getInputElement("leftFrequencies").value = this.appSettings.leftFrequencies;
        getInputElement("rightFrequencies").value = this.appSettings.rightFrequencies;

        getInputElement("outOfPhase").value = this.appSettings.outOfPhase;

        getInputElement("justPulse").checked = this.appSettings.justPulse;
        getInputElement("justHalfPulse").checked = this.appSettings.justHalfPulse;
    }

    updateUiToSettings(): boolean {
        if (isNaN(parseFloat(getInputElement("timeSlice").value))) {
            alert("Invalid time slice: " + getInputElement("timeSlice").value);
            return false;
        }
        this.appSettings.timeSlice = getInputElement("timeSlice").value;

        this.appSettings.simulationSpeed = getInputElement("speed").value;

        if (isNaN(parseFloat(getInputElement("tension").value))) {
            alert("Invalid tension: " + getInputElement("tension").value);
            return false;
        }
        this.appSettings.tension = getInputElement("tension").value;

        this.appSettings.leftEnabled = getInputElement("leftEnabled").checked;
        this.appSettings.leftFrequencies = getInputElement("leftFrequencies").value;

        this.appSettings.rightEnabled = getInputElement("rightEnabled").checked;
        this.appSettings.rightFrequencies = getInputElement("rightFrequencies").value;

        if (isNaN(parseFloat(getInputElement("outOfPhase").value))) {
            alert("Invalid out of phase: " + getInputElement("outOfPhase").value);
            return false;
        }
        this.appSettings.outOfPhase = getInputElement("outOfPhase").value;

        this.appSettings.justPulse = getInputElement("justPulse").checked;
        this.appSettings.justHalfPulse = getInputElement("justHalfPulse").checked;

        saveAppSettings(this.appSettings);
        this.simSettings = this.appSettings.toSimSettings();
        return true;
    }

    sendSettingsToWorker(): void {
        if (this.worker == null || this.appSettings == null)
            return;

        this.simSettings = this.appSettings.toSimSettings();
        if (this.simSettings == null)
            return;

        this.worker.postMessage({ op: "putsettings", obj: this.simSettings });
    }

    onRun(): void {
        let runButton = getInputElement("runButton");

        if (!this.updateUiToSettings())
            return;

        if (this.worker == null)
            return;

        if (runButton.value == "Run") {
            this.sendSettingsToWorker();
            this.worker.postMessage({ op: "run" });
            runButton.value = "Pause";
        }
        else {
            this.worker.postMessage({ op: "pause" }, null);
            runButton.value = "Run";
        }
    }

    onReset(): void {
        this.worker.postMessage({ op: "pause" });
        this.worker.postMessage({ op: "reset" });

        let runButton = getInputElement("runButton");
        runButton.value = "Run";
    }

    onResetMaxes() : void {
        this.worker.postMessage({ op: "resetmaxes" });
    }

    onClearSettings(): void {
        this.appSettings = clearAppSettings();
        this.updateSettingsToUi();
    }

    getSimulationState() : void {
        this.worker.postMessage({ op: "getstate" });
        // DEBUG
        //this.worker.postMessage({ op: "getstatus" });
    }

    onWorkerMessage(msg: MessageEvent): void {
        switch (msg.data.op) {
            case "state":
                main.simState = <SimState>JSON.parse(msg.data.obj);
                main.drawing.draw(main.simState, main.simSettings);
                break;

            case "status": // debugging
                setStatus(msg.data.obj);
                break;

            case "shear detected!":
                alert("Eureka!  We found it!");
                break;
        }
    }

    onLoad() : void {
        main.drawing = new Drawing(<HTMLCanvasElement>document.getElementById("myCanvas"));

        main.updateSettingsToUi();

        main.worker = new Worker("runner.js");
        main.worker.onmessage = this.onWorkerMessage;

        main.sendSettingsToWorker();

        main.onResize();

        setInterval(() => main.getSimulationState(), cSimulationDrawRateMs); // run the show
    }

    onResize(): void {
        if (main.drawing != null) {
            let width: number = document.body.clientWidth - document.getElementById("settingsCell").offsetWidth;
            let height: number = document.body.clientHeight;
            main.drawing.onResize(width, height);
        }
    }

    onClose(): void {
        main.updateUiToSettings();
    }
}
let main: Main = null;

function onLoad(): void {
    main = new Main();

    window.onresize = main.onResize;
    window.onclose = main.onClose;

    main.onLoad();
}
