import { useState } from "react";
import { Logo } from "../shared/aquaCore";

export default function CheckoutPage({ cart, onComplete, onBack }) {
  const [step, setStep] = useState(1); // 1: shipping, 2: payment
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("fpx");
  const [loading, setLoading] = useState(false);

  const shippingCost = 15;
  const total = cart.price + shippingCost;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderNumber = `IK${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    onComplete(shippingInfo, paymentMethod);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simplified Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Logo size={32} />
          <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            Step {step} of 2
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="md:col-span-2 space-y-6">
            {step === 1 ? (
              <form onSubmit={handleShippingSubmit} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="+60123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address2}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Kuala Lumpur"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Selangor">Selangor</option>
                        <option value="Kuala Lumpur">Kuala Lumpur</option>
                        <option value="Johor">Johor</option>
                        <option value="Penang">Penang</option>
                        <option value="Perak">Perak</option>
                        <option value="Kedah">Kedah</option>
                        <option value="Kelantan">Kelantan</option>
                        <option value="Terengganu">Terengganu</option>
                        <option value="Pahang">Pahang</option>
                        <option value="Melaka">Melaka</option>
                        <option value="Negeri Sembilan">Negeri Sembilan</option>
                        <option value="Sabah">Sabah</option>
                        <option value="Sarawak">Sarawak</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Postcode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postcode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postcode: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold hover:shadow-lg transition-all"
                  >
                    Continue to Payment 
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'fpx' ? 'border-[#0B3D91] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="fpx"
                      checked={paymentMethod === 'fpx'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#0B3D91]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Online Banking (FPX)</p>
                      <p className="text-sm text-slate-600">Pay securely with your bank</p>
                    </div>
                    <svg className="w-8 h-8 text-[#0B3D91]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#0B3D91] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#0B3D91]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Credit / Debit Card</p>
                      <p className="text-sm text-slate-600">Visa, Mastercard, Amex</p>
                    </div>
                    <svg className="w-8 h-8 text-[#0B3D91]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'border-[#0B3D91] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="ewallet"
                      checked={paymentMethod === 'ewallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#0B3D91]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">E-Wallet</p>
                      <p className="text-sm text-slate-600">Touch 'n Go, GrabPay, Boost</p>
                    </div>
                    <svg className="w-8 h-8 text-[#0B3D91]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18v-7h6v7H9z"/>
                    </svg>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Secure Payment</p>
                      <p className="text-blue-700">Your payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                    disabled={loading}
                  >
                  Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Complete Purchase - RM ${total}`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#0B3D91]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{cart.name}</p>
                    <p className="text-sm text-slate-600">ikanDoiT Sensor Kit</p>
                    <p className="text-xs text-slate-500 mt-1">Qty: 1</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">RM {cart.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold text-slate-900">RM {shippingCost}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-xl text-slate-900">RM {total}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{cart.recommended ? '2' : '1'} year warranty included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
