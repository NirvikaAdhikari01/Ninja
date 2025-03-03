import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function KhaltiPaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function processPayment() {
      const token = searchParams.get("token");
      const amount = searchParams.get("amount");

      if (!token || !amount) {
        alert("Invalid payment details");
        navigate("/");
        return;
      }

      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment/khalti-return`, {
          token,
          amount,
        });

        if (response.data.success) {
          alert("Payment successful! Redirecting...");
          navigate("/dashboard");
        } else {
          alert("Payment failed. Please try again.");
          navigate("/checkout");
        }
      } catch (error) {
        console.error("Error processing Khalti payment:", error);
        alert("Something went wrong. Please try again.");
        navigate("/checkout");
      }
    }

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h2 className="text-xl font-bold">Processing your payment...</h2>
    </div>
  );
}

export default KhaltiPaymentReturnPage;
