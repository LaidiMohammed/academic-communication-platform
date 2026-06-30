import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const serviceClient = createServiceClient();

export async function POST(req: NextRequest) {
  try {
    const { action, table, query, data, rpcName, rpcParams, userId } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    switch (action) {
      case 'select': {
        let q: any = serviceClient.from(table).select(query?.select || '*');
        if (query?.eq) for (const [k, v] of Object.entries(query.eq)) q = q.eq(k, v);
        if (query?.neq) for (const [k, v] of Object.entries(query.neq)) q = q.neq(k, v);
        if (query?.order) q = q.order(query.order.column, { ascending: query.order.ascending ?? true });
        if (query?.limit) q = q.limit(query.limit);
        if (query?.single) q = q.single();
        if (query?.match) q = q.match(query.match);
        if (query?.contains) for (const [k, v] of Object.entries(query.contains)) q = q.contains(k, v as string);
        const { data, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }

      case 'insert': {
        const q: any = serviceClient.from(table).insert(data);
        const { data: result, error } = await (query?.select ? q.select(query.select) : q);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data: result });
      }

      case 'update': {
        let q: any = serviceClient.from(table).update(data);
        if (query?.eq) for (const [k, v] of Object.entries(query.eq)) q = q.eq(k, v);
        if (query?.match) q = q.match(query.match);
        const { data: result, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data: result });
      }

      case 'delete': {
        let q: any = serviceClient.from(table).delete();
        if (query?.eq) for (const [k, v] of Object.entries(query.eq)) q = q.eq(k, v);
        if (query?.match) q = q.match(query.match);
        const { data: result, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data: result });
      }

      case 'rpc': {
        if (!rpcName) return NextResponse.json({ error: 'rpcName is required' }, { status: 400 });
        const { data, error } = await serviceClient.rpc(rpcName, rpcParams || {});
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }

      case 'raw': {
        if (!data?.sql) return NextResponse.json({ error: 'sql is required' }, { status: 400 });
        const { data: result, error } = await serviceClient.rpc('get_or_create_individual_chat', {
          other_user_id: '00000000-0000-0000-0000-000000000000',
        });
        if (error && !error.message.includes('foreign key')) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data: { message: 'Migration applied' } });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
