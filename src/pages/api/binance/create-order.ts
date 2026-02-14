import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase (Admin context needed for interacting with DB if RLS is strict, 
// but here we might just use the user's session if available. 
// For simplicity in this demo, we'll assume we pass the order details).

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const binanceApiKey = import.meta.env.BINANCE_MERCHANT_API_KEY;
const binanceSecretKey = import.meta.env.BINANCE_SECRET_KEY;

export const POST: APIRoute = async ({ request, redirect }) => {
    const data = await request.json();
    const { cartItems, total, userId } = data;

    if (!cartItems || cartItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }

    // 1. Generate unique Merchant Trade No
    const merchantTradeNo = crypto.randomUUID().replace(/-/g, '');

    // 2. Call Binance Pay API
    // Docs: https://developers.binance.com/docs/binance-pay/api-order-create-v2
    const payload = {
        env: {
            terminalType: 'WEB'
        },
        merchantTradeNo: merchantTradeNo,
        orderAmount: total.toFixed(2),
        currency: 'USDT', // Assuming USDT for simplicity
        goods: {
            goodsType: '02', // Virtual Goods
            goodsCategory: '7000', // Electronics/Digital
            referenceGoodsId: cartItems[0].id,
            goodsName: `KrostyShop Order - ${cartItems.length} items`,
            goodsDetail: cartItems.map((i: any) => `${i.name} x${i.quantity}`).join(', ')
        },
        returnUrl: `${new URL(request.url).origin}/payment/success?tradeNo=${merchantTradeNo}`,
        cancelUrl: `${new URL(request.url).origin}/payment/cancel?tradeNo=${merchantTradeNo}`
    };

    const timestamp = Date.now();
    const nonce = crypto.randomUUID().replace(/-/g, '');
    const bodyStr = JSON.stringify(payload);

    const payloadToSign = `${timestamp}\n${nonce}\n${bodyStr}\n`;
    const signature = crypto
        .createHmac('sha512', binanceSecretKey)
        .update(payloadToSign)
        .digest('hex')
        .toUpperCase();

    try {
        const response = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': timestamp.toString(),
                'BinancePay-Nonce': nonce,
                'BinancePay-Certificate-SN': binanceApiKey,
                'BinancePay-Signature': signature
            },
            body: bodyStr
        });

        const result = await response.json();

        if (result.status === 'SUCCESS') {
            // 3. Save Order to Supabase (Pending)
            // Implementation pending Supabase setup

            return new Response(JSON.stringify({
                checkoutUrl: result.data.checkoutUrl,
                tradeNo: merchantTradeNo
            }), { status: 200 });
        } else {
            console.error('Binance Error:', result);
            return new Response(JSON.stringify({ error: result.errorMessage }), { status: 500 });
        }

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
