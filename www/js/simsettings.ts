class SimSettings {
    timeSlice: number = 0.01 / 1000.0; // seconds
    tension: number = cDefaultTension;

    delayMs: number = 0;
    runCount: number = 1;

    leftFrequencies: number[] = [20.0];  // a nice couple
    rightFrequencies: number[] = [30.0]; // of vibrations to start with

    outOfPhase: number = 0.5;
}
