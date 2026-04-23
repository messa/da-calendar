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
const monthNames = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];

// Layout constants
const LAYOUT = {
  cellMinHeight: '85px',
  eventTitleMaxLength: 35,
  eventTitleTruncateAt: 32,
  continuationMaxLength: 30,
  continuationTruncateAt: 27,
};

// Modern design colors with adventure theme
const COLORS = {
  // Primary gradient colors (mountain/adventure theme)
  headerGradientStart: '#1e3a5f',
  headerGradientEnd: '#2563eb',
  headerText: 'white',
  
  // Background colors
  pageBg: '#f0f4f8',
  weekendBg: '#f8fafc',
  weekdayBg: '#ffffff',
  todayBg: '#fef3c7',
  
  // Event colors
  eventBg: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
  eventBgSolid: '#dbeafe',
  eventBorder: '#3b82f6',
  eventBorderLeft: '#2563eb',
  eventText: '#1e40af',
  eventHoverBg: '#bfdbfe',
  
  // Multi-day event colors
  multiDayBg: 'linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%)',
  multiDayBgSolid: '#c7d2fe',
  multiDayBorder: '#8b5cf6',
  multiDayText: '#5b21b6',
  
  // Table colors
  tableBorder: '#e2e8f0',
  tableHeaderBg: '#f1f5f9',
  tableHeaderText: '#475569',
  
  // Link and text colors
  linkColor: '#2563eb',
  linkHoverColor: '#1d4ed8',
  textMuted: '#64748b',
  textSecondary: '#475569',
  textPrimary: '#1e293b',
  
  // Shadow
  cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardHoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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

export default function Home() {
  const formatMonthHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  // Get today's date for highlighting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
  const monthsWithEvents = calendarData.months.filter(month => 
    month.days.some(day => day.events.length > 0)
  );

  return (
    <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-8" style={{ backgroundColor: COLORS.pageBg, color: 'black', maxWidth: '1400px', minHeight: '100vh' }}>
      {/* Header Section */}
      <header className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: `linear-gradient(135deg, ${COLORS.headerGradientStart} 0%, ${COLORS.headerGradientEnd} 100%)`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
          }}>
            <span style={{ fontSize: '24px' }}>🏔️</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>
              Kalendář akcí a kurzů
            </h1>
            <a 
              href='https://daily-adventures.cz/' 
              className="text-lg sm:text-xl font-semibold hover:underline transition-all"
              style={{ color: COLORS.linkColor }}
            >
              Daily Adventures
            </a>
          </div>
        </div>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: COLORS.textSecondary, lineHeight: '1.6' }}>
          Tato stránka shromažďuje informace o akcích a kurzech z{' '}
          <a 
            href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' 
            className="hover:underline font-medium"
            style={{ color: COLORS.linkColor }}
          >
            daily-adventures.cz
          </a>
        </p>
      </header>

      <div className="space-y-6 sm:space-y-8">
        {monthsWithEvents.map((month) => {
          const weeks = getCalendarGrid(month);
          
          return (
            <div 
              key={month.date} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: COLORS.cardShadow,
                transition: 'box-shadow 0.3s ease'
              }}
              className="hover:shadow-lg"
            >
              {/* Month Header */}
              <div 
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.headerGradientStart} 0%, ${COLORS.headerGradientEnd} 100%)`,
                  color: COLORS.headerText, 
                  padding: '16px 20px', 
                  fontSize: '20px', 
                  fontWeight: '700',
                  letterSpacing: '0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }} 
                className="sm:text-2xl sm:px-6 sm:py-4"
              >
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '8px 12px', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  📅
                </span>
                {formatMonthHeader(month.date)}
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.tableHeaderBg, borderBottom: `2px solid ${COLORS.tableBorder}` }}>
                      {dayOfWeekNamesMonFirst.map((day, index) => (
                        <th 
                          key={day} 
                          style={{ 
                            padding: '12px 8px', 
                            fontSize: '13px', 
                            fontWeight: '700', 
                            color: index >= 5 ? COLORS.linkColor : COLORS.tableHeaderText, 
                            textAlign: 'center', 
                            width: '14.28%',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }} 
                          className="sm:text-sm sm:px-3"
                        >
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
                          const isToday = day && day.date === todayStr;
                          
                          return (
                            <td 
                              key={dayIndex}
                              style={{
                                padding: '4px',
                                verticalAlign: 'top',
                                borderRight: `1px solid ${COLORS.tableBorder}`,
                                borderBottom: `1px solid ${COLORS.tableBorder}`,
                                backgroundColor: isToday ? COLORS.todayBg : (isWeekend ? COLORS.weekendBg : COLORS.weekdayBg),
                                minHeight: LAYOUT.cellMinHeight,
                                position: 'relative',
                                transition: 'background-color 0.2s ease',
                              }}
                            >
                              {day ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: LAYOUT.cellMinHeight }}>
                                  <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: hasEvents ? '700' : '500',
                                    color: isToday ? COLORS.linkColor : (hasEvents ? COLORS.textPrimary : COLORS.textMuted),
                                    marginBottom: '4px',
                                    padding: '4px 6px',
                                    borderRadius: isToday ? '50%' : '0',
                                    backgroundColor: isToday ? '#dbeafe' : 'transparent',
                                    width: isToday ? '28px' : 'auto',
                                    height: isToday ? '28px' : 'auto',
                                    display: isToday ? 'flex' : 'block',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {new Date(day.date).getDate()}
                                  </div>
                                  <div style={{ flex: 1, overflow: 'auto', padding: '0 4px 4px 4px' }}>
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
                                      
                                      // Choose colors based on whether it's a multi-day event
                                      const bgColor = isMultiDay ? COLORS.multiDayBgSolid : COLORS.eventBgSolid;
                                      const borderColor = isMultiDay ? COLORS.multiDayBorder : COLORS.eventBorder;
                                      const textColor = isMultiDay ? COLORS.multiDayText : COLORS.eventText;
                                      
                                      return (
                                        <div 
                                          key={i} 
                                          className="event-card"
                                          style={{
                                            background: bgColor,
                                            border: `1px solid ${borderColor}`,
                                            borderLeft: isFirstDay ? `3px solid ${borderColor}` : `1px solid ${borderColor}`,
                                            borderRadius: isFirstDay && !isLastDay ? '6px 0 0 6px' : (!isFirstDay && isLastDay ? '0 6px 6px 0' : (isFirstDay && isLastDay ? '6px' : '0')),
                                            padding: '4px 8px',
                                            marginBottom: '4px',
                                            fontSize: '11px',
                                            lineHeight: '1.4',
                                            fontWeight: isMultiDay ? '600' : '500',
                                            opacity: isMiddleDay ? 0.8 : 1,
                                          }}
                                        >
                                          <a 
                                            href={event.url} 
                                            style={{ 
                                              color: textColor,
                                              textDecoration: 'none',
                                              display: 'block'
                                            }}
                                            title={`${event.title}${isMultiDay ? ` (${durationDays} ${durationDays === 1 ? 'den' : durationDays < 5 ? 'dny' : 'dní'})` : ''}`}
                                          >
                                            {isFirstDay ? (
                                              <>
                                                {event.title.length > LAYOUT.eventTitleMaxLength ? event.title.substring(0, LAYOUT.eventTitleTruncateAt) + '...' : event.title}
                                                {isMultiDay && <span style={{ opacity: 0.8, fontSize: '10px', marginLeft: '4px' }}>📆 {durationDays}d</span>}
                                              </>
                                            ) : (
                                              <span style={{ opacity: 0.75 }}>→ {event.title.length > LAYOUT.continuationMaxLength ? event.title.substring(0, LAYOUT.continuationTruncateAt) + '...' : event.title}</span>
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

      {/* Footer */}
      <footer className="mt-10 pt-6 pb-4 border-t" style={{ borderColor: COLORS.tableBorder }}>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm" style={{ color: COLORS.textSecondary }}>
          <span>Vytvořeno s ❤️ pro outdoorovou komunitu</span>
          <span className="hidden sm:inline">•</span>
          <a 
            href='https://github.com/messa/da-calendar' 
            className="flex items-center gap-2 hover:underline font-medium"
            style={{ color: COLORS.linkColor }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            github.com/messa/da-calendar
          </a>
        </div>
      </footer>
    </main>
  );
}
