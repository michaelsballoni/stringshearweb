class Main {
    appSettings: AppSettings = getAppSettings();
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
    }

    updateUiToSettingsWithAlerts(): boolean {
        let msg: string = this.updateUiToSettings();
        if (msg) {
            alert(msg);
            return false;
        }
        else
            return true;
    }

    updateUiToSettings(): string {
        if (isNaN(parseFloat(getInputElement("timeSlice").value)))
            return "Invalid time slice: " + getInputElement("timeSlice").value;
        this.appSettings.timeSlice = getInputElement("timeSlice").value;

        this.appSettings.simulationSpeed = getInputElement("speed").value;

        if (isNaN(parseFloat(getInputElement("tension").value)))
            return "Invalid tension: " + getInputElement("tension").value;
        this.appSettings.tension = getInputElement("tension").value;

        this.appSettings.leftEnabled = getInputElement("leftEnabled").checked;
        this.appSettings.leftFrequencies = getInputElement("leftFrequencies").value;

        this.appSettings.rightEnabled = getInputElement("rightEnabled").checked;
        this.appSettings.rightFrequencies = getInputElement("rightFrequencies").value;

        if (isNaN(parseFloat(getInputElement("outOfPhase").value)))
            return "Invalid out of phase: " + getInputElement("outOfPhase").value;
        this.appSettings.outOfPhase = getInputElement("outOfPhase").value;

        saveAppSettings(this.appSettings);
        this.simSettings = this.appSettings.toSimSettings();
        this.sendSettingsToWorker();
        return null; // no error, success
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

        if (!this.updateUiToSettingsWithAlerts())
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
        clearAppSettings();

        this.appSettings = new AppSettings();
        this.simSettings = this.appSettings.toSimSettings();

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

        main.worker = new Worker("js/runner.js");
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

    onBeforeClose(event: any): void {
        console.log("onBeforeClose called");

        let errorMsg: string = this.updateUiToSettings();
        if (!errorMsg) {
            console.log("onBeforeClose success");
            return;
        }

        console.log("onBeforeClose failure");
        event.preventDefault();
        event.returnValue = errorMsg;
    }
}
let main: Main = null;

function onLoad(): void {
    main = new Main();
    main.onLoad();

    window.addEventListener("resize", function (event) { main.onResize(); });
    window.addEventListener("beforeunload", function (event) { main.onBeforeClose(event); });

    getInputElement("speed").onchange = function (event) { main.updateUiToSettings(); };
}
