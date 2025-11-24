import { NextResponse } from 'next/server';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({
        url: url, // Safe to show URL
        anonKeyPresent: !!anonKey,
        anonKeyStart: anonKey ? anonKey.substring(0, 5) + '...' : 'MISSING',
        serviceKeyPresent: !!serviceKey,
        serviceKeyStart: serviceKey ? serviceKey.substring(0, 5) + '...' : 'MISSING',
        nodeEnv: process.env.NODE_ENV
    });
}
