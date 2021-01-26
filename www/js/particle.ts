class Particle {
    x: number = 0.0;
    y: number = 0.0;
    vel: number = 0.0;
    acl: number = 0.0;
    punch: number = 0.0;
    nextNeighborFactor: number = 0.0;

    constructor(xVal: number)
    {
        this.x = xVal;
    }

    clone(): Particle {
        let obj = new Particle(this.x);
        obj.y = this.y;
        obj.vel = this.vel;
        obj.acl = this.acl;
        obj.punch = this.punch;
        obj.nextNeighborFactor = this.nextNeighborFactor;
        return obj;
    }

    reset() : void {
        // NOTE: leave X alone, as it stays put on the string
        this.y = this.vel = this.acl = this.punch = this.nextNeighborFactor = 0.0;
    }

    getField(idx: number): number {
        switch (idx) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.vel;
            case 3: return this.acl;
            case 4: return this.punch;
            default: throw new Error("Invalid index to get: " + idx);
        }
    }

    setY(newPosY: number, elapsedTime: number, time: number): number {
        let newDisplacement: number = (newPosY - this.y);

        let newVel: number = newDisplacement / elapsedTime;

        let newAcl: number = (newVel - this.vel) / elapsedTime;
        if (time <= elapsedTime)
            newAcl = 0.0;

        let newPunch: number = (newAcl - this.acl) / elapsedTime;
        if (time <= elapsedTime * 2.0)
            newPunch = 0.0;

        let workDone = newDisplacement * this.acl;

        this.y = newPosY;
        this.vel = newVel;
        this.acl = newAcl;
        this.punch = newPunch;

        return Math.abs(workDone);
    }
}

function selfTestParticle() {
    console.log("Particle Self Test - Start");

    let p: Particle = new Particle(10.0);
    console.assert(p.x == 10.0);
    console.assert(p.getField(0) == 10.0);

    p.setY(1.0, 1.0, 0.1);
    console.assert(p.getField(1) == 1.0);

    let pc: Particle = p.clone();
    console.assert(pc.x == 10.0);
    console.assert(pc.y == 1.0);

    p.reset();
    console.assert(p.y == 0.0);

    console.log("Particle Self Test - Complete");
}
selfTestParticle();
