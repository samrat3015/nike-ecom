import { SuccessClient } from "./SuccessClient";
import { Order } from "@/types";

interface Props {
  params: { order_number: string };
}

export default async function Success({ params }: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const res = await fetch(`${apiBaseUrl}/order-data/${params.order_number}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch order data");
    }

    const order: Order = await res.json();

    return <SuccessClient order={order} />;
  } catch (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load order details.
      </div>
    );
  }
}
