import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY; // Should use Service Role Key for Admin updates
const binanceSecretKey = import.meta.env.BINANCE_SECRET_KEY;

// Initialize Supabase with Service Role if possible, otherwise Anon (RLS might block update)
const supabase = (supabaseUrl && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseKey || '')
    : null;


export const POST: APIRoute = async ({ request }) => {
    try {
        const rawBody = await request.text();
        const headers = request.headers;

        const signature = headers.get('BinancePay-Signature');
        const timestamp = headers.get('BinancePay-Timestamp');
        const nonce = headers.get('BinancePay-Nonce');

        if (!signature || !timestamp || !nonce) {
            return new Response('Missing headers', { status: 400 });
        }

        // Verify Signature
        const payloadToSign = `${timestamp}\n${nonce}\n${rawBody}\n`;
        const expectedSignature = crypto
            .createHmac('sha512', binanceSecretKey)
            .update(payloadToSign)
            .digest('hex')
            .toUpperCase();

        if (signature !== expectedSignature) {
            return new Response('Invalid Signature', { status: 401 });
        }

        const body = JSON.parse(rawBody);

        if (body.bizType === 'PAY' && body.bizStatus === 'PAY_SUCCESS') {
            const merchantTradeNo = body.merchantTradeNo;

            // Update Order in Supabase
            if (!supabase) {
                console.error('Supabase not initialized');
                return new Response('Server Configuration Error', { status: 500 });
            }

            const { error } = await supabase
                .from('orders')
                .update({ status: 'paid', binance_prepay_id: body.prepayId })
                .eq('merchant_trade_no', merchantTradeNo);


            if (error) {
                console.error('Supabase Update Error:', error);
                return new Response('Database Error', { status: 500 });
            }

            return new Response(JSON.stringify({ returnCode: 'SUCCESS', returnMessage: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ returnCode: 'SUCCESS', returnMessage: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error(e);
        return new Response('Server Error', { status: 500 });
    }
};
