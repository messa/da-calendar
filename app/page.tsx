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

// Layout constants
const LAYOUT = {
  cellMinHeight: '70px',
  eventTitleMaxLength: 35,
  eventTitleTruncateAt: 32,
  continuationMaxLength: 30,
  continuationTruncateAt: 27,
};

// Compact design colors
const COLORS = {
  headerBg: '#0078d4',
  headerText: 'white',
  weekendBg: '#f8f9fa',
  weekdayBg: 'white',
  eventBg: '#e3f2fd',
  eventBorder: '#2196f3',
  eventBorderLeft: '#2196f3',
  eventText: '#1565c0',
  tableBorder: '#dee2e6',
  tableHeaderBg: '#f1f3f5',
  tableHeaderBorder: '#dee2e6',
  linkColor: '#0066cc',
  textMuted: '#6c757d',
  textSecondary: '#6b7280',
};

interface Event {
  title: string;
  url: string;
  start_date?: string | Date;
  end_date?: string | Date;
  duration_days?: number;
}

interface Day {
  date: string;
  events: Event[];
}

interface Month {
  date: string;
  days: Day[];
}

interface CalendarData {
  last_updated?: string;
  months: Month[];
}

export default function Home() {
  const data = calendarData as CalendarData;

  const formatMonthHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
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
    
    // Create a map of events by date, expanding multi-day events
    const eventsByDate = new Map<string, Event[]>();
    
    month.days.forEach(day => {
      day.events.forEach(event => {
        // Get start and end dates
        const startDate = event.start_date ? new Date(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString().split('T')[0]) : new Date(day.date);
        const endDate = event.end_date ? new Date(typeof event.end_date === 'string' ? event.end_date : event.end_date.toISOString().split('T')[0]) : new Date(day.date);
        
        // Add event to all days in its range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Only add if this date is in the current month
          if (currentDate.getMonth() === monthIndex && currentDate.getFullYear() === year) {
            if (!eventsByDate.has(dateStr)) {
              eventsByDate.set(dateStr, []);
            }
            eventsByDate.get(dateStr)!.push(event);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
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
      const events = eventsByDate.get(dateStr) || [];
      
      const dayData: Day = {
        date: dateStr,
        events: events
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
  const monthsWithEvents = data.months.filter(month =>
    month.days.some(day => day.events.length > 0)
  );

  return (
    <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-4" style={{ backgroundColor: '#f5f5f5', color: 'black', maxWidth: '1400px' }}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" style={{ color: '#333' }}>
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/' style={{ color: COLORS.linkColor }}>Daily Adventures</a>
      </h1>

      <p className="mb-4 sm:mb-6 text-xs sm:text-sm" style={{ color: COLORS.textMuted }}>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' style={{ color: COLORS.linkColor }}>daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      <div className="space-y-4 sm:space-y-6">
        {monthsWithEvents.map((month) => {
          const weeks = getCalendarGrid(month);
          
          return (
            <div key={month.date} style={{ backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: COLORS.headerBg, color: COLORS.headerText, padding: '10px 12px', fontSize: '16px', fontWeight: 'bold' }} className="sm:text-lg sm:px-4 sm:py-3">
                {formatMonthHeader(month.date)}
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.tableHeaderBg, borderBottom: `1px solid ${COLORS.tableHeaderBorder}` }}>
                      {dayOfWeekNamesMonFirst.map((day) => (
                        <th key={day} style={{ padding: '6px 4px', fontSize: '12px', fontWeight: '600', color: COLORS.textMuted, textAlign: 'left', width: '14.28%' }} className="sm:text-sm sm:px-2">
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
                                padding: '2px',
                                verticalAlign: 'top',
                                borderRight: `1px solid ${COLORS.tableBorder}`,
                                borderBottom: `1px solid ${COLORS.tableBorder}`,
                                backgroundColor: isWeekend ? COLORS.weekendBg : COLORS.weekdayBg,
                                minHeight: LAYOUT.cellMinHeight,
                                position: 'relative',
                              }}
                            >
                              {day ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: LAYOUT.cellMinHeight }}>
                                  <div style={{ 
                                    fontSize: '11px', 
                                    fontWeight: hasEvents ? '600' : '400',
                                    color: hasEvents ? '#333' : '#999',
                                    marginBottom: '2px',
                                    padding: '3px 4px'
                                  }}>
                                    {new Date(day.date).getDate()}
                                  </div>
                                  <div style={{ flex: 1, overflow: 'auto', padding: '0 2px' }}>
                                    {day.events.map((event, i) => {
                                      // Check if this is a multi-day event
                                      const durationDays = event.duration_days || 1;
                                      const isMultiDay = durationDays > 1;
                                      
                                      // Determine position in multi-day event
                                      const startDate = event.start_date ? (typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString().split('T')[0]) : day.date;
                                      const endDate = event.end_date ? (typeof event.end_date === 'string' ? event.end_date : event.end_date.toISOString().split('T')[0]) : day.date;
                                      const isFirstDay = day.date === startDate;
                                      const isLastDay = day.date === endDate;
                                      const isMiddleDay = !isFirstDay && !isLastDay;
                                      
                                      return (
                                        <div 
                                          key={i} 
                                          style={{
                                            backgroundColor: COLORS.eventBg,
                                            border: `1px solid ${COLORS.eventBorder}`,
                                            borderLeft: isFirstDay ? `2px solid ${COLORS.eventBorderLeft}` : `1px solid ${COLORS.eventBorder}`,
                                            borderRadius: isFirstDay && !isLastDay ? '2px 0 0 2px' : (!isFirstDay && isLastDay ? '0 2px 2px 0' : (isFirstDay && isLastDay ? '2px' : '0')),
                                            padding: '2px 4px',
                                            marginBottom: '2px',
                                            fontSize: '10px',
                                            lineHeight: '1.2',
                                            fontWeight: isMultiDay ? '500' : '400',
                                            opacity: isMiddleDay ? 0.75 : 1
                                          }}
                                        >
                                          <a 
                                            href={event.url} 
                                            style={{ 
                                              color: COLORS.eventText,
                                              textDecoration: 'none',
                                              display: 'block'
                                            }}
                                            title={`${event.title}${isMultiDay ? ` (${durationDays} ${durationDays === 1 ? 'den' : durationDays < 5 ? 'dny' : 'dní'})` : ''}`}
                                          >
                                            {isFirstDay ? (
                                              <>
                                                {event.title.length > LAYOUT.eventTitleMaxLength ? event.title.substring(0, LAYOUT.eventTitleTruncateAt) + '...' : event.title}
                                                {isMultiDay && <span style={{ opacity: 0.7, fontSize: '9px' }}> ({durationDays}d)</span>}
                                              </>
                                            ) : (
                                              <span style={{ opacity: 0.6 }}>↔ {event.title.length > LAYOUT.continuationMaxLength ? event.title.substring(0, LAYOUT.continuationTruncateAt) + '...' : event.title}</span>
                                            )}
                                          </a>
                                        </div>
                                      );
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
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 text-xs sm:text-sm" style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
        {data.last_updated && (
          <p className="mb-2">
            Data ze dne: {formatDate(data.last_updated)}
          </p>
        )}
        <p>
          Github: <a href='https://github.com/messa/da-calendar' style={{ color: COLORS.linkColor }}>github.com/messa/da-calendar</a>
        </p>
      </div>
    </main>
  );
}
