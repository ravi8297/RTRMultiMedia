"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CourseType {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  duration: string;
  lessons: number;
  instructor: string;
  category: string;
  originalPrice?: number;
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  courseTitle: string;
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses/${params.id}/checkout`);
      return;
    }

    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data.course);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [session, status, params.id, router]);

  // Create Razorpay order when course is loaded
  useEffect(() => {
    if (!course || !session) return;
    const courseId = course._id;
    const userId = session.user.id;

    async function createOrder() {
      try {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            userId,
          }),
        });

        if (!res.ok) throw new Error("Failed to create order");
        const data = await res.json();
        setRazorpayOrder(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    createOrder();
  }, [course, session]);

  // Open Razorpay checkout
  const openRazorpay = async () => {
    if (!razorpayOrder || !session) return;

    setProcessing(true);
    setError("");

    try {
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        if (!course || !session) {
          setProcessing(false);
          return;
        }
        const courseId = course._id;
        const userId = session.user.id;
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "RTR Media Solutions",
          description: `Enrollment for ${razorpayOrder.courseTitle}`,
          order_id: razorpayOrder.orderId,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  courseId: courseId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                setPaymentSuccess(true);
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);
              } else {
                setError("Payment verification failed");
              }
            } catch (err: any) {
              setError("Payment verification failed");
            } finally {
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
          prefill: {
            name: session.user.name || "",
            email: session.user.email || "",
            contact: "",
          },
          theme: {
            color: "#0891b2",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setError("Failed to load Razorpay");
        setProcessing(false);
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError("Failed to initialize payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48 mx-auto" />
          <div className="h-64 bg-gray-200 rounded-xl mx-auto w-full max-w-md" />
        </div>
      </main>
    );
  }

  if (error && !razorpayOrder) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-700 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/courses/${params.id}`)}
            className="px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const discount = course?.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-8">Enroll Now</h1>

        {/* Course Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={course?.thumbnail || "https://images.unsplash.com/photo-1515879202570-99db16349c24?w=400&h=250&fit=crop"}
              alt={course?.title}
              className="w-24 h-16 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-lg font-bold text-navy-700">{course?.title}</h2>
              <p className="text-sm text-gray-600">{course?.duration}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Course Fee</span>
              <span className="font-semibold text-teal-600">₹{course?.price}</span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex justify-between text-gray-400 line-through">
                  <span>Original Price</span>
                  <span>₹{course?.originalPrice}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>{discount}% OFF</span>
                </div>
              </>
            )}
            <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-navy-700">
              <span>Total</span>
              <span>₹{course?.price}</span>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-navy-700 mb-4">Student Information</h2>
          <div className="space-y-3 text-gray-600">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="font-medium">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="font-medium capitalize">{session?.user?.role}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-navy-700 mb-4">Payment Method</h2>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-bold">R</span>
            </div>
            <div>
              <p className="font-medium text-navy-700">Pay with Razorpay</p>
              <p className="text-sm text-gray-500">Pay securely with credit/debit card or UPI</p>
            </div>
          </div>
        </div>

        {/* Enroll Button */}
        <button
          onClick={openRazorpay}
          disabled={processing}
          className={`w-full px-6 py-4 text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors text-lg shadow-lg ${
            processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : (
            `Confirm Enrollment - ₹${course?.price}`
          )}
        </button>

        {error && !razorpayOrder && (
          <p className="text-center text-sm text-red-500 mt-4">{error}</p>
        )}

        {paymentSuccess && (
          <div className="mt-6 text-center">
            <div className="inline-block px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
              ✅ Payment Successful! Redirecting to dashboard...
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-4">
          Secure checkout powered by Razorpay. Your payment information is encrypted.
        </p>
      </div>
    </main>
  );
}