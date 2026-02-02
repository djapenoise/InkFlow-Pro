function BusinessOverview({ appointments, currentMonthName }) {
    // Matematika: Filtriramo termine za izabrani mesec i sabiramo cene
    const monthlyApps = appointments.filter(a => a.date.includes(currentMonthName));
    const revenue = monthlyApps.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
    const clientCount = monthlyApps.length;
    
    // Prosečna zarada po sesiji
    const average = clientCount > 0 ? Math.round(revenue / clientCount) : 0;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* GLAVNI PRIKAZ ZARADE */}
            <div className="card-bg p-10 text-center shadow-xl border border-slate-800">
                <p className="text-6xl font-black gold-text italic tracking-tighter">{revenue}€</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-3 tracking-[0.3em]">Total Revenue</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase">{currentMonthName} 2026</p>
            </div>

            {/* DODATNA STATISTIKA */}
            <div className="grid grid-cols-2 gap-4">
                <div className="card-bg p-6 text-center border border-slate-800/50">
                    <p className="text-3xl font-black text-white">{clientCount}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Sessions</p>
                </div>
                <div className="card-bg p-6 text-center border border-slate-800/50">
                    <p className="text-3xl font-black text-white">{average}€</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Average / Session</p>
                </div>
            </div>

            {/* MALA PORUKA NA DNU */}
            <div className="text-center opacity-30 mt-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">InkFlow Business Analytics</p>
            </div>
        </div>
    );
}
}
