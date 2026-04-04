import { useState } from "react";
import { Logo } from "../shared/aquaCore";

export default function DeviceConnectionPage({ onConnect, onBack }) {
  const [step, setStep] = useState(1); // 1: input, 2: connecting, 3: success
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [deviceIdError, setDeviceIdError] = useState("");

  const validateDeviceId = (value) => {
    if (!value) {
      setDeviceIdError("");
      return;
    }
    if (!value.startsWith("IK-")) {
      setDeviceIdError('Device ID must start with "IK-" (e.g. IK-A1B2C3)');
    } else if (value.length < 9) {
      const remaining = 9 - value.length;
      setDeviceIdError(`${remaining} more character${remaining > 1 ? "s" : ""} needed`);
    } else {
      setDeviceIdError("");
    }
  };

  const handleDeviceIdChange = (e) => {
    const val = e.target.value.toUpperCase();
    setDeviceId(val);
    validateDeviceId(val);
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    // Final guard
    if (!deviceId.startsWith("IK-") || deviceId.length < 9) {
      setDeviceIdError("Please enter a valid Device ID in the format IK-XXXXXX");
      return;
    }

    setDeviceIdError("");
    setStep(2);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    await new Promise(resolve => setTimeout(resolve, 1500));
    await new Promise(resolve => setTimeout(resolve, 1500));

    const device = {
      id: deviceId,
      name: deviceName || `Device ${deviceId.slice(-6)}`,
      status: "online",
      lastSeen: new Date(),
      sensors: 6
    };

    setConnectedDevice(device);
    setStep(3);
  };

  const handleGoToDashboard = () => {
    onConnect(connectedDevice);
  };

  const isValid = deviceId.length === 9 && !deviceIdError;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ikanDoiT
              </p>
              <p className="text-xs text-slate-500">Device Setup</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">

        {/* ── Step 1: Input ── */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Connect Your Sensor Kit
              </h1>
              <p className="text-lg text-slate-600">
                Let's get your ikanDoiT sensor kit connected to start monitoring
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Image Reference */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0B3D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Find Your Device ID
                </h3>

                <div className="mb-4">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f8fafc' width='400' height='300'/%3E%3Cg transform='translate(50,30)'%3E%3Crect x='0' y='0' width='300' height='180' rx='15' fill='white' stroke='%23e2e8f0' stroke-width='3'/%3E%3Ccircle cx='150' cy='80' r='50' fill='%230B3D91'/%3E%3Cpath d='M130,80 Q150,65 170,80 Q150,95 130,80' fill='white'/%3E%3Ctext x='150' y='140' text-anchor='middle' fill='%230B3D91' font-size='18' font-weight='bold'%3EikanDoiT%3C/text%3E%3Ctext x='150' y='160' text-anchor='middle' fill='%23475569' font-size='12'%3ESENSOR KIT%3C/text%3E%3Crect x='80' y='180' width='140' height='50' rx='8' fill='%23FEF3C7' stroke='%23F59E0B' stroke-width='2'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='%2392400E' font-size='11' font-weight='bold'%3EDEVICE ID%3C/text%3E%3Ctext x='150' y='218' text-anchor='middle' fill='%230B3D91' font-size='16' font-weight='bold' font-family='monospace'%3EIK-A1B2C3%3C/text%3E%3Cpath d='M220,205 L260,205 L260,180 L265,180 L260,173 L255,180 L260,180' stroke='%23F59E0B' stroke-width='2' fill='none'/%3E%3Ctext x='270' y='185' fill='%23F59E0B' font-size='12' font-weight='bold'%3EOn label%3C/text%3E%3C/g%3E%3C/svg%3E"
                    alt="Device ID Location"
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-900">
                    <span className="font-semibold">💡 Tip:</span> The Device ID is printed on a yellow label on your sensor kit enclosure.
                  </p>
                </div>
              </div>

              {/* Right: Form */}
              <form onSubmit={handleConnect} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">

                {/* ── Device ID Field with inline validation ── */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Device ID <span className="text-red-500">*</span>
                  </label>

                  {/* Input wrapper for icon inside */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={deviceId}
                      onChange={handleDeviceIdChange}
                      placeholder="IK-A1B2C3"
                      maxLength={9}
                      className={`w-full px-4 py-3 pr-10 rounded-xl border-2 outline-none transition-all font-mono text-lg
                        ${deviceIdError
                          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : isValid
                            ? "border-emerald-400 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            : "border-slate-300 focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100"
                        }`}
                    />

                    {/* Icon on the right inside input */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {deviceIdError && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {isValid && (
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Message below the field — error / success / hint */}
                  {deviceIdError ? (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2 font-medium">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {deviceIdError}
                    </p>
                  ) : isValid ? (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Looks good!
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">
                      ℹ️ Format: IK- followed by 6 characters (e.g., IK-A1B2C3)
                    </p>
                  )}
                </div>

                {/* Device Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Device Name{" "}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="My Fish Pond 1"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Give your device a friendly name to easily identify it
                  </p>
                </div>

                {/* Submit button — disabled while invalid */}
                <button
                  type="submit"
                  disabled={!!deviceIdError || deviceId.length === 0}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg transition-all
                    hover:shadow-xl hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  Connect Device
                </button>
                <button
                        type="button"
                  onClick={onBack}
                  className="w-full py-3 rounded-xl border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all"
                >
                Back 
                </button>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-center text-sm text-slate-600">
                    Need help?{" "}
                    <a href="#" className="text-[#0B3D91] font-semibold hover:underline">
                      View Setup Guide
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Step 2: Connecting ── */}
        {step === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-6 animate-pulse">
                <svg className="w-14 h-14 text-[#0B3D91] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Connecting Your Device...
              </h2>
              <p className="text-slate-600 mb-8">
                This may take up to 30 seconds
              </p>

              <div className="space-y-4 text-left">
                <ConnectingStep label="Checking device ID" status="done" />
                <ConnectingStep label="Authenticating device" status="done" />
                <ConnectingStep label="Syncing sensor data" status="progress" />
                <ConnectingStep label="Finalizing setup" status="pending" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Device Connected!
                </h2>
                <p className="text-lg text-slate-600">
                  Your sensor kit is ready to start monitoring
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0B3D91] to-[#0288D1] flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{connectedDevice?.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">Device ID: {connectedDevice?.id}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-700">
                          <span className="font-semibold">Status:</span> Online
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-semibold">Sensors:</span> {connectedDevice?.sensors} active
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-semibold">Last seen:</span> Just now
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Start Monitoring 
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectingStep({ label, status }) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" && (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "progress" && (
        <svg className="w-6 h-6 text-[#0B3D91] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {status === "pending" && (
        <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
      )}
      <span className={`${status === "pending" ? "text-slate-400" : "text-slate-700"} font-medium`}>
        {label}
      </span>
    </div>
  );
}