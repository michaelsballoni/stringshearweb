class Stringy {
    particles: Particle[] = new Array(cParticleCount);

    maxPos = 0.0;
    maxVel = 0.0;
    maxAcl = 0.0;
    maxPunch = 0.0;

    maxPosIndex = 0;
    maxVelIndex = 0;
    maxAclIndex = 0;
    maxPunchIndex = 0;

    startWork = 0.0;
    endWork = 0.0;

    maxStartWork = 0.0;
    maxEndWork = 0.0;

    constructor() {
        this.particles = new Array(cParticleCount);

        for (let i = 0; i < cParticleCount; ++i)
            this.particles[i] = new Particle(cStringLength * 1.0 * i / (cParticleCount - 1));
    }

    reset() : void {
        for (var i = 0; i < this.particles.length; ++i)
            this.particles[i].reset();

        this.resetMaxes();

        this.startWork = 0.0;
        this.endWork = 0.0;

        this.maxStartWork = 0.0;
        this.maxEndWork = 0.0;
    }

    resetMaxes() : void {
        this.maxPos = 0.0;
        this.maxVel = 0.0;
        this.maxAcl = 0.0;
        this.maxPunch = 0.0;

        this.maxPosIndex = 0;
        this.maxVelIndex = 0;
        this.maxAclIndex = 0;
        this.maxPunchIndex = 0;
    }

    clone() {
        let ret = new Stringy();

        for (var i = 0; i < this.particles.length; ++i)
            ret.particles[i] = this.particles[i].clone();

        ret.maxPos = this.maxPos;
        ret.maxVel = this.maxVel;
        ret.maxAcl = this.maxAcl;
        ret.maxPunch = this.maxPunch;

        ret.maxPosIndex = this.maxPosIndex;
        ret.maxVelIndex = this.maxVelIndex;
        ret.maxAclIndex = this.maxAclIndex;
        ret.maxPunchIndex = this.maxPunchIndex;

        ret.startWork = this.startWork;
        ret.endWork = this.endWork;
        ret.maxStartWork = this.maxStartWork;
        ret.maxEndWork = this.maxEndWork;

        return ret;
    }

    update
    (
        startPosY: number,
        endPosY: number,
        elapsedTime: number, // aka, timeSlice
        time: number,
        tension: number,
        stringConstant: number,
        totalAmplitude: number
    ): boolean // shear detected!
    {
        let particles: Particle[] = this.particles;

        // Set the endpoints and add to the work we've performed for them
        // and track the max work we've seen for the endpoints.
        let newStartWork: number = particles[0].setY(startPosY, elapsedTime, time);
        this.startWork += newStartWork;
        if (newStartWork > this.maxStartWork)
            this.maxStartWork = newStartWork;
            
        let newEndWork: number = particles[particles.length - 1].setY(endPosY, elapsedTime, time);
        this.endWork += newEndWork;
        if (newEndWork > this.maxEndWork)
            this.maxEndWork = newEndWork;

        // Compute neighbor factors.
        for (let i = 0; i < particles.length - 1; ++i) {
            let xGap: number = particles[i].x - particles[i + 1].x;
            let yGap: number = particles[i].y - particles[i + 1].y;
            let totalGap: number = Math.sqrt(xGap * xGap + yGap * yGap);
            particles[i].nextNeighborFactor = Math.abs((1.0 / totalGap) * yGap);
        }

        // Compute acceleration using neighbors.
        for (let i = 1; i < particles.length - 1; ++i) {
            let prevComponent: number = particles[i - 1].nextNeighborFactor;
            if (particles[i - 1].y < particles[i].y)
                prevComponent = -prevComponent;

            let nextComponent: number = particles[i].nextNeighborFactor;
            if (particles[i + 1].y < particles[i].y)
                nextComponent = -nextComponent;

            let newAcl: number = tension * (prevComponent + nextComponent) - cDamping * particles[i].vel;

            particles[i].punch = newAcl - particles[i].acl;

            particles[i].acl = newAcl;
        }

        // update velocity and position.
        for (let i = 1; i < particles.length - 1; ++i)
            particles[i].vel += particles[i].acl * elapsedTime;

        for (let i = 1; i < particles.length - 1; ++i)
            particles[i].y += particles[i].vel * elapsedTime;

        // Compute when a wave would propogate all the way down the string and back.
        let waveSpeed: number = stringConstant * Math.sqrt(tension);
        let timeTilWaveDownAndBack: number = cStringLength * 2.0 / waveSpeed;

        // Recompute maximums...after a wave has gone down and back.
        if (time > timeTilWaveDownAndBack) {
            this.updateMaxPos();
            this.updateMaxVel();
            this.updateMaxAcl();
            this.updateMaxPunch();
        }

        // Detect string shears.
        for (var i = 2; i < particles.length - 2; ++i) {
            let before: Particle = particles[i - 1];
            let cur: Particle = particles[i];
            let after: Particle = particles[i + 1];

            if
            (
                Math.abs(cur.y - before.y) > totalAmplitude
                &&
                Math.abs(cur.y - after.y) > totalAmplitude
            )
            {
                // particle flew off!
                return true;
            }
        }

        return false;
    }

    computeMax(valIndex: number) : any {
        let maxObj = { max: 0, maxIndex: 0 };
        for (let i = 1; i < this.particles.length - 1; ++i) {
            let cur: number = this.particles[i].getField(valIndex);
            if (Math.abs(cur) > Math.abs(maxObj.max)) {
                maxObj.max = cur;
                maxObj.maxIndex = i;
            }
        }
        return maxObj;
    };

    updateMaxPos(): void {
        let curMax: any = this.computeMax(1);
        this.maxPos = curMax.max;
        this.maxPosIndex = curMax.maxIndex;
    };

    updateMaxVel(): void {
        let curMax: any = this.computeMax(2);
        this.maxVel = curMax.max;
        this.maxVelIndex = curMax.maxIndex;
    };

    updateMaxAcl() : void {
        let curMax: any = this.computeMax(3);
        this.maxAcl = curMax.max;
        this.maxAclIndex = curMax.maxIndex;
    };

    updateMaxPunch(): void {
        let curMax: any = this.computeMax(4);
        this.maxPunch = curMax.max;
        this.maxPunchIndex = curMax.maxIndex;
    };
}

function selfTestStringy() {
    console.log("Stringy Self Test - Start");

    let s: Stringy = new Stringy();
    console.assert(s.particles.length == cParticleCount);

    let sp: Stringy = s.clone();
    console.assert(sp.particles.length == cParticleCount);

    let maxes: any = s.computeMax(1);
    console.assert(maxes.max == 0.0);
    console.assert(maxes.maxIndex == 0);

    s.reset();
    s.resetMaxes();

    s.update(0.0, 0.0, 1.0, 0.1, 1000000, 3.1415926, 1.0);

    s.updateMaxPos();
    s.updateMaxVel();
    s.updateMaxAcl();
    s.updateMaxPunch();

    console.log("Stringy Self Test - Complete");
}
selfTestStringy();
