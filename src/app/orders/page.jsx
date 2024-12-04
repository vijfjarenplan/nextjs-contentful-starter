"use client";

import { useState } from "react";

export default function OrdersPage() {
  const [soldToNumber, setSoldToNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/getSalesOrders?soldToNumber=${encodeURIComponent(soldToNumber)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.d.results || []); // Assuming OData V2 response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order List</h1>
      <div className="mb-4">
        <label htmlFor="soldToNumber" className="block text-sm font-medium mb-2">
          Enter Sold-to Number:
        </label>
        <input
          id="soldToNumber"
          type="text"
          value={soldToNumber}
          onChange={(e) => setSoldToNumber(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
        <button
          onClick={fetchOrders}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Orders
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {orders.length > 0 && (
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Order Number</th>
              <th className="border border-gray-300 px-4 py-2">Order Type</th>
              <th className="border border-gray-300 px-4 py-2">Sold-to Party</th>
              <th className="border border-gray-300 px-4 py-2">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.SalesOrder}>
                <td className="border border-gray-300 px-4 py-2">
                  {order.SalesOrder}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.SalesOrderType}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.SoldToParty}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.NetAmount} {order.TransactionCurrency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {orders.length === 0 && !loading && <p>No orders found.</p>}
    </div>
  );
}