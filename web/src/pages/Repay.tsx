import { usePosition } from "@/hooks/usePosition";
import { RepayModal } from "@/components/actions/RepayModal";
import { useNavigate } from "react-router-dom";

export default function Repay() {
  const navigate = useNavigate();
  const { data: position, isLoading } = usePosition();

  if (isLoading || !position) {
    return (
      <div className="container py-5 page-transition" style={{ maxWidth: 560 }}>
        <div className="skeleton" style={{ height: 360, borderRadius: "var(--r-3)" }} />
      </div>
    );
  }

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 560 }}>
      <RepayModal show={true} onHide={() => navigate("/dashboard")} position={position} onFullRepay={() => navigate("/dashboard")} />
    </div>
  );
}
