import calendarData from '../data/calendar.json';

export default function Home() {
  return (
    <main>
      <h1>Hello World!</h1>
      <pre>{JSON.stringify(calendarData, null, 2)}</pre>
    </main>
  );
}
