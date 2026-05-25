import { usePosition } from "@/hooks/usePosition";
import { usePrice } from "@/hooks/usePrice";
import { BorrowModal } from "@/components/actions/BorrowModal";
import { useNavigate } from "react-router-dom";

export default function Borrow() {
  const navigate = useNavigate();
  const { data: position, isLoading: posLoading } = usePosition();
  const { data: price, isLoading: priceLoading } = usePrice();

  if (posLoading || priceLoading || !position || !price) {
    return (
      <div className="container py-5 page-transition" style={{ maxWidth: 560 }}>
        <div className="skeleton" style={{ height: 480, borderRadius: "var(--r-3)" }} />
      </div>
    );
  }

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 560 }}>
      <BorrowModal show={true} onHide={() => navigate("/dashboard")} position={position} price={price} />
    </div>
  );
}
