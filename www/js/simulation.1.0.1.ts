class Simulation {
    settings: SimSettings = new SimSettings();

    time: number = 0.0;

    currentString: Stringy;

    maxPosString: Stringy;
    maxVelString: Stringy;
    maxAclString: Stringy;
    maxPunchString: Stringy;

    maxPosTime: number = 0.0;
    maxVelTime: number = 0.0;
    maxAclTime: number = 0.0;
    maxPunchTime: number = 0.0;

    // DEBUG - Call "getstate" and it will return "state" with the value of this
    //       - Poor man's real-time debugger
    probe: string = "";

    constructor() {
        this.currentString = new Stringy();

        this.maxPosString = this.currentString.clone();
        this.maxVelString = this.currentString.clone();
        this.maxAclString = this.currentString.clone();
        this.maxPunchString = this.currentString.clone();
    }

    update() : boolean {
        let startPos = 0.0;
        for (let f = 0; f < this.settings.leftFrequencies.length; ++f) {
            startPos += 
                this.getOscillatorPostion
                (
                    this.settings.leftFrequencies[f],
                    cOscillatorAmplitude,
                    this.settings.outOfPhase,
                    this.time
                );
        }

        let endPos = 0.0;
        for (let f = 0; f < this.settings.rightFrequencies.length; ++f) {
            endPos += 
                this.getOscillatorPostion
                (
                    this.settings.rightFrequencies[f],
                    cOscillatorAmplitude,
                    0.0, // outOfPhase
                    this.time
                );
        }

        let stringShearDetected: boolean =
            this.currentString.update
            (
                startPos,
                endPos,
                this.settings.timeSlice,
                this.time,
                this.settings.tension,
                cStringConstant,
                cOscillatorAmplitude *
                    (this.settings.leftFrequencies.length + this.settings.rightFrequencies.length)
            );

        if (Math.abs(this.currentString.maxPos) > Math.abs(this.maxPosString.maxPos)) {
            this.maxPosString = this.currentString.clone();
            this.maxPosTime = this.time;
        }

        if (Math.abs(this.currentString.maxVel) > Math.abs(this.maxVelString.maxVel)) {
            this.maxVelString = this.currentString.clone();
            this.maxVelTime = this.time;
        }

        if (Math.abs(this.currentString.maxAcl) > Math.abs(this.maxAclString.maxAcl)) {
            this.maxAclString = this.currentString.clone();
            this.maxAclTime = this.time;
        }

        if (Math.abs(this.currentString.maxPunch) > Math.abs(this.maxPunchString.maxPunch)) {
            this.maxPunchString = this.currentString.clone();
            this.maxPunchTime = this.time;
        }

        this.time += this.settings.timeSlice;

        return stringShearDetected;
    };

    reset() : void {
        this.time = 0.0;
        this.currentString.reset();
        this.resetMaxes();
    };

    resetMaxes() : void {
        this.currentString.resetMaxes();

        this.maxPosTime = 0.0;
        this.maxVelTime = 0.0;
        this.maxAclTime = 0.0;
        this.maxPunchTime = 0.0;

        this.maxPosString.reset();
        this.maxVelString.reset();
        this.maxAclString.reset();
        this.maxPunchString.reset();
    };

    getSimState(stateObj: SimState) {
        stateObj.time = this.time;

        stateObj.curStringy = this.currentString.clone();

        if (stateObj.maxPosStringy == null || Math.abs(stateObj.maxPosStringy.maxPos) < Math.abs(this.maxPosString.maxPos)) {
            stateObj.maxPosStringy = this.maxPosString.clone();
            stateObj.maxPosTime = this.time;
        }

        if (stateObj.maxVelStringy == null || Math.abs(stateObj.maxVelStringy.maxVel) < Math.abs(this.maxVelString.maxVel)) {
            stateObj.maxVelStringy = this.maxVelString.clone();
            stateObj.maxVelTime = this.time;
        }

        if (stateObj.maxAclStringy == null || Math.abs(stateObj.maxAclStringy.maxAcl) < Math.abs(this.maxAclString.maxAcl)) {
            stateObj.maxAclStringy = this.maxAclString.clone();
            stateObj.maxAclTime = this.time;
        }

        if (stateObj.maxPunchStringy == null || Math.abs(stateObj.maxPunchStringy.maxPunch) < Math.abs(this.maxPunchString.maxPunch)) {
            stateObj.maxPunchStringy = this.maxPunchString.clone();
            stateObj.maxPunchTime = this.time;
        }
    };

    getOscillatorPostion
        (
            frequency: number,
            amplitude: number,
            outOfPhase: number,
            time: number
        ): number {
        var radians = 2.0 * Math.PI * frequency * time;
        radians -= outOfPhase * Math.PI;

        if (radians < 0.0)
            radians = 0.0;

        var retVal = Math.sin(radians) * amplitude;
        return retVal;
    };
}

function selfTestSimulation() {
    console.log("Simulation Self Test - Start");

    let s: Simulation = new Simulation();

    let pos: number = s.getOscillatorPostion(10.0, 1.0, 0.0, 0.0);
    console.assert(!isNaN(pos), "getOscillatorPostion returns NaN");

    let stateObj: SimState = new SimState();
    s.getSimState(stateObj);
    s.getSimState(stateObj);

    s.reset();
    s.resetMaxes();

    s.update();

    console.log("Simulation Self Test - Complete");
}
selfTestSimulation();
