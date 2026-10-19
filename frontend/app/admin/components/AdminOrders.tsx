"use client";

import { useState } from "react";
import {
  useGetAdminOrdersQuery,
  useSetOrderStatusMutation,
} from "@/lib/features/product/adminApiSlice";
import type { AdminOrder } from "@/lib/features/product/adminApiSlice";
import {
  Empty,
  ErrorState,
  Loading,
  Modal,
} from "@/app/admin/components/AdminPrimitives";

interface AdminOrdersProps {
  search: string;
  orderStatuses: string[];
  showError: (message: string) => void;
  showNotice: (message: string) => void;
  apiMessage: (error: unknown, fallback: string) => string;
}

export default function AdminOrders({
  search,
  orderStatuses,
  showError,
  showNotice,
  apiMessage,
}: AdminOrdersProps) {
  const q = useGetAdminOrdersQuery();
  const [change, state] = useSetOrderStatusMutation();
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const rows = (q.data ?? []).filter((o) =>
    `${o._id} ${o.user?.name ?? ""} ${o.user?.email ?? ""} ${o.orderStatus}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const onChangeHandler = async (e, o) => {
    if (
      e.target.value === "Cancelled" &&
      !window.confirm("Cancel this order?")
    ) {
      q.refetch();
      return;
    }
    try {
      await change({ id: o._id, orderStatus: e.target.value }).unwrap();
      showNotice("Order status updated.");
    } catch (err) {
      showError(apiMessage(err, "Could not update order."));
    }
  };

  if (q.isLoading) return <Loading />;
  if (q.error)
    return <ErrorState message="Could not load orders." onRetry={q.refetch} />;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e9e5de] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f1f0eb] text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Placed</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Update status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o._id}
                onClick={() => setSelected(o)}
                className="cursor-pointer border-t border-stone-100 hover:bg-stone-50"
              >
                <td className="px-5 py-4">#{o._id.slice(-8)}</td>
                <td className="px-5 py-4">{o.user?.name ?? "Customer"}</td>
                <td className="px-5 py-4">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  {o.totalAmount.toLocaleString()} MMK
                </td>
                <td className="px-5 py-4">{o.orderStatus}</td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    disabled={state.isLoading}
                    value={o.orderStatus}
                    onChange={(e) => onChangeHandler(e, o)}
                    className="rounded-md border border-stone-200 bg-white px-2 py-1"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <Empty>No orders found.</Empty>}
      {selected && (
        <Modal
          title={`Order #${selected._id.slice(-8)}`}
          close={() => setSelected(null)}
        >
          <p className="text-sm text-stone-600">
            {selected.user?.name} · {selected.user?.email}
          </p>
          <p className="mt-2 text-sm">
            Payment: {selected.paymentMethod} / {selected.paymentStatus}
          </p>
          <div className="mt-5 space-y-3">
            {selected.items.map((item, i) => (
              <div
                key={`${selected._id}-${i}`}
                className="flex justify-between border-t pt-3 text-sm"
              >
                <span>
                  {typeof item.product === "string"
                    ? "Product"
                    : item.product.title}{" "}
                  · {item.size} / {item.color} × {item.quantity}
                </span>
                <span>{(item.price * item.quantity).toLocaleString()} MMK</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-right font-medium">
            Total {selected.totalAmount.toLocaleString()} MMK
          </p>
        </Modal>
      )}
    </div>
  );
}
