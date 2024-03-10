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
    <main className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/'>Daily Adventures</a>
      </h1>

      <p className="mb-4">
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/'>https://daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

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
                  <a href={event.url}>{event.title}</a>
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
