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

export default function Home() {
  return (
    <main className="container mx-auto px-4" style={{ backgroundColor: 'white', color: 'black' }}>
      <h1 className="text-2xl font-bold mb-4">
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/' style={{ color: 'blue' }}>Daily Adventures</a>
      </h1>

      <p className="mb-4" style={{ fontSize: '14px' }}>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/' style={{ color: 'blue' }}>daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {calendarData.months.map((month) => (
          <div key={month.date} className="mb-4">
            <h3 className="text-lg font-bold mb-2">{month.date.substring(0, 7)}</h3>
            {month.days.map((day) => (
              <div key={day.date} className="mb-2">
                <span className="mr-2">{dayOfWeekNames[new Date(day.date).getDay()]}</span>
                <span className="mr-2">{new Date(day.date).getDate()}.</span>
                {day.events.map((event, i) => (
                  <span key={event.title}>
                    {i > 0 && ' / '}
                    <a href={event.url} style={{ color: 'blue' }}>{event.title}</a>
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mb-4">
        Github: <a href='https://github.com/messa/da-calendar' style={{ color: 'blue' }}>github.com/messa/da-calendar</a>
      </p>
    </main>
  );
}
