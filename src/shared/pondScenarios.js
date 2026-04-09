// Random params with realistic pond scenarios

const POND_SCENARIOS = [
  // Good pond
  () => ({
    DO: +(6.5 + Math.random() * 1.5).toFixed(1),
    pH: +(7.2 + Math.random() * 0.4).toFixed(1),
    Temp: +(27 + Math.random() * 2).toFixed(1),
    NH3: +(0.008 + Math.random() * 0.008).toFixed(3),
    NO3: +(7 + Math.random() * 5).toFixed(1),
    Salinity: +(3 + Math.random() * 3).toFixed(1),
  }),
  // Low oxygen warning
  () => ({
    DO: +(4.5 + Math.random() * 1).toFixed(1),
    pH: +(7 + Math.random() * 0.5).toFixed(1),
    Temp: +(30 + Math.random() * 2).toFixed(1),
    NH3: +(0.018 + Math.random() * 0.008).toFixed(3),
    NO3: +(12 + Math.random() * 6).toFixed(1),
    Salinity: +(4 + Math.random() * 2).toFixed(1),
  }),
  // High ammonia warning
  () => ({
    DO: +(6 + Math.random() * 1).toFixed(1),
    pH: +(7.5 + Math.random() * 0.3).toFixed(1),
    Temp: +(28 + Math.random() * 1).toFixed(1),
    NH3: +(0.03 + Math.random() * 0.02).toFixed(3),
    NO3: +(18 + Math.random() * 5).toFixed(1),
    Salinity: +(4 + Math.random() * 2).toFixed(1),
  }),
  // High nitrate warning
  () => ({
    DO: +(6.2 + Math.random() * 0.8).toFixed(1),
    pH: +(7.3 + Math.random() * 0.3).toFixed(1),
    Temp: +(28 + Math.random() * 1).toFixed(1),
    NH3: +(0.015 + Math.random() * 0.005).toFixed(3),
    NO3: +(22 + Math.random() * 8).toFixed(1),
    Salinity: +(4 + Math.random() * 2).toFixed(1),
  }),
  // pH off warning
  () => ({
    DO: +(6.5 + Math.random() * 1).toFixed(1),
    pH: +(8.2 + Math.random() * 0.3).toFixed(1),
    Temp: +(28 + Math.random() * 1).toFixed(1),
    NH3: +(0.01 + Math.random() * 0.008).toFixed(3),
    NO3: +(10 + Math.random() * 5).toFixed(1),
    Salinity: +(4 + Math.random() * 2).toFixed(1),
  }),
];

export const makeFirstPondParams = () => POND_SCENARIOS[0]();

export const makeNewPondParams = () => {
  const idx = 1 + Math.floor(Math.random() * (POND_SCENARIOS.length - 1));
  return POND_SCENARIOS[idx]();
};
