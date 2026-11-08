import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const TAX_RATE = 0.05;

const COMPANY = {
  name: 'ICE NATURAL ICE INDUSTRY LLC',
  address: 'Street 22 AL Quoz Industrial area 3',
  city: 'Al Quoz Dubai',
  country: 'U.A.E',
  trn: '100332279700003',
  phone: '0565334200',
  email: 'info@icenatural.com',
  website: 'www.icenatural.com',
};

const BANK = {
  accountName: 'ICE NATURAL ICE INDUSTRY LLC',
  bankName: 'Emirates NBD',
  accountNumber: '1014072834601',
  iban: 'AE780260001014072834601',
  accountType: 'CURRENT ACCOUNT',
  swiftCode: 'EBILAEAD',
  branchName: 'OUD METHA',
  currency: 'AED',
};

function toWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  const intPart = Math.floor(num);
  const filsPart = Math.round((num - intPart) * 100);
  const convertHundreds = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertHundreds(n % 100) : '');
  };
  const convertInt = (n) => {
    if (n === 0) return '';
    if (n < 1000) return convertHundreds(n);
    if (n < 100000) return convertHundreds(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertHundreds(n % 1000) : '');
    return convertHundreds(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertInt(n % 100000) : '');
  };
  let result = 'UAE Dirham ' + convertInt(intPart);
  if (filsPart > 0) result += ' and ' + convertInt(filsPart) + ' Fils';
  return result;
}

export default function PrintInvoice({ order, open, onOpenChange }) {
  const printRef = useRef();
  const [specialClientTrn, setSpecialClientTrn] = useState(null);

  useEffect(() => {
    if (open && order?.client_email) {
      base44.entities.SpecialClient.filter({ client_email: order.client_email }).then(clients => {
        if (clients && clients.length > 0) {
          setSpecialClientTrn(clients[0].trn);
        } else {
          setSpecialClientTrn(null);
        }
      });
    }
  }, [open, order?.client_email]);

  if (!order) return null;

  const subtotal = order.items?.reduce((s, item) => s + (item.total || 0), 0) || 0;
  const deliveryFee = order.delivery_fee || 0;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = order.total_amount || subtotal + tax + deliveryFee;
  const invoiceNumber = order.id?.slice(-6).toUpperCase();
  const invoiceDate = order.created_date ? format(new Date(order.created_date), 'dd MMM yyyy') : '';

  const handlePrint = () => {
    const itemsRows = (order.items || []).map((item, i) => {
      const itemTax = (item.total || 0) * TAX_RATE;
      return `<tr>
        <td style="padding:6px 8px;border:1px solid #ccc;">${i + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;">${item.product_name || ''}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">${item.quantity}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">${(item.unit_price || 0).toFixed(2)}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">5.00</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">${itemTax.toFixed(2)}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">${(item.total || 0).toFixed(2)}</td>
      </tr>`;
    }).join('');

    const bankRows = [
      ['ACCOUNT NAME', BANK.accountName],
      ['BANK NAME', BANK.bankName],
      ['ACCOUNT NUMBER', BANK.accountNumber],
      ['IBAN', BANK.iban],
      ['ACCOUNT TYPE', BANK.accountType],
      ['SWIFT CODE', BANK.swiftCode],
      ['BRANCH NAME', BANK.branchName],
      ['CURRENCY', BANK.currency],
    ].map(([label, value]) => `<tr><td style="font-weight:bold;width:140px;padding:2px 6px;">${label}</td><td style="padding:2px 6px;">${value}</td></tr>`).join('');

    const customerTrnRow = specialClientTrn
      ? `<div style="margin-top:4px;font-weight:bold;color:#003366;">Customer TRN: ${specialClientTrn}</div>` : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Tax Invoice - ${order.client_name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#111 !important; padding:24px 32px; }
    th, td { color:#111 !important; }
    th[style*="background:#003366"] { color:white !important; }
    td[style*="background:#003366"] { color:white !important; }
    @media print {
      body { padding:10px 20px; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    }
  </style>
</head>
<body>
<div style="max-width:780px;margin:auto;">

  <!-- Header -->
  <table style="width:100%;border-collapse:collapse;border-bottom:2px solid #003366;padding-bottom:12px;margin-bottom:12px;">
    <tbody><tr>
      <td style="vertical-align:top;padding-bottom:12px;">
        <div style="font-size:22px;font-weight:900;color:#003366;">NaturalIce<span style="font-size:14px;">&#174;</span></div>
        <div style="font-size:14px;font-weight:bold;color:#003366;margin-top:4px;">${COMPANY.name}</div>
        <div style="font-size:11px;color:#333;line-height:1.6;margin-top:4px;">
          <div>${COMPANY.address}</div>
          <div>${COMPANY.city}</div>
          <div>${COMPANY.country}</div>
          <div>TRN ${COMPANY.trn}</div>
          <div>${COMPANY.phone}</div>
          <div>${COMPANY.email}</div>
          <div>${COMPANY.website}</div>
        </div>
      </td>
      <td style="vertical-align:top;text-align:right;padding-bottom:12px;">
        <div style="font-size:26px;font-weight:bold;color:#003366;">TAX INVOICE</div>
      </td>
    </tr></tbody>
  </table>

  <!-- Invoice Meta -->
  <table style="width:50%;border-collapse:collapse;margin-bottom:10px;">
    <tbody>
      <tr>
        <td style="padding:4px 8px;border:1px solid #ccc;font-weight:bold;background:#f5f5f5;width:130px;">Invoice Number</td>
        <td style="padding:4px 8px;border:1px solid #ccc;">: ${invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border:1px solid #ccc;font-weight:bold;background:#f5f5f5;">Invoice Date</td>
        <td style="padding:4px 8px;border:1px solid #ccc;">: ${invoiceDate}</td>
      </tr>
    </tbody>
  </table>

  <!-- Bill To -->
  <div style="border:1px solid #ccc;padding:10px;margin-bottom:10px;">
    <div style="font-weight:bold;font-size:12px;margin-bottom:4px;border-bottom:1px solid #ccc;padding-bottom:4px;">Bill To</div>
    <div style="font-weight:bold;font-size:13px;">${(order.client_name || '').toUpperCase()}</div>
    ${order.delivery_address ? `<div style="font-size:11px;margin-top:2px;">${order.delivery_address}</div>` : ''}
    ${order.delivery_phone ? `<div style="font-size:11px;">Tel: ${order.delivery_phone}</div>` : ''}
    <div style="font-size:11px;">${order.client_email || ''}</div>
    ${customerTrnRow}
  </div>

  <!-- Items Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:11px;">
    <thead>
      <tr>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:left;white-space:nowrap;">S.No</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:left;">Item &amp; Description</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:right;white-space:nowrap;">Qty</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:right;white-space:nowrap;">Rate</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:right;white-space:nowrap;">Tax %</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:right;white-space:nowrap;">Tax</th>
        <th style="background:#003366;color:white;padding:6px 8px;border:1px solid #003366;text-align:right;white-space:nowrap;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <!-- Totals + Words side by side using table for reliable print layout -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
    <tbody>
      <tr>
        <td style="vertical-align:top;padding-right:16px;">
          <div style="border:1px solid #ccc;padding:8px;margin-bottom:8px;font-size:11px;">
            <div style="font-weight:bold;">Total In Words</div>
            <div style="font-style:italic;font-weight:bold;">${toWords(total)}</div>
          </div>
          <div style="border:1px solid #ccc;padding:8px;font-size:11px;">
            <div style="font-weight:bold;">Notes</div>
            <div>${order.notes || 'Thank you for your business.'}</div>
          </div>
        </td>
        <td style="vertical-align:top;width:260px;">
          <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;">
            <tbody>
              <tr>
                <td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">Sub Total</td>
                <td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:right;">${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">Standard Rate (5%)</td>
                <td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:right;">${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:7px 10px;background:#003366;color:white;font-weight:bold;font-size:13px;">Total</td>
                <td style="padding:7px 10px;background:#003366;color:white;font-weight:bold;font-size:13px;text-align:right;">AED ${total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="height:60px;text-align:center;vertical-align:bottom;padding-bottom:4px;font-size:11px;color:#555;">Receiver Signature</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Bank Details -->
  <div style="font-size:10px;color:#333;margin-bottom:8px;">* All payments to be made by Cheque / Bank transfer only to below Account Details (Ice Natural Ice Industry LLC)</div>
  <table style="font-size:10px;margin-bottom:14px;">
    <tbody>${bankRows}</tbody>
  </table>

  <!-- Sales Person -->
  <div style="font-size:12px;margin-top:10px;">
    <strong>Sales Person:</strong> <span style="display:inline-block;width:200px;border-bottom:1px solid #333;">&nbsp;</span>
  </div>

</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Tax Invoice Preview</DialogTitle>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Print Invoice
            </Button>
          </div>
        </DialogHeader>

        <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#111', maxWidth: '780px', margin: 'auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#003366' }}>NaturalIce<span style={{ fontSize: '14px' }}>®</span></div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#003366', marginTop: '4px' }}>{COMPANY.name}</div>
              <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6', marginTop: '4px' }}>
                <div>{COMPANY.address}</div>
                <div>{COMPANY.city}</div>
                <div>{COMPANY.country}</div>
                <div>TRN {COMPANY.trn}</div>
                <div>{COMPANY.phone}</div>
                <div>{COMPANY.email}</div>
                <div>{COMPANY.website}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#003366' }}>TAX INVOICE</div>
            </div>
          </div>

          {/* Invoice Meta */}
          <table style={{ width: '50%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f5f5f5', width: '130px' }}>Invoice Number</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>: {invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f5f5f5' }}>Invoice Date</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>: {invoiceDate}</td>
              </tr>
            </tbody>
          </table>

          {/* Bill To */}
          <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Bill To</div>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{order.client_name?.toUpperCase()}</div>
            {order.delivery_address && <div style={{ fontSize: '11px', marginTop: '2px' }}>{order.delivery_address}</div>}
            {order.delivery_phone && <div style={{ fontSize: '11px' }}>Tel: {order.delivery_phone}</div>}
            <div style={{ fontSize: '11px' }}>{order.client_email}</div>
            {specialClientTrn && (
              <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#003366' }}>
                Customer TRN: {specialClientTrn}
              </div>
            )}
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'left' }}>S.No</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'left' }}>Item &amp; Description</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>Qty</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>Rate</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>Tax %</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>Tax</th>
                <th style={{ background: '#003366', color: 'white', padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => {
                const itemTax = (item.total || 0) * TAX_RATE;
                if (item.price_on_request) {
                  return (
                    <tr key={i}>
                      <td style={{ padding: '6px 8px', border: '1px solid #ccc' }}>{i + 1}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #ccc' }}>{item.product_name}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>{item.quantity}</td>
                      <td colSpan={4} style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right', color: '#b45309', fontWeight: 'bold' }}>As per Request</td>
                    </tr>
                  );
                }
                return (
                  <tr key={i}>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc' }}>{item.product_name}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>{item.unit_price?.toFixed(2)}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>5.00</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>{itemTax.toFixed(2)}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #ccc', textAlign: 'right' }}>{item.total?.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals + Words side by side */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold' }}>Total In Words</div>
                <div style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{toWords(total)}</div>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold' }}>Notes</div>
                <div>{order.notes || 'Thank you for your business.'}</div>
              </div>
            </div>
            <div style={{ width: '240px', border: '1px solid #ccc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span>Sub Total</span><span>{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span>Standard Rate (5%)</span><span>{tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                  <span>Delivery Fee</span><span>{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: '#003366', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
                <span>Total</span><span>AED {total.toFixed(2)}</span>
              </div>
              <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px', fontSize: '11px', color: '#555' }}>
                Receiver Signature
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div style={{ fontSize: '10px', marginBottom: '8px', color: '#333' }}>
            * All payments to be made by Cheque / Bank transfer only to below Account Details (Ice Natural Ice Industry LLC)
          </div>
          <table style={{ fontSize: '10px', marginBottom: '14px' }}>
            <tbody>
              {[
                ['ACCOUNT NAME', BANK.accountName],
                ['BANK NAME', BANK.bankName],
                ['ACCOUNT NUMBER', BANK.accountNumber],
                ['IBAN', BANK.iban],
                ['ACCOUNT TYPE', BANK.accountType],
                ['SWIFT CODE', BANK.swiftCode],
                ['BRANCH NAME', BANK.branchName],
                ['CURRENCY', BANK.currency],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ fontWeight: 'bold', width: '140px', paddingRight: '12px' }}>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sales Person */}
          <div style={{ fontSize: '12px', marginTop: '10px' }}>
            <strong>Sales Person:</strong> <span style={{ display: 'inline-block', width: '200px', borderBottom: '1px solid #333' }}></span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}