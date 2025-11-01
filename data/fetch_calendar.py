#!/usr/bin/env python3

'''
The curl command below is a request to the website daily-adventures.cz to get the events for April 2024.

curl 'https://daily-adventures.cz/wp-admin/admin-ajax.php' \
  -H 'authority: daily-adventures.cz' \
  -H 'accept: application/json, text/javascript, */*; q=0.01' \
  -H 'accept-language: cs,en-US;q=0.9,en;q=0.8,sk;q=0.7,de;q=0.6' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'cookie: cmplz_consented_services=; cmplz_policy_id=14; cmplz_marketing=allow; cmplz_statistics=allow; cmplz_preferences=allow; cmplz_functional=allow; cmplz_banner-status=dismissed' \
  -H 'origin: https://daily-adventures.cz' \
  -H 'referer: https://daily-adventures.cz/kalendar-akci-a-kurzu/' \
  -H 'sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw 'action=simcal_default_calendar_draw_grid&month=4&year=2024&id=12100'
'''

from argparse import ArgumentParser
from base64 import b64decode
from datetime import date, datetime, timedelta, timezone
import json
from logging import getLogger, basicConfig, DEBUG, INFO
from lxml.html import fragment_fromstring, tostring, document_fromstring
from lzma import decompress
from pathlib import Path
import re
from reprlib import repr as smart_repr
import requests


logger = getLogger(__name__)
rs = requests.Session()

# Cache for course durations to avoid fetching the same page multiple times
_course_duration_cache = {}


def main():
    p = ArgumentParser()
    p.add_argument('--output', '-o', help='Output file (default: calendar.json)')
    p.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    args = p.parse_args()
    setup_logging(verbose=args.verbose)
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=365//2)
    end_date = end_date.replace(month=12).date()
    month_date = start_date.replace(day=1).date()
    output = {'months': []}
    while month_date < end_date:
        month_html = retrieve_month_html(month_date)
        parsed_days = parse_month_html(month_html, month_date)
        output['months'].append({
            'date': month_date,
            'days': parsed_days,
        })
        month_date = next_month(month_date)
    output = transform_to_json(output)
    output_json = json.dumps(output, indent=2)
    if args.output == '-':
        print(output_json)
    else:
        if args.output:
            output_path = Path(args.output)
        else:
            output_path = Path(__file__).resolve().parent / 'calendar.json'
        temp_path = output_path.with_name(f'.{output_path.name}.temp')
        temp_path.write_text(output_json + '\n')
        temp_path.rename(output_path)


def setup_logging(verbose):
    basicConfig(
        format='%(asctime)s %(name)s %(levelname)5s: %(message)s',
        level=DEBUG if verbose else INFO)


def next_month(month_date):
    return (month_date.replace(day=1) + timedelta(days=32)).replace(day=1)


def transform_to_json(value):
    if isinstance(value, (list, tuple)):
        return [transform_to_json(x) for x in value]
    if isinstance(value, dict):
        return {k: transform_to_json(v) for k, v in value.items()}
    if isinstance(value, (str, int, float, bool, type(None))):
        return value
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    raise ValueError(f'Unsupported type: {type(value)}')


def retrieve_month_html(month_date):
    logger.info('Retrieving events for %s', month_date)
    url = 'https://daily-adventures.cz/wp-admin/admin-ajax.php'
    headers = {
        'authority': 'daily-adventures.cz',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://daily-adventures.cz',
        'referer': 'https://daily-adventures.cz/kalendar-akci-a-kurzu/',
    }
    data = {
        'action': 'simcal_default_calendar_draw_grid',
        'year': month_date.year,
        'month': month_date.month,
        'id': 12100,
    }
    logger.debug('POST %s data: %s', url, data)
    r = rs.post(url, headers=headers, data=data, timeout=30)
    r.raise_for_status()
    rj = r.json()
    logger.debug('Response: %s', smart_repr(rj))
    assert rj.keys() == {'success', 'data'}
    assert rj['success'] == True
    #print('\n'.join(wrap(standard_b64encode(compress(rj['data'].encode('utf-8'))).decode('ascii'), 110)))
    return rj['data']


def parse_month_html(data, month_date):
    tbody = fragment_fromstring(data)
    previous_day = None
    result_days = []
    for tr in tbody.xpath('./tr'):
        for td in tr.xpath('./td'):
            td_html = tostring(td, encoding='utf-8').decode('utf-8')
            try:
                td_classes = td.attrib['class'].split()
                if 'simcal-day-void' in td_classes:
                    continue
                assert 'simcal-day' in td_classes

                day = None
                for class_name in td_classes:
                    if class_name.startswith('simcal-day-'):
                        day = int(class_name[len('simcal-day-'):])
                        break
                assert day

                if previous_day is not None:
                    assert day == previous_day + 1
                previous_day = day

                day_date = month_date.replace(day=day)

                result_day = {
                    'date': day_date,
                    'events': [],
                }
                result_days.append(result_day)

                logger.debug('day: %s day_date: %s', day, day_date)

                li_events = td.xpath('.//ul[@class="simcal-events"]/li')
                assert bool(li_events) == ('simcal-day-has-events' in td_classes)

                for li_event in li_events:
                    li_event_classes = li_event.attrib['class'].split()
                    assert 'simcal-event' in li_event_classes

                    span_title = li_event.xpath('.//span[@class="simcal-event-title"]')[0]
                    title = span_title.text_content()
                    logger.debug('  title: %r', title)

                    urls = []
                    preferred_url = None
                    for a in li_event.xpath('.//a'):
                        logger.debug('  a: %r -> %r', a.text_content(), a.attrib['href'])
                        urls.append(a.attrib['href'])
                        if 'daily-adventures.cz' in a.attrib['href']:
                            preferred_url = a.attrib['href']

                    if not preferred_url and urls:
                        preferred_url = urls[0]

                    result_day['events'].append({
                        'title': title,
                        'url': preferred_url,
                    })
            except Exception as e:
                raise Exception(f'Failed to parse {td_html.strip()}: {e}') from e

            #print(td)
            #print(td.text_content())
            #print(tostring(td, pretty_print=True, encoding='utf-8').decode('utf-8'))

    # Consolidate multi-day events
    return consolidate_multiday_events(result_days)


def fetch_course_duration(url):
    """
    Fetch the course page and extract the actual duration from the 'POČET DNÍ:' field.
    Returns the number of days the course actually lasts, or None if not found.
    """
    if not url or 'daily-adventures.cz' not in url:
        return None
    
    # Check cache first
    if url in _course_duration_cache:
        return _course_duration_cache[url]
    
    try:
        logger.debug(f'Fetching course page: {url}')
        r = rs.get(url, timeout=10)
        r.raise_for_status()
        doc = document_fromstring(r.text)
        
        # Get the full text content
        text = doc.text_content()
        
        # Look for "POČET DNÍ:" pattern (NUMBER OF DAYS:)
        # Patterns: "POČET DNÍ: 1 den", "POČET DNÍ: 2 dny", "POČET DNÍ: 3 dny"
        match = re.search(r'POČET\s+DNÍ:\s*(\d+)\s*d(?:en|ny|ní)', text, re.IGNORECASE)
        if match:
            days = int(match.group(1))
            logger.debug(f'Found duration for {url}: {days} days')
            _course_duration_cache[url] = days
            return days
        
        logger.debug(f'Duration not found for {url}')
        _course_duration_cache[url] = None
        return None
    except Exception as e:
        logger.warning(f'Error fetching course page {url}: {e}')
        _course_duration_cache[url] = None
        return None


def consolidate_multiday_events(days):
    """Convert events that repeat on consecutive days into multi-day event ranges."""
    # Build a map of event title+url -> dates
    event_dates = {}
    for day in days:
        for event in day['events']:
            key = (event['title'], event['url'])
            if key not in event_dates:
                event_dates[key] = []
            event_dates[key].append(day['date'])
    
    # Find consecutive date ranges for each event and fetch actual duration
    event_ranges = {}
    event_actual_durations = {}
    
    for (title, url), dates in event_dates.items():
        dates.sort()
        ranges = []
        current_start = dates[0]
        current_end = dates[0]
        
        for i in range(1, len(dates)):
            if dates[i] == current_end + timedelta(days=1):
                # Consecutive day
                current_end = dates[i]
            else:
                # Gap found, save current range and start new one
                ranges.append((current_start, current_end))
                current_start = dates[i]
                current_end = dates[i]
        
        # Don't forget the last range
        ranges.append((current_start, current_end))
        
        event_ranges[(title, url)] = ranges
        
        # Fetch actual duration from course page
        actual_duration = fetch_course_duration(url)
        event_actual_durations[(title, url)] = actual_duration
    
    # Build new days structure with events properly categorized
    result_days = []
    processed_events = set()  # Track (title, url, start_date) to avoid duplicates
    
    for day in days:
        new_day = {
            'date': day['date'],
            'events': [],
        }
        
        for event in day['events']:
            key = (event['title'], event['url'])
            ranges = event_ranges[key]
            actual_duration = event_actual_durations.get(key)
            
            # Find which range this day belongs to
            for start_date, end_date in ranges:
                if start_date <= day['date'] <= end_date:
                    calendar_duration = (end_date - start_date).days + 1
                    
                    # Determine event type based on actual duration vs calendar duration
                    is_multiday_event = False
                    event_type = None
                    
                    if actual_duration is not None:
                        # We have actual duration from the course page
                        if actual_duration == 1 and calendar_duration > 1:
                            # Single-day course repeated on consecutive days
                            event_type = 'repeated_single_day'
                        elif actual_duration > 1:
                            # Multi-day continuous event
                            event_type = 'multi_day'
                            is_multiday_event = True
                        else:
                            # Single day event
                            event_type = 'single_day'
                    else:
                        # Fallback: if calendar duration > 1, assume it might be multi-day
                        # but we're not certain
                        if calendar_duration > 1:
                            event_type = 'multi_day'  # Conservative assumption
                            is_multiday_event = True
                        else:
                            event_type = 'single_day'
                    
                    # For repeated single-day events, add an event for each day
                    # For multi-day events, only add on the first day
                    should_add = False
                    if event_type == 'repeated_single_day':
                        # Add event on each day of the range
                        event_key_single = (event['title'], event['url'], day['date'])
                        if event_key_single not in processed_events:
                            should_add = True
                            processed_events.add(event_key_single)
                    else:
                        # Multi-day or single-day: only add on first day
                        event_key = (event['title'], event['url'], start_date)
                        if day['date'] == start_date and event_key not in processed_events:
                            should_add = True
                            processed_events.add(event_key)
                    
                    if should_add:
                        new_event = {
                            'title': event['title'],
                            'url': event['url'],
                        }
                        
                        if event_type == 'repeated_single_day':
                            # For repeated single-day events, use the single day date
                            new_event['start_date'] = day['date']
                            new_event['end_date'] = day['date']
                            new_event['event_type'] = 'repeated_single_day'
                        else:
                            # For multi-day or single-day events
                            new_event['start_date'] = start_date
                            new_event['end_date'] = end_date
                            if calendar_duration > 1:
                                new_event['duration_days'] = calendar_duration
                                new_event['event_type'] = event_type
                        
                        new_day['events'].append(new_event)
                    break
        
        result_days.append(new_day)
    
    return result_days


sample_response = '''
    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
'''


def test_parse_month_html():
    """Test that the month HTML parsing and event consolidation works correctly."""
    parsed_days = parse_month_html(decompress(b64decode(sample_response.strip())).decode('utf-8'), date(2024, 3, 1))
    
    # Check basic structure
    assert len(parsed_days) == 31  # March has 31 days
    assert all(isinstance(d, dict) for d in parsed_days)
    assert all('date' in d and 'events' in d for d in parsed_days)
    
    # Check that multi-day events are only on first day of range
    days_with_events = [d for d in parsed_days if d['events']]
    assert len(days_with_events) == 6  # Only 6 days should have events
    
    # Verify specific events
    # March 1: LAVINOVÝ KURZ starting
    march_1 = parsed_days[0]
    assert march_1['date'] == date(2024, 3, 1)
    assert len(march_1['events']) == 1
    event = march_1['events'][0]
    assert event['title'] == 'LAVINOVÝ KURZ - JESENÍKY'
    assert event['start_date'] == date(2024, 3, 1)
    assert event['end_date'] == date(2024, 3, 3)
    assert event.get('duration_days', 1) == 3
    
    # March 2-3: Should be empty (multi-day event only appears on first day)
    assert parsed_days[1]['events'] == []
    assert parsed_days[2]['events'] == []
    
    # March 8: Skialpový kurz starting
    march_8 = parsed_days[7]
    assert march_8['date'] == date(2024, 3, 8)
    assert len(march_8['events']) == 1
    event = march_8['events'][0]
    assert 'Skialpový kurz' in event['title']
    assert event['start_date'] == date(2024, 3, 8)
    assert event['end_date'] == date(2024, 3, 10)
    
    # March 11: Single-day event
    march_11 = parsed_days[10]
    assert march_11['date'] == date(2024, 3, 11)
    assert len(march_11['events']) == 1
    event = march_11['events'][0]
    assert 'UMĚLÉ STĚNĚ PRO ZAČÁTEČNÍKY' in event['title']
    assert event['start_date'] == date(2024, 3, 11)
    assert event['end_date'] == date(2024, 3, 11)
    
    # March 15: Two multi-day events starting
    march_15 = parsed_days[14]
    assert march_15['date'] == date(2024, 3, 15)
    assert len(march_15['events']) == 2
    
    # March 29: Another LAVINOVÝ KURZ starting
    march_29 = parsed_days[28]
    assert march_29['date'] == date(2024, 3, 29)
    assert len(march_29['events']) == 1
    event = march_29['events'][0]
    assert event['title'] == 'LAVINOVÝ KURZ - JESENÍKY'
    assert event['start_date'] == date(2024, 3, 29)
    assert event['end_date'] == date(2024, 3, 31)
    
    print("✓ All tests passed!")


if __name__ == '__main__':
    test_parse_month_html()
    main()
