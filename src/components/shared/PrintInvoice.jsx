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

export default function PrintInvoice({ order, open, onOpenChange }) {
  const printRef = useRef();
  const [specialClientTrn, setSpecialClientTrn] = useState(null);

  useEffect(() => {
    if (open && order?.client_email) {
      base44.entities.SpecialClient.filter({ client_email: order.client_email }).then(clients => {
        if (clients && clients.length > 0) {
          setSpecialClientTrn(clients[0].trn);
        }
      });
    }
  }, [open, order?.client_email]);

  if (!order) return null;

  const subtotal = order.items?.reduce((s, item) => s + (item.total || 0), 0) || 0;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = order.total_amount || subtotal + tax;
  const invoiceNumber = order.id?.slice(-6).toUpperCase();
  const invoiceDate = order.created_date ? format(new Date(order.created_date), 'dd MMM yyyy') : '';

  // Convert number to words (simple version for AED)
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

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${order.client_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px 32px; }
            .invoice-wrap { max-width: 780px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #003366; padding-bottom: 12px; margin-bottom: 12px; }
            .company-info { font-size: 11px; color: #333; line-height: 1.6; }
            .company-name { font-size: 15px; font-weight: bold; color: #003366; margin-bottom: 4px; }
            .logo-text { font-size: 22px; font-weight: 900; color: #003366; }
            .tax-invoice-title { font-size: 22px; font-weight: bold; color: #003366; text-align: right; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .meta-table td { padding: 4px 8px; border: 1px solid #ccc; font-size: 12px; }
            .meta-table .label { font-weight: bold; background: #f5f5f5; width: 130px; }
            .bill-to { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
            .bill-to .title { font-weight: bold; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
            .bill-to .name { font-weight: bold; font-size: 13px; }
            .bill-to p { font-size: 11px; margin-top: 2px; color: #333; }
            table.items { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
            table.items th { background: #003366; color: white; padding: 6px 8px; text-align: left; border: 1px solid #ccc; }
            table.items td { padding: 6px 8px; border: 1px solid #ccc; }
            table.items .right { text-align: right; }
            table.items .center { text-align: center; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 10px; }
            .totals-box { width: 260px; border: 1px solid #ccc; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
            .totals-row.grand { background: #003366; color: white; font-weight: bold; font-size: 13px; }
            .words-box { border: 1px solid #ccc; padding: 8px; margin-bottom: 10px; font-size: 11px; }
            .words-box .label { font-weight: bold; }
            .words-box .value { font-style: italic; font-weight: bold; }
            .notes-box { border: 1px solid #ccc; padding: 8px; margin-bottom: 14px; font-size: 11px; }
            .signature-section { display: flex; justify-content: flex-end; margin-bottom: 14px; }
            .signature-box { width: 220px; border: 1px solid #ccc; height: 60px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-size: 11px; color: #555; }
            .payment-notice { font-size: 10px; color: #333; margin-bottom: 8px; }
            .bank-table { width: 100%; border-collapse: collapse; font-size: 10px; }
            .bank-table td { padding: 2px 6px; }
            .bank-table .label { font-weight: bold; width: 140px; }
            .footer-line { margin-top: 14px; font-size: 11px; }
            .footer-line span { display: inline-block; margin-top: 6px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body><div class="invoice-wrap">${content}</div></body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
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
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '12px' }}>
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
                {specialClientTrn && (
                  <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#003366' }}>
                    Customer TRN: {specialClientTrn}
                  </div>
                )}
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
            {/* Words + Notes */}
            <div style={{ flex: 1 }}>
              <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold' }}>Total In Words</div>
                <div style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{toWords(total)}</div>
              </div>
              {order.notes && (
                <div style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold' }}>Notes</div>
                  <div>{order.notes}</div>
                </div>
              )}
              {!order.notes && (
                <div style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold' }}>Notes</div>
                  <div>Thank you for your business.</div>
                </div>
              )}
            </div>

            {/* Totals box */}
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
              {/* Signature */}
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