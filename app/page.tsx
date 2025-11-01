import React from 'react';

import calendarData from '../data/calendar.json';

/*
  This is how calendarData looks like:

  {
    "months": [
      {
        "date": "2024-03-01",
        "days": [
          {
            "date": "2024-03-01",
            "events": [
              {
                "title": "LAVINOVÝ KURZ - JESENÍKY",
                "url": "https://daily-adventures.cz/eshop/lavinovy-kurz-pro-zacatecniky-jeseniky/"
              }
            ]
          },
          ...
        ]
      }
    ]
  }
*/

const dayOfWeekNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

interface Event {
  title: string;
  url: string;
}

interface Day {
  date: string;
  events: Event[];
}

interface Month {
  date: string;
  days: Day[];
}

export default function Home() {
  const formatMonthHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const getCalendarGrid = (month: Month) => {
    const firstDay = new Date(month.date);
    const year = firstDay.getFullYear();
    const monthIndex = firstDay.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    
    // Find starting day (Monday = 1, Sunday = 0)
    let startDay = firstDayOfMonth.getDay();
    // Convert to Monday-based week (Monday = 0, Sunday = 6)
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create a map of events by date
    const eventsByDate = new Map<string, Event[]>();
    month.days.forEach(day => {
      if (day.events.length > 0) {
        eventsByDate.set(day.date, day.events);
      }
    });
    
    // Build calendar grid
    const weeks: (Day | null)[][] = [];
    let currentWeek: (Day | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData: Day = {
        date: dateStr,
        events: eventsByDate.get(dateStr) || []
      };
      currentWeek.push(dayData);
      
      // If week is complete, start a new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill remaining days in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Filter months with events
  const monthsWithEvents = calendarData.months.filter(month => 
    month.days.some(day => day.events.length > 0)
  );

  return (
    <main className="container mx-auto px-4 py-6" style={{ backgroundColor: '#f5f5f5', color: 'black' }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#333' }}>
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/' style={{ color: '#0066cc' }}>Daily Adventures</a>
      </h1>

      <p className="mb-6" style={{ fontSize: '14px', color: '#666' }}>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' style={{ color: '#0066cc' }}>daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      <div className="space-y-8">
        {monthsWithEvents.map((month) => {
          const weeks = getCalendarGrid(month);
          
          return (
            <div key={month.date} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                {formatMonthHeader(month.date)}
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '2px solid #e0e0e0' }}>
                    {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
                      <th key={day} style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#666', textAlign: 'left', width: '14.28%' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        const isWeekend = dayIndex >= 5;
                        const hasEvents = day && day.events.length > 0;
                        
                        return (
                          <td 
                            key={dayIndex}
                            style={{
                              padding: '4px',
                              verticalAlign: 'top',
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #e0e0e0',
                              backgroundColor: isWeekend ? '#fafafa' : 'white',
                              minHeight: '100px',
                              height: '120px',
                            }}
                          >
                            {day ? (
                              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                  fontSize: '13px', 
                                  fontWeight: hasEvents ? '600' : '400',
                                  color: hasEvents ? '#333' : '#999',
                                  marginBottom: '4px',
                                  padding: '4px 8px'
                                }}>
                                  {new Date(day.date).getDate()}
                                </div>
                                <div style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}>
                                  {day.events.map((event, i) => (
                                    <div 
                                      key={i} 
                                      style={{
                                        backgroundColor: '#e3f2fd',
                                        border: '1px solid #2196f3',
                                        borderLeft: '3px solid #2196f3',
                                        borderRadius: '3px',
                                        padding: '4px 6px',
                                        marginBottom: '4px',
                                        fontSize: '11px',
                                        lineHeight: '1.3'
                                      }}
                                    >
                                      <a 
                                        href={event.url} 
                                        style={{ 
                                          color: '#1565c0',
                                          textDecoration: 'none',
                                          display: 'block'
                                        }}
                                        title={event.title}
                                      >
                                        {event.title}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <p className="mt-8 pt-4" style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
        Github: <a href='https://github.com/messa/da-calendar' style={{ color: '#0066cc' }}>github.com/messa/da-calendar</a>
      </p>
    </main>
  );
}
