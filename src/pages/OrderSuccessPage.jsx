import { Logo } from "../shared/aquaCore";

export default function OrderSuccessPage({ order, onGoToDashboard }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D91] via-[#1565C0] to-[#0288D1] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Order Confirmed!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your ikanDoiT Sensor Kit is on the way
          </p>

          {/* Order Number */}
          <div className="inline-block bg-slate-100 px-6 py-3 rounded-xl mb-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Order Number</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{order.orderNumber}</p>
          </div>

          {/* Order Details */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Delivery Estimate</p>
                <p className="text-lg font-semibold text-slate-900">3-5 Business Days</p>
                <p className="text-sm text-slate-600 mt-1">📦 Standard Shipping</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Confirmation Sent To</p>
                <p className="text-lg font-semibold text-slate-900 truncate">{order.shippingInfo.email}</p>
                <p className="text-sm text-slate-600 mt-1">✉️ Check your inbox</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-8"></div>

          {/* What's Next */}
          <div className="text-left mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#0B3D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              What's Next?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#0B3D91] font-bold flex items-center justify-center">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Wait for your sensor kit to arrive</p>
                  <p className="text-sm text-slate-600">We'll send tracking info to your email</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#0B3D91] font-bold flex items-center justify-center">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Find your Device ID on the kit label</p>
                  <p className="text-sm text-slate-600">It starts with "IK-" followed by 6 characters</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#0B3D91] font-bold flex items-center justify-center">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Connect it to your dashboard</p>
                  <p className="text-sm text-slate-600">Start monitoring water quality in real-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={onGoToDashboard}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Track My Order 
            </button>
            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
            Print Receipt
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3 text-left">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">While you wait...</p>
                  <p className="text-blue-700">
                    Check out our{" "}
                    <a href="#" className="underline font-semibold hover:text-blue-900">
                      Setup Guide
                    </a>
                    {" "}to learn how to install and configure your sensor kit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo at bottom */}
        <div className="mt-8 flex items-center justify-center gap-3 text-white/80">
          <Logo size={24} />
          <p className="text-sm">ikanDoiT</p>
        </div>
      </div>
    </div>
  );
}
