import { useState } from "react";
import { Logo } from "../shared/aquaCore";
import sensorImg from "../assets/ikanDoiT_sensor_kit.png";


export default function ProductPage({ onBuyNow, onBack }) {
  const UNIT_PRICE = 1799;
  const KIT = {
    name: "All-in-one Sensor Kit",
    price: UNIT_PRICE,
    warrantyYears: 2,
    sensors: ["DO", "Temperature", "pH", "NH3", "NO3", "EC/Salinity"],
    features: [
      "ESP32 DEVKIT V1 Controller",
      "6-in-1 Water Quality Sensors (DO, Temp, pH, NH3, NO3, EC)",
      "Premium Waterproof Enclosure",
      "WiFi Antenna (2.4GHz)",
      "Power Supply (5V/3A)",
      "2 Year Warranty",
    ],
  };

  const [quantity, setQuantity] = useState(1);
  const safeQty = Math.max(1, Number.isFinite(quantity) ? quantity : 1);
  const subtotal = KIT.price * safeQty;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ikanDoiT
              </p>
              <p className="text-xs text-slate-500">Sensor Kit</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Product Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <img
                src={sensorImg}
                alt="ikanDoiT Sensor Kit"
                className="w-full rounded-lg"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What's Included
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ESP32 DEVKIT V1 Microcontroller
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  6-in-1 Water Quality Sensors (DO, Temp, pH, NH3, NO3, EC)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Waterproof Enclosure
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  WiFi Antenna & Power Supply
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quick Start Guide
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Microcontroller</p>
                  <p className="font-semibold text-slate-900">ESP32</p>
                </div>
                <div>
                  <p className="text-slate-500">Power</p>
                  <p className="font-semibold text-slate-900">5V / 3A</p>
                </div>
                <div>
                  <p className="text-slate-500">Connectivity</p>
                  <p className="font-semibold text-slate-900">WiFi 2.4GHz</p>
                </div>
                <div>
                  <p className="text-slate-500">Update Rate</p>
                  <p className="font-semibold text-slate-900">30 seconds</p>
                </div>
                <div>
                  <p className="text-slate-500">Accuracy</p>
                  <p className="font-semibold text-slate-900">±0.1</p>
                </div>
                <div>
                  <p className="text-slate-500">IP Rating</p>
                  <p className="font-semibold text-slate-900">IP67</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Purchase */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ikanDoiT Sensor Kit
              </h1>
              <p className="text-lg text-slate-600 mb-4">
                Smart Water Quality Monitoring for Aquaculture
              </p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-slate-600">(23 reviews)</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-lg space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-4">SENSOR KIT</p>

                <div className="relative p-6 rounded-xl border-2 border-[#0B3D91] bg-blue-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{KIT.name}</h3>
                      <p className="text-sm text-slate-600">Complete monitoring solution</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-900">RM {KIT.price}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All sensors included (DO, Temp, pH, NH3, NO3, EC)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Waterproof enclosure + power supply included
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {KIT.warrantyYears} year warranty included
                    </li>
                  </ul>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white border border-blue-200 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Quantity</p>
                      <p className="text-[11px] text-slate-500">Buy multiple kits for multiple ponds</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                        className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={safeQty}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-14 h-9 rounded-lg border border-slate-300 text-center text-sm font-semibold text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, (parseInt(q, 10) || 1) + 1))}
                        className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-900">RM {subtotal}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onBuyNow({
                    ...KIT,
                    unitPrice: KIT.price,
                    quantity: safeQty,
                    price: subtotal,
                  })
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Buy Now - RM {subtotal}
              </button>
                   <button
                        type="button"
                  onClick={onBack}
                  className="w-full py-3 rounded-xl border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all"
                >
                Back 
                </button>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200 text-sm text-slate-600">
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}
