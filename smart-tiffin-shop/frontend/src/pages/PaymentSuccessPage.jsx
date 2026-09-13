import React from 'react';
import BillPage from './BillPage';

export default function PaymentSuccessPage({ currentOrder, setCurrentOrder, setCart }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <BillPage currentOrder={currentOrder} setCurrentOrder={setCurrentOrder} setCart={setCart} />
    </div>
  );
}
