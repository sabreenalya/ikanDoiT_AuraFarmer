import { Logo } from "../shared/aquaCore";

export default function OrderTrackingPage({ order, onConnectDevice, onBackToWater }) {
  // Mock delivery status - show as delivered for demo
  const deliverySteps = [
    {
      status: "completed",
      label: "Order Confirmed",
      date: "Apr 1, 2026 10:30 AM",
      description: "Your order has been confirmed and is being prepared"
    },
    {
      status: "completed",
      label: "Processing",
      date: "Apr 1, 2026 2:45 PM",
      description: "Kit is being assembled and quality checked"
    },
    {
      status: "completed",
      label: "Shipped",
      date: "Apr 2, 2026 9:00 AM",
      description: "Package handed to courier - Track: IKD-MY-2026-4839",
      tracking: "IKD-MY-2026-4839"
    },
    {
      status: "completed",
      label: "Out for Delivery",
      date: "Apr 3, 2026 8:15 AM",
      description: "Your package is out for delivery today"
    },
    {
      status: "completed",
      label: "Delivered",
      date: "Apr 3, 2026 10:30 AM",
      description: "Package delivered successfully",
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simplified Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <Logo size={32} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={onBackToWater}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium transition-all group shadow-sm"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to Dashboard</span>
        </button>
        
        {/* Success Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Package Delivered!
            </h1>
            <p className="text-lg text-slate-600">
              Your ikanDoiT sensor kit has arrived
            </p>
          </div>

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Order Number</p>
              <p className="text-xl font-bold text-slate-900 font-mono">{order?.orderNumber || "IKD-20264839"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Delivery Date</p>
              <p className="text-xl font-bold text-slate-900">Apr 3, 2026</p>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Delivery Timeline
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-500"></div>

              <div className="space-y-8">
                {deliverySteps.map((step, idx) => (
                  <div key={idx} className="relative flex gap-6 items-start">
                    {/* Status icon */}
                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? step.highlight ? 'bg-emerald-500' : 'bg-emerald-500' 
                        : 'bg-slate-300'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-bold ${step.highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {step.label}
                        </h4>
                        <span className="text-xs text-slate-500">{step.date}</span>
                      </div>
                      <p className="text-sm text-slate-600">{step.description}</p>
                      {step.tracking && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-blue-900">{step.tracking}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#0B3D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ready to Get Started?
            </h3>
            <p className="text-slate-700 mb-6">
              Your sensor kit has been delivered! Now let's connect it to your dashboard and start monitoring your water quality in real-time.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0B3D91] text-white text-sm font-bold flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-1">Unbox Your Kit</p>
                    <p className="text-xs text-slate-600">Find the Device ID label on your sensor kit</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0B3D91] text-white text-sm font-bold flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-1">Connect Device</p>
                    <p className="text-xs text-slate-600">Enter your Device ID (IK-XXXXXX)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={onConnectDevice}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Connect Device Now
          </button>
          <button
            onClick={onBackToWater}
            className="w-full py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            I'll Do This Later
          </button>
        </div>
      </div>
    </div>
  );
}
