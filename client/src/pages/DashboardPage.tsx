import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { buildAlerts, checkState, findMachine, isLow, machineLabel, scheduleState, warrantyState, type Tone } from '@/lib/derive';
import { money, num } from '@/lib/util';
import { Avatar, Dot, PageHead } from '@/components/ui';

const seg = { Running: 'bg-green-600', Idle: 'bg-slate-400', 'Under maintenance': 'bg-amber-500', Breakdown: 'bg-red-600' } as const;

export function DashboardPage() {
  const { data: d, user, people, unread } = useStore();
  const role = user?.accessRole ?? 'manager';
  const dashboardTitle = role === 'super_admin' ? 'System Dashboard'
    : role === 'manager' ? 'Manager Dashboard'
      : role === 'supplier' ? 'Supplier Dashboard' : 'Inventory Dashboard';
  const messageLink = (
    <Link to="/messages" className="btn-ghost">{unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'Messages'}</Link>
  );

  if (role === 'supplier') {
    const profile = d.suppliers[0];
    return <>
      <PageHead title={dashboardTitle} note="Your supplied parts, related machines and delivery history." action={<Link to="/supply-orders" className="btn-ghost">Orders and deliveries</Link>} />
      <div className="grid grid-cols-2 border-b border-slate-200">
        <div className="border-r border-slate-200 p-6"><p className="text-sm text-slate-500">Supplier account</p><p className="mt-2 font-medium">{profile?.name || user?.name}</p><p className="text-sm text-slate-500">{profile?.email || user?.email}</p></div>
        <Link to="/spares" className="p-6 hover:bg-slate-50"><p className="text-sm text-slate-500">Supplied parts</p><p className="mt-2 text-3xl font-semibold">{d.spares.length}</p></Link>
      </div>
      <section>
        <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Spare parts availability and specifications</h2>
        {d.spares.length === 0 ? <p className="px-6 py-6 text-sm text-slate-500">No parts are linked to your supplier profile yet.</p> : d.spares.map((part) => (
          <div key={part.id} className="grid gap-2 border-b border-slate-200 px-6 py-4 text-sm sm:grid-cols-[minmax(0,1fr)_140px_140px]"><span><span className="font-medium">{part.name} <span className="font-normal text-slate-500">{part.partNumber}</span></span><span className="block text-slate-500">{part.specifications || 'No specifications provided'}</span></span><span>Quantity: {part.quantity}</span><Dot tone={Number(part.quantity) > 0 ? 'ok' : 'bad'}>{Number(part.quantity) > 0 ? 'Available' : 'Out of stock'}</Dot></div>
        ))}
      </section>
      <section>
        <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Machines supplied</h2>
        {d.machines.length === 0 ? <p className="px-6 py-5 text-sm text-slate-500">No supplied parts are linked to machines.</p> : d.machines.map((machine) => (
          <div key={machine.id} className="flex flex-wrap justify-between gap-3 border-b border-slate-200 px-6 py-4 text-sm"><span className="font-medium">{machine.name} <span className="font-normal text-slate-500">{machine.machineCode}</span></span><Dot tone={machine.status === 'Breakdown' ? 'bad' : machine.status === 'Running' ? 'ok' : 'warn'}>{machine.status}</Dot></div>
        ))}
      </section>
      <section>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3"><h2 className="text-sm font-medium">Supply and delivery history</h2><Link to="/supply-orders" className="text-sm text-brand hover:underline">View all</Link></div>
        {d.supplyOrders.length === 0 ? <p className="px-6 py-5 text-sm text-slate-500">No orders or deliveries have been recorded.</p> : d.supplyOrders.map((order) => (
          <div key={order.id} className="flex flex-wrap justify-between gap-3 border-b border-slate-200 px-6 py-4 text-sm"><span className="font-medium">{order.orderNumber}<span className="ml-2 font-normal text-slate-500">{d.spares.find((part) => part.id === order.spareId)?.name || 'Part'} · Qty {order.quantity}</span></span><span>{order.status}{order.deliveredDate ? ` · delivered ${order.deliveredDate}` : order.expectedDate ? ` · expected ${order.expectedDate}` : ''}</span></div>
        ))}
      </section>
    </>;
  }

  if (role === 'inventory_manager') {
    const lowStock = d.spares.filter(isLow);
    const expiringParts = d.partWarranties.filter((warranty) => warrantyState(warranty).tone === 'warn');
    const recentPartActivity = d.partServices.slice(0, 6);
    return <>
      <PageHead title={dashboardTitle} note="Stock, warranties, supplier deliveries and spare-part activity." action={<Link to="/spares" className="btn-ghost">Manage spare parts</Link>} />
      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        <Link to="/spares" className="border-r border-b border-slate-200 p-5 hover:bg-slate-50"><p className="text-sm text-slate-500">Parts tracked</p><p className="mt-2 text-3xl font-semibold">{d.spares.length}</p></Link>
        <Link to="/spares" className="border-b border-slate-200 p-5 hover:bg-slate-50"><p className="text-sm text-slate-500">Low-stock alerts</p><p className={`mt-2 text-3xl font-semibold ${lowStock.length ? 'text-amber-600' : ''}`}>{lowStock.length}</p></Link>
        <Link to="/part-warranties" className="border-r border-slate-200 p-5 hover:bg-slate-50"><p className="text-sm text-slate-500">Warranties ending soon</p><p className="mt-2 text-3xl font-semibold">{expiringParts.length}</p></Link>
        <Link to="/supply-orders" className="p-5 hover:bg-slate-50"><p className="text-sm text-slate-500">Open supply orders</p><p className="mt-2 text-3xl font-semibold">{d.supplyOrders.filter((order) => !['Delivered', 'Cancelled'].includes(String(order.status))).length}</p></Link>
      </div>
      <section>
        <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Low-stock parts</h2>
        {lowStock.length === 0 ? <p className="px-6 py-6 text-sm text-slate-500">No parts are below their minimum stock level.</p> : lowStock.map((part) => (
          <Link key={part.id} to="/spares" className="flex flex-wrap justify-between gap-3 border-b border-slate-200 px-6 py-4 text-sm hover:bg-slate-50"><span className="font-medium">{part.name} <span className="font-normal text-slate-500">{part.partNumber}</span></span><span>{part.quantity} in stock · minimum {part.minQuantity}</span></Link>
        ))}
      </section>
      <section className="grid lg:grid-cols-2">
        <div className="border-b border-slate-200 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3"><h2 className="text-sm font-medium">Spare-part warranties</h2><Link to="/part-warranties" className="text-sm text-brand hover:underline">Manage</Link></div>
          {d.partWarranties.length === 0 ? <p className="px-6 py-5 text-sm text-slate-500">No spare-part warranties recorded.</p> : d.partWarranties.slice(0, 5).map((warranty) => <div key={warranty.id} className="flex justify-between gap-3 border-b border-slate-200 px-6 py-3 text-sm"><span>{d.spares.find((part) => part.id === warranty.spareId)?.name || 'Spare part'}</span><Dot tone={warrantyState(warranty).tone}>{warrantyState(warranty).text} · {warranty.endDate}</Dot></div>)}
        </div>
        <div className="border-b border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3"><h2 className="text-sm font-medium">Maintenance, repair and stock activity</h2><Link to="/part-history" className="text-sm text-brand hover:underline">View history</Link></div>
          {recentPartActivity.length === 0 ? <p className="px-6 py-5 text-sm text-slate-500">No spare-part activity has been recorded.</p> : recentPartActivity.map((activity) => <div key={activity.id} className="flex justify-between gap-3 border-b border-slate-200 px-6 py-3 text-sm"><span>{d.spares.find((part) => part.id === activity.spareId)?.name || 'Spare part'} · {activity.eventType} ({activity.quantity})</span><span className="text-slate-500">{activity.date}</span></div>)}
        </div>
      </section>
    </>;
  }

  if (d.machines.length === 0) {
    const firstSteps = role === 'manager'
      ? [
        ['Register machines', 'Add each machine with a photo, ID, make, model and location.', '/machines?new=1'],
        ['Plan maintenance', 'Schedule repeating jobs and log warranty and service records.', '/schedules'],
      ]
      : [
        ['Register machines', 'Add each machine with a photo, ID, make, model and location.', '/machines?new=1'],
        ['Add your team', 'Manage user access and system permissions.', '/people?new=1'],
        ['Add suppliers and spares', 'Record parts, stock levels and suppliers.', '/suppliers?new=1'],
        ['Plan maintenance', 'Set repeating jobs and log warranty and service records.', '/schedules'],
      ];
    return (
      <>
        <PageHead title={role === 'manager' ? `Welcome, ${user?.name.split(' ')[0]}` : dashboardTitle} note="Nothing to monitor yet." action={role === 'manager' || role === 'super_admin' ? messageLink : undefined} />
        <div className="grid border-b border-slate-200 md:grid-cols-4">
          {firstSteps.map(([t, s, to], i) => (
            <Link key={t} to={to} className={`p-6 hover:bg-slate-50 ${i < 3 ? 'border-b border-slate-200 md:border-b-0 md:border-r' : ''}`}>
              <p className="font-medium">{t}</p>
              <p className="mt-1 text-sm text-slate-500">{s}</p>
            </Link>
          ))}
        </div>
      </>
    );
  }

  const count = (s: string) => d.machines.filter((m) => m.status === s).length;
  const overdue = d.schedules.filter((s) => scheduleState(s).tone === 'bad').length;
  const checksDue = d.machines.filter((m) => checkState(d, m).tone !== 'ok').length;
  const expiring = d.warranties.filter((w) => warrantyState(w).tone === 'warn').length;
  const stats: { label: string; value: string | number; to: string; tone?: Tone }[] = [
    { label: 'Machines', value: d.machines.length, to: '/machines' },
    { label: 'Running', value: count('Running'), to: '/machines' },
    { label: 'Breakdown', value: count('Breakdown'), to: '/machines', tone: count('Breakdown') ? 'bad' : undefined },
    { label: 'Maintenance overdue', value: overdue, to: '/schedules', tone: overdue ? 'bad' : undefined },
    { label: 'Low-stock spares', value: d.spares.filter(isLow).length, to: '/spares', tone: d.spares.some(isLow) ? 'warn' : undefined },
    { label: 'Warranties ending soon', value: expiring, to: '/warranties', tone: expiring ? 'warn' : undefined },
    { label: 'Service spend', value: money(d.services.reduce((a, s) => a + num(s.cost), 0)), to: '/services' },
    { label: 'Monthly checks due', value: checksDue, to: '/checks', tone: checksDue ? 'warn' : undefined },
  ];
  const tint = { bad: 'text-red-600', warn: 'text-amber-600', ok: '', mute: '' };
  const alerts = buildAlerts(d);
  const recent = d.services.slice(0, 6);

  return (
    <>
      <PageHead title={dashboardTitle} note={role === 'manager' ? 'Live view of machines and maintenance.' : 'Live view of everything in this workspace.'} action={messageLink} />
      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        {stats.filter((s) => role !== 'manager' || s.label !== 'Low-stock spares').map((s, i, visible) => (
          <Link key={s.label} to={s.to}
            className={`border-slate-200 p-5 hover:bg-slate-50 ${i % 2 === 0 ? 'border-r' : ''} lg:border-r lg:[&:nth-child(4n)]:border-r-0 ${i < visible.length - 2 ? 'border-b' : ''} ${i < 4 ? 'lg:border-b' : 'lg:border-b-0'}`}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.tone ? tint[s.tone] : ''}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="border-b border-slate-200 px-6 py-5">
        <p className="mb-3 text-sm font-medium">Machine status</p>
        <div className="flex h-3 w-full gap-px bg-slate-200" role="img" aria-label="Machine status split">
          {(Object.keys(seg) as (keyof typeof seg)[]).map((k) => count(k) > 0 && <div key={k} className={seg[k]} style={{ flex: count(k) }} title={`${k}: ${count(k)}`} />)}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {(Object.keys(seg) as (keyof typeof seg)[]).map((k) => <span key={k} className="inline-flex items-center gap-2"><span className={`h-2 w-2 ${seg[k]}`} />{k} {count(k)}</span>)}
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <section className="border-b border-slate-200 lg:border-r">
          <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Needs attention</h2>
          {alerts.length === 0 ? <p className="px-6 py-6 text-sm text-slate-500">All clear. Nothing is overdue, low or expiring.</p> : (
            <ul>{alerts.slice(0, 8).map((a, i) => (
              <li key={i} className="border-b border-slate-200 last:border-b-0"><Link to={a.to} className="block px-6 py-3 text-sm hover:bg-slate-50"><Dot tone={a.tone}>{a.text}</Dot></Link></li>
            ))}</ul>
          )}
        </section>
        <section className="border-b border-slate-200">
          <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Recent service</h2>
          {recent.length === 0 ? <p className="px-6 py-6 text-sm text-slate-500">No service records yet. They appear here when you log a job or mark maintenance done.</p> : (
            <ul>{recent.map((s) => (
              <li key={s.id} className="flex justify-between gap-4 border-b border-slate-200 px-6 py-3 text-sm last:border-b-0">
                <span>{machineLabel(findMachine(d, s.machineId))}<span className="block text-slate-500">{s.description}</span></span>
                <span className="whitespace-nowrap text-slate-500">{s.date}</span>
              </li>
            ))}</ul>
          )}
        </section>
      </div>

      <section className="border-b border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-medium">Machines <span className="text-slate-500">({d.machines.length})</span></h2>
          <Link to="/machines" className="text-sm font-medium text-brand hover:underline">Manage machines</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {d.machines.slice(0, 8).map((m) => (
            <Link key={m.id} to={`/machines/${m.id}`} className="flex items-center gap-3 border-b border-r border-slate-200 p-4 hover:bg-slate-50">
              <Avatar src={String(m.photo || '')} name={String(m.name)} size={56} />
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-slate-500">{m.machineCode}</p>
                <Dot tone={m.status === 'Running' ? 'ok' : m.status === 'Breakdown' ? 'bad' : m.status === 'Idle' ? 'mute' : 'warn'}>{m.status}</Dot>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {role === 'super_admin' && <section>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-medium">Team <span className="text-slate-500">({people.length})</span></h2>
          <Link to="/people" className="text-sm font-medium text-brand hover:underline">Manage team</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {people.slice(0, 8).map((p) => (
            <Link key={p.id} to="/people" className="flex items-center gap-3 border-b border-r border-slate-200 p-4 hover:bg-slate-50">
              <Avatar src={p.photo} name={p.name} size={44} />
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-slate-500">{p.role || 'No role'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>}
    </>
  );
}
