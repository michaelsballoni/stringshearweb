const cStringLength = 1.0; // meter
const cParticleCount = 1000; // mm each "particle", seams reasonable

const cDefaultTension = 399565.0; // a magic number, found by trial and error, maximizing amplitude at 10 Hz
const cStringConstant = 0.03164; // another magic number

const cOscillatorAmplitude = 0.001; // mm, small, keeps things under control...mostly...

const cDamping = 1.0; // keep things from getting out of hand

const cSimulationDrawRateMs = 100; // 10 fps, seems smooth enough, keeps simulation going strong
