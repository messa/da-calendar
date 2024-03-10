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
    <main>
      <h1>
        Kalendář akcí a kurzů{' '}
        <a href='https://daily-adventures.cz/'>Daily Adventures</a>
      </h1>

      <p>
        Tato stránka shromažďuje informace o akcích a kurzech, které jsou dostupné na
        stránce <a href='https://daily-adventures.cz/kalendar-akci-a-kurzu/'>https://daily-adventures.cz/kalendar-akci-a-kurzu/</a>.
      </p>

      {calendarData.months.map((month) => (
        <div key={month.date}>
          <h3>{month.date.substring(0, 7)}</h3>
          {month.days.map((day) => (
            <div key={day.date}>
              {dayOfWeekNames[new Date(day.date).getDay()]}{' '}
              {new Date(day.date).getDate()}{'. '}
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
