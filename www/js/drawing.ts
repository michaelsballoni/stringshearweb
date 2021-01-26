class Drawing {
    canvas: HTMLCanvasElement = null;
    ctxt: CanvasRenderingContext2D = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctxt = canvas.getContext("2d");
    }

    onResize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    computeStringMaxY(stringy: Stringy): number {
        let maxVal: number = 0.0;
        for (let i = 1; i < stringy.particles.length - 1; ++i) {
            let cur: number = stringy.particles[i].y;
            if (Math.abs(cur) > Math.abs(maxVal))
                maxVal = cur;
        }
        return maxVal;
    }

    draw(simState: SimState, simSettings: SimSettings) {
        this.ctxt.fillStyle = "white";
        this.ctxt.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let padding: number = 5;
        let rectCount: number = 5; // current, plus maxes for pos, vel, acl, and punch
        let width: number = this.canvas.width - padding * 2;
        let height: number = (this.canvas.height - padding * (rectCount + 1)) / rectCount;

        this.drawStringy
            (
                "Position",
                "black",
                new Rect(padding, padding, width - padding, height - padding),
                simState.curStringy,
                this.computeStringMaxY(simState.curStringy) / cOscillatorAmplitude,
                simState.time,
                padding,
                simSettings,
                0
            );

        this.drawStringy
            (
                "Max Amplitude",
                "red",
                new Rect(padding, padding * 2 + height * 1, width - padding, height - padding),
                simState.maxPosStringy,
                simState.maxPosStringy.maxPos / cOscillatorAmplitude,
                simState.time,
                padding,
                simSettings,
                1
            );

        this.drawStringy
            (
                "Max Velocity",
                "blue",
                new Rect(padding, padding * 3 + height * 2, width - padding, height - padding),
                simState.maxVelStringy,
                simState.maxVelStringy.maxPos / cOscillatorAmplitude,
                simState.time,
                padding,
                simSettings,
                2
            );

        this.drawStringy
            (
                "Max Acceleration",
                "green",
                new Rect(padding, padding * 4 + height * 3, width - padding, height - padding),
                simState.maxAclStringy,
                simState.maxAclStringy.maxPos / cOscillatorAmplitude,
                simState.time,
                padding,
                simSettings,
                3
            );

        this.drawStringy
            (
                "Max Punch",
                "purple",
                new Rect(padding, padding * 5 + height * 4, width - padding, height - padding),
                simState.maxPunchStringy,
                simState.maxPunchStringy.maxPos / cOscillatorAmplitude,
                simState.time,
                padding,
                simSettings,
                4
            );
    }

    drawStringy
    (
        name: string,
        color: string,
        rect: Rect,
        stringy: Stringy,
        maxVal: number,
        time: number,
        padding: number,
        simSettings: SimSettings,
        whichMaxToDraw: number
    ) : void {
        this.ctxt.fillStyle = "black";
        this.ctxt.strokeStyle = "black";

        //
        // Chalk out the box of the string
        //
        this.ctxt.strokeRect(rect.x, rect.y, rect.width, rect.height);

        let midY = rect.y + rect.height / 2;
        this.ctxt.beginPath();
        this.ctxt.moveTo(rect.x, midY);
        this.ctxt.lineTo(rect.x + rect.width, midY)
        this.ctxt.stroke();

        let midX = rect.x + rect.width / 2;
        this.ctxt.beginPath();
        this.ctxt.moveTo(midX, rect.y);
        this.ctxt.lineTo(midX, rect.y + rect.height);
        this.ctxt.stroke();

        //
        // Write the name and other info on the box
        //
        this.ctxt.font = "20px Arial";
        this.ctxt.strokeText(name, rect.x + padding, rect.y + 20);

        this.ctxt.font = "14px Arial";
        let maxStr = "max = " + maxVal.toFixed(4);
        this.ctxt.strokeText(maxStr, rect.right - 150, rect.top + 15);

        let timeStr = "time = " + time.toFixed(4) + "s";
        this.ctxt.strokeText(timeStr, rect.right - 150, rect.bottom - 10);

        let maxPosVal =
            Math.max
                (
                    Math.abs(stringy.maxPos),
                    cOscillatorAmplitude
                    *
                    (
                        simSettings.leftFrequencies.length
                        +
                        simSettings.rightFrequencies.length
                    )
                );
        let maxPosStr: string = (maxPosVal / cOscillatorAmplitude).toFixed(4);
        this.ctxt.strokeText(maxPosStr, rect.left + padding, rect.bottom - 10);

        this.ctxt.fillStyle = color;
        this.ctxt.strokeStyle = color;

        //
        // Draw the string
        //
        let particles: Particle[] = stringy.particles;
        {
            let pixelsPerParticle: number = rect.width / particles.length;
            let yMaxHeight = rect.height / 2;
            let yMiddle = rect.bottom - yMaxHeight;
            for (let p = 1; p < particles.length - 1; ++p) {
                let x: number = rect.left + p * pixelsPerParticle;

                let yFactor = particles[p].y / maxPosVal;
                let y: number = yMiddle - (yMaxHeight * yFactor);

                this.ctxt.fillRect(x, y, 1, 1); // a dot
            }
        }

        //
        // Draw the maximum particle, like, big
        //
        switch (whichMaxToDraw) {
            case 0:
                this.drawParticleBig(particles[0], rect, maxPosVal);
                this.drawParticleBig(particles[particles.length - 1], rect, maxPosVal);
                break;

            case 1:
                this.drawParticleBig(particles[stringy.maxPosIndex], rect, maxPosVal);
                break;

            case 2:
                this.drawParticleBig(particles[stringy.maxVelIndex], rect, maxPosVal);
                break;

            case 3:
                this.drawParticleBig(particles[stringy.maxAclIndex], rect, maxPosVal);
                break;

            case 4:
                this.drawParticleBig(particles[stringy.maxPunchIndex], rect, maxPosVal);
                break;

            default:
                throw new Error("Invalid whichMaxToDraw: " + whichMaxToDraw);
        }
    }

    drawParticleBig(particle: Particle, rect: Rect, maxPosVal: number) : void {
        let x: number = rect.left + (particle.x / cStringLength) * rect.width;

        let yMaxHeight = rect.height / 2;
        let yMiddle = rect.bottom - yMaxHeight;
        let yFactor = particle.y / maxPosVal;

        let y: number = yMiddle - (yMaxHeight * yFactor);

        this.ctxt.beginPath();
        this.ctxt.arc(x, y, 4, 0, 2 * Math.PI);
        this.ctxt.fill();
    }
}
