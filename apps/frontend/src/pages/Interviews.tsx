import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Interviews = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Interview Calendar</h1>
            <div className="glass-panel p-6 bg-white/5 text-white">
                <style>{`
                    .fc-col-header-cell-cushion, .fc-daygrid-day-number { color: white; }
                    .fc-toolbar-title { font-weight: bold; }
                    .fc-button-primary { background-color: #00f3ff !important; border-color: #00f3ff !important; color: black !important; font-weight: bold; }
                    .fc-event { background-color: rgba(255, 0, 255, 0.5); border: none; }
                `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={[
                        { title: 'Interview: John Doe', date: new Date().toISOString().split('T')[0] }
                    ]}
                    height="75vh"
                />
            </div>
        </div>
    );
};

export default Interviews;
