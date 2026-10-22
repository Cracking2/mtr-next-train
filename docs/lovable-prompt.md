# Lovable MVP prompt

Paste the block below into Lovable as the first message.

```text
Build a mobile-first web app "港鐵下一班車 MTR Next Train" showing real-time next-train times for Hong Kong MTR heavy rail. Frontend only, no backend, no login.

DATA (public, CORS open, no API key)
- Trains: GET https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={LINE}&sta={STA}&lang=TC
  Response: data["{LINE}-{STA}"].UP[] and .DOWN[], each item {seq, dest (station code), plat, time "YYYY-MM-DD HH:mm:ss" HK time, valid "Y"/"N"}; top level {isdelay "Y"/"N", status 1/0, message}.
  Quirks: terminus stations return only one direction; status 0 with error.errorCode "NT-204" means no trains (e.g. after service hours), not an error; dest is always a code, so station names must come from the station list; drop valid "N".
- Stations: https://opendata.mtr.com.hk/data/mtr_lines_and_stations.csv (Line Code, Direction, Station Code, Chinese Name, English Name, Sequence). Fetch once and bundle as static JSON. Directions ending in -UT/-DT besides UT/DT are branches (TKL to LOHAS Park, EAL to Lok Ma Chau).

FEATURES
1. Home: search box (Chinese name, English name or station code), saved stations with next 2 trains per direction, "Browse by line" list.
2. Line page: vertical route diagram in the line colour; interchange stations show other line badges.
3. Station page: tabs per line at interchanges; for each direction show "To {dest} · Platform {n}" and up to 4 trains; star to save station+line (localStorage) with an undo toast.
4. Auto-refresh every 15 s. Countdown = train time minus device clock, shown as "3 分" with the clock time underneath; under 1 minute show "即將抵達". No seconds.
5. Chinese/English toggle, remembered.

STATES: skeleton while loading; delay banner when isdelay is Y; "No train data, service may have ended" for NT-204; error card with Retry; if a refresh fails keep the last data and show "Updated 45s ago, times may be out of date" with Reload.

DESIGN: neutral white/near-black cards (follow system dark mode), line colour only as a 3px left stripe and small code badges, never as large backgrounds. Largest text is the first train's minutes (24px, tabular numbers). Min 44px touch targets, WCAG AA contrast. One accent colour for buttons/links.
Line colours: EAL #53B7E8, TML #923011, TWL #ED1D24, KTL #00AB4E, ISL #007DC5, TKL #7D499D, SIL #BAC429, TCL #F7943E, AEL #00888A, DRL #F173AC. Dark text on EAL, KTL, SIL, TCL, DRL badges; white on the rest.

FOOTER: "Data: DATA.GOV.HK · Not affiliated with MTR Corporation". Do not use the MTR logo.
```

## Why each part is there

- **The API quirks** are what we found by testing in M0. Without them Lovable would most likely show an error at terminus stations and after service hours, and count down from the API's `curr_time`, which runs 10–15 seconds behind.
- **The line colours and badge text colours** are the values already checked for contrast in `ui-ux-plan.md`.
- **Geolocation is left out.** It needs a separate coordinates file, so add it as a follow-up prompt once the MVP works.
