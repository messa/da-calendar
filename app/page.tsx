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

const dayOfWeekNamesMonFirst = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

// Outlook-style colors
const COLORS = {
  headerBg: '#0078d4',
  headerText: 'white',
  weekendBg: '#fafafa',
  weekdayBg: 'white',
  eventBg: '#e3f2fd',
  eventBorder: '#2196f3',
  eventBorderLeft: '#2196f3',
  eventText: '#1565c0',
  tableBorder: '#e0e0e0',
  tableHeaderBg: '#f8f8f8',
  tableHeaderBorder: '#e0e0e0',
  linkColor: '#0066cc',
  textMuted: '#666',
  textSecondary: '#6b7280',
};

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

interface MultiDayEvent {
  event: Event;
  startDate: string;
  endDate: string;
  startDay: number; // day of month
  endDay: number;   // day of month
  span: number;     // number of days
}

export default function Home() {
  const formatMonthHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const detectMultiDayEvents = (month: Month): MultiDayEvent[] => {
    const multiDayEvents: MultiDayEvent[] = [];
    const eventOccurrences = new Map<string, string[]>(); // event title -> dates
    
    // Group events by title to detect multi-day events
    month.days.forEach(day => {
      day.events.forEach(event => {
        if (!eventOccurrences.has(event.title)) {
          eventOccurrences.set(event.title, []);
        }
        eventOccurrences.get(event.title)!.push(day.date);
      });
    });
    
    // Find consecutive date ranges for each event
    eventOccurrences.forEach((dates, title) => {
      if (dates.length > 1) {
        dates.sort();
        
        let startDate = dates[0];
        let prevDate = dates[0];
        
        for (let i = 1; i <= dates.length; i++) {
          const currentDate = i < dates.length ? dates[i] : null;
          const prevDateTime = new Date(prevDate).getTime();
          const currentDateTime = currentDate ? new Date(currentDate).getTime() : null;
          const isConsecutive = currentDateTime && (currentDateTime - prevDateTime === 86400000); // 24 hours
          
          if (!isConsecutive) {
            // End of consecutive range
            if (startDate !== prevDate) {
              // This is a multi-day event
              const event = month.days.find(d => d.date === startDate)?.events.find(e => e.title === title);
              if (event) {
                multiDayEvents.push({
                  event,
                  startDate,
                  endDate: prevDate,
                  startDay: new Date(startDate).getDate(),
                  endDay: new Date(prevDate).getDate(),
                  span: Math.round((new Date(prevDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
                });
              }
            }
            startDate = currentDate || startDate;
          }
          
          if (currentDate) {
            prevDate = currentDate;
          }
        }
      }
    });
    
    return multiDayEvents;
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
    
    // Detect multi-day events
    const multiDayEvents = detectMultiDayEvents(month);
    const multiDayEventTitles = new Set(multiDayEvents.map(e => e.event.title));
    
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
      const events = eventsByDate.get(dateStr) || [];
      
      // Filter out multi-day events that don't start on this day
      const filteredEvents = events.filter(event => {
        if (!multiDayEventTitles.has(event.title)) {
          return true; // Keep single-day events
        }
        // For multi-day events, only show on the first day
        const multiDayEvent = multiDayEvents.find(e => e.event.title === event.title && e.startDay === day);
        return multiDayEvent !== undefined;
      });
      
      const dayData: Day = {
        date: dateStr,
        events: filteredEvents
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
    
    return { weeks, multiDayEvents };
  };

  // Filter months with events
  const monthsWithEvents = calendarData.months.filter(month => 
    month.days.some(day => day.events.length > 0)
  );

  return (
    <main className="container mx-auto px-4 py-6" style={{ backgroundColor: '#f5f5f5', color: 'black' }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#333' }}>
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/' style={{ color: COLORS.linkColor }}>Daily Adventures</a>
      </h1>

      <p className="mb-6" style={{ fontSize: '14px', color: COLORS.textMuted }}>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' style={{ color: COLORS.linkColor }}>daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      <div className="space-y-8">
        {monthsWithEvents.map((month) => {
          const { weeks, multiDayEvents } = getCalendarGrid(month);
          const year = new Date(month.date).getFullYear();
          const monthIndex = new Date(month.date).getMonth();
          
          // Helper to get week index and day index for a given day of month
          const getDayPosition = (dayOfMonth: number) => {
            const firstDayOfMonth = new Date(year, monthIndex, 1);
            let startDay = firstDayOfMonth.getDay();
            startDay = startDay === 0 ? 6 : startDay - 1;
            const position = startDay + dayOfMonth - 1;
            return {
              weekIndex: Math.floor(position / 7),
              dayIndex: position % 7
            };
          };
          
          return (
            <div key={month.date} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: COLORS.headerBg, color: COLORS.headerText, padding: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                {formatMonthHeader(month.date)}
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.tableHeaderBg, borderBottom: `2px solid ${COLORS.tableHeaderBorder}` }}>
                    {dayOfWeekNamesMonFirst.map((day) => (
                      <th key={day} style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: COLORS.textMuted, textAlign: 'left', width: '14.28%' }}>
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
                        
                        // Find multi-day events that start on this day
                        const multiDayEventsStartingHere = day ? multiDayEvents.filter(mde => {
                          const pos = getDayPosition(mde.startDay);
                          return pos.weekIndex === weekIndex && pos.dayIndex === dayIndex;
                        }) : [];
                        
                        return (
                          <td 
                            key={dayIndex}
                            style={{
                              padding: '4px',
                              verticalAlign: 'top',
                              borderRight: `1px solid ${COLORS.tableBorder}`,
                              borderBottom: `1px solid ${COLORS.tableBorder}`,
                              backgroundColor: isWeekend ? COLORS.weekendBg : COLORS.weekdayBg,
                              height: '120px',
                              position: 'relative',
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
                                  {day.events.map((event, i) => {
                                    // Check if this is a multi-day event starting here
                                    const multiDayEvent = multiDayEventsStartingHere.find(mde => mde.event.title === event.title);
                                    
                                    if (multiDayEvent) {
                                      // Calculate span in days, but limit to end of week
                                      const daysUntilWeekEnd = 7 - dayIndex;
                                      const span = Math.min(multiDayEvent.span, daysUntilWeekEnd);
                                      const continuesNextWeek = multiDayEvent.span > daysUntilWeekEnd;
                                      
                                      return (
                                        <div 
                                          key={i} 
                                          style={{
                                            position: 'absolute',
                                            left: `calc(${dayIndex * 14.28}% + 4px)`,
                                            right: continuesNextWeek ? '4px' : `calc(${(7 - dayIndex - span) * 14.28}% + 4px)`,
                                            backgroundColor: COLORS.eventBg,
                                            border: `1px solid ${COLORS.eventBorder}`,
                                            borderLeft: `3px solid ${COLORS.eventBorderLeft}`,
                                            borderRadius: '3px',
                                            padding: '4px 6px',
                                            marginTop: `${20 + i * 24}px`,
                                            fontSize: '11px',
                                            lineHeight: '1.3',
                                            zIndex: 1,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        >
                                          <a 
                                            href={event.url} 
                                            style={{ 
                                              color: COLORS.eventText,
                                              textDecoration: 'none',
                                              display: 'block'
                                            }}
                                            title={`${event.title} (${multiDayEvent.span} dní)`}
                                          >
                                            {event.title} ({multiDayEvent.span}d)
                                          </a>
                                        </div>
                                      );
                                    } else {
                                      // Regular single-day event
                                      return (
                                        <div 
                                          key={i} 
                                          style={{
                                            backgroundColor: COLORS.eventBg,
                                            border: `1px solid ${COLORS.eventBorder}`,
                                            borderLeft: `3px solid ${COLORS.eventBorderLeft}`,
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
                                              color: COLORS.eventText,
                                              textDecoration: 'none',
                                              display: 'block'
                                            }}
                                            title={event.title}
                                          >
                                            {event.title}
                                          </a>
                                        </div>
                                      );
                                    }
                                  })}
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

      <p className="mt-8 pt-4" style={{ fontSize: '14px', color: COLORS.textSecondary, textAlign: 'center' }}>
        Github: <a href='https://github.com/messa/da-calendar' style={{ color: COLORS.linkColor }}>github.com/messa/da-calendar</a>
      </p>
    </main>
  );
}
