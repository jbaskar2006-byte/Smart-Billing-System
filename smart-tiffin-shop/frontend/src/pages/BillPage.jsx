import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Printer, Download, PlusCircle, ArrowLeft, ShieldAlert, CheckCircle2, UtensilsCrossed } from 'lucide-react';

export default function BillPage({ currentOrder, setCurrentOrder, setCart }) {
  const navigate = useNavigate();
  const billRef = useRef(null);

  const handleFinishAndReset = () => {
    if (setCart) setCart([]);
    if (setCurrentOrder) setCurrentOrder(null);
    navigate('/');
  };

  if (!currentOrder) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', background: '#ffffff', borderRadius: '16px', padding: '2.5rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
          No Active Receipt
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Bills are generated automatically after successful customer payment.
        </p>
        <button
          onClick={handleFinishAndReset}
          style={{ padding: '0.85rem 1.5rem', background: '#ea580c', color: 'white', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
        >
          Open POS Billing Counter
        </button>
      </div>
    );
  }

  const order = currentOrder;
  const isPaymentSuccess = order.payment_status === 'SUCCESS' || order.payment_status === 'Completed';
  const billNumber = order.bill_number || `BILL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${order.id || 101}`;
  const orderNumber = order.order_number || 'TIFFIN-20260913-001';
  const transactionId = order.transaction_id || `TXN-UPI-${Date.now().toString().slice(-6)}`;
  const totalAmount = Number(order.total_amount || order.totalAmount || 0.00);

  // Format Date & Time
  const dateObj = new Date(order.created_at || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 1. Print Bill via window.print()
  const handlePrint = () => {
    window.print();
    setTimeout(() => {
      handleFinishAndReset();
    }, 1000);
  };

  // 2. Download Bill Image using html2canvas (Works on Laptop & Android Mobile)
  const handleDownloadImage = async () => {
    if (!billRef.current) return;
    try {
      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Smart_Tiffin_Bill_${billNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh back to normal page after bill is downloaded!
      setTimeout(() => {
        handleFinishAndReset();
      }, 1000);
    } catch (err) {
      console.error('Error generating bill image:', err);
      alert('Could not download bill image');
    }
  };

  // 3. Start New Order / Finish & Reset
  const handleNewOrder = () => {
    handleFinishAndReset();
  };

  // CRITICAL GUARD: Do not generate completed bill when payment is PENDING or FAILED!
  if (!isPaymentSuccess) {
    return (
      <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '2.5rem 1.5rem', border: '1px solid #fee2e2', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
            Payment Not Verified
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The completed shop bill is generated <strong>ONLY when payment_status = SUCCESS</strong>. Current payment status for Order #{orderNumber} is <strong>{order.payment_status}</strong>.
          </p>

          <button
            onClick={() => navigate('/payment')}
            style={{ padding: '0.8rem 1.5rem', background: '#f97316', color: 'white', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
          >
            Return to Payment Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <button
        onClick={handleFinishAndReset}
        className="no-print"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', color: '#64748b', fontWeight: 600, marginBottom: '1rem', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft size={16} /> Back to POS Billing Counter (Refresh Page)
      </button>

      {/* REAL SMALL SHOP RECEIPT CONTAINER */}
      <div
        ref={billRef}
        id="printable-bill"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          padding: '1.5rem',
          fontFamily: "'Courier New', Courier, monospace",
          color: '#000000',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* SHOP HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.05em' }}>
            SMART TIFFIN SHOP
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Delicious & Fresh Food Daily</div>
          <div style={{ fontSize: '0.75rem', color: '#333' }}>GSTIN: 33AAAAA0000A1Z5 | Ph: +91 98765 43210</div>
        </div>

        {/* RECEIPT META */}
        <div style={{ fontSize: '0.82rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bill Number:</span>
            <strong style={{ fontWeight: 'bold' }}>{billNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order Number:</span>
            <span>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time:</span>
            <span>{formattedTime}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }}></div>

        {/* ITEMIZED ITEMS LIST */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '6px' }}>
            <span>ITEMS</span>
            <span>AMOUNT</span>
          </div>

          {(order.items || []).map((item, idx) => {
            const itemName = item.product_name || item.name;
            const price = Number(item.price);
            const qty = item.quantity;
            const itemSubtotal = item.subtotal || price * qty;

            return (
              <div key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 'bold' }}>{itemName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#222' }}>
                  <span>{qty} x ₹{price.toFixed(2)}</span>
                  <span style={{ fontWeight: 'bold' }}>₹{itemSubtotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '2px dashed #000', paddingTop: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900' }}>
            <span>TOTAL</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '0.5rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PAYMENT STATUS:</span>
            <span style={{ background: '#000', color: '#fff', padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px', fontSize: '0.75rem' }}>
              PAID SUCCESSFULLY
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#333' }}>
            <span>Transaction ID:</span>
            <span style={{ fontWeight: 'bold' }}>{transactionId}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px dashed #000', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Thank You 🙏
        </div>
      </div>

      {/* THREE ACTION BUTTONS: Print Bill, Download Bill Image, New Order */}
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="no-print">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: '#0f172a',
              color: 'white',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: 'none',
            }}
          >
            <Printer size={18} /> Print Bill
          </button>

          <button
            onClick={handleDownloadImage}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: 'none',
            }}
          >
            <Download size={18} /> Download Bill Image
          </button>
        </div>

        <button
          onClick={handleFinishAndReset}
          style={{
            width: '100%',
            padding: '0.95rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: 'none',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
          }}
        >
          <CheckCircle2 size={22} /> Done / Downloaded Bill - Return to Normal Page
        </button>
      </div>

      {/* PRINT CSS */}
      <style>{`
        @media print {
          .no-print, nav, aside { display: none !important; }
          body { background: #ffffff !important; margin: 0 !important; }
          #printable-bill { border: none !important; box-shadow: none !important; width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
