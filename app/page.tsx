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
const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 
                    'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

export default function Home() {
  // Filter out months with no events
  const monthsWithEvents = calendarData.months.map(month => ({
    ...month,
    days: month.days.filter(day => day.events.length > 0)
  })).filter(month => month.days.length > 0);

  const formatMonthHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = dayOfWeekNames[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayOfWeek} ${day}. ${month}.`;
  };

  return (
    <main className="container mx-auto px-4 py-6" style={{ backgroundColor: 'white', color: 'black', maxWidth: '900px' }}>
      <h1 className="text-3xl font-bold mb-6">
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/' style={{ color: 'blue' }}>Daily Adventures</a>
      </h1>

      <p className="mb-6" style={{ fontSize: '14px' }}>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' style={{ color: 'blue' }}>daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      <div className="space-y-8">
        {monthsWithEvents.map((month) => (
          <div key={month.date}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ borderBottom: '2px solid #e5e7eb' }}>
              {formatMonthHeader(month.date)}
            </h2>
            <div className="space-y-4">
              {month.days.map((day) => (
                <div key={day.date} className="pl-4" style={{ borderLeft: '3px solid #e5e7eb' }}>
                  <div className="font-semibold mb-2" style={{ color: '#374151' }}>
                    {formatDate(day.date)}
                  </div>
                  <div className="space-y-2 ml-4">
                    {day.events.map((event, i) => (
                      <div key={i} className="pb-2">
                        <a href={event.url} style={{ color: 'blue', textDecoration: 'underline' }}>
                          {event.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 pt-4" style={{ borderTop: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
        Github: <a href='https://github.com/messa/da-calendar' style={{ color: 'blue' }}>github.com/messa/da-calendar</a>
      </p>
    </main>
  );
}
