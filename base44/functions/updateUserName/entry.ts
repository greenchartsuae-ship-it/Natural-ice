import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, display_name } = await req.json();

    if (!userId || !display_name?.trim()) {
      return Response.json({ error: 'Missing userId or display_name' }, { status: 400 });
    }

    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    const oldEmail = targetUser.email;
    const newName = display_name.trim();

    await base44.asServiceRole.entities.User.update(userId, { display_name: newName });

    const orders = await base44.asServiceRole.entities.Order.filter({});
    const ordersToUpdate = orders.filter(o => o.client_email === oldEmail || o.assigned_driver === oldEmail);

    if (ordersToUpdate.length > 0) {
      const updates = ordersToUpdate.map(order => {
        const updateData = {};
        if (order.client_email === oldEmail) {
          updateData.client_name = newName;
        }
        if (order.assigned_driver === oldEmail) {
          updateData.driver_name = newName;
        }
        return base44.asServiceRole.entities.Order.update(order.id, updateData);
      });
      await Promise.all(updates);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});