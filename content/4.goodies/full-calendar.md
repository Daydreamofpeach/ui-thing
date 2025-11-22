---
title: Full Calendar
description: Display a full calendar in your nuxt app.
---

## Getting Started

:::Steps

::Step

### Installation

To get started, you can install the package with the following command:

```bash
npm install --save @fullcalendar/core @fullcalendar/vue3
```

::

::Step

### Add Plugins

You can also install the plugins for Full Calendar:

```bash
npm i @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid @fullcalendar/list @fullcalendar/multimonth @fullcalendar/scrollgrid
```

::

::Step

### Update CSS

In order to make the calendar match the buildittheme, I had to create the `full-calendar.css` file and import it in the `nuxt.config.ts` file.

<!-- automd:file src="../../app/assets/css/full-calendar.css" code lang="css" -->

```css [full-calendar.css]
/*
for css vars only.
these values are automatically known in all stylesheets.
the :root statement itself is only included in the common stylesheet.
this file is not processed by postcss when imported into the postcss-custom-properties plugin,
so only write standard css!

NOTE: for old browsers, will need to restart watcher after changing a variable
*/

@reference "./tailwind.css";

:root {
  --fc-small-font-size: var(--text-sm);
  --fc-page-bg-color: var(--color-background);
  --fc-neutral-bg-color: var(--color-muted);
  --fc-neutral-text-color: var(--color-foreground);
  --fc-border-color: var(--color-border);

  --fc-button-text-color: var(--color-foreground);
  --fc-button-bg-color: var(--color-background);
  --fc-button-border-color: var(--color-input);
  --fc-button-hover-bg-color: var(--color-accent);
  --fc-button-hover-border-color: var(--color-input);
  --fc-button-active-bg-color: var(--color-accent);
  --fc-button-active-border-color: var(--color-input);

  --fc-event-bg-color: var(--color-primary);
  --fc-event-border-color: var(--color-input);
  --fc-event-text-color: var(--color-primary-foreground);
  --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);

  --fc-more-link-bg-color: #d0d0d0;
  --fc-more-link-text-color: inherit;

  --fc-event-resizer-thickness: 8px;
  --fc-event-resizer-dot-total-width: 8px;
  --fc-event-resizer-dot-border-width: 1px;

  --fc-non-business-color: rgba(215, 215, 215, 0.3);
  --fc-bg-event-color: rgb(143, 223, 130);
  --fc-bg-event-opacity: 0.3;
  --fc-highlight-color: --alpha(var(--colors-primary) / 10%);
  --fc-today-bg-color: --alpha(var(--colors-primary) / 10%);
  --fc-now-indicator-color: red;

  --fc-list-event-hover-bg-color: --alpha(var(--colors-primary) / 10%);
}

/* Toolbar buttons */
.fc {
  .fc-button {
    @apply inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium capitalize;
    .fc-icon {
      @apply text-sm/none;
    }
  }
  .fc-button-primary {
    @apply z-10 focus:shadow-none focus:ring-[3px] focus:ring-ring/50;
    &.fc-button-active {
      @apply z-10 focus:shadow-none focus:ring-[3px] focus:ring-ring/50;
    }
  }
}
/* Toolbar */
.fc .fc-toolbar {
  @apply grid gap-3 md:flex md:items-center md:justify-between;
  .fc-toolbar-chunk + .fc-toolbar-title {
    @apply order-1 md:order-none;
  }
}
/* Toolbar title */
.fc .fc-toolbar-title {
  @apply text-xl font-bold tracking-tight;
}
/* Calendar header cell */
.fc .fc-col-header-cell-cushion,
.fc .fc-timegrid-slot-label-cushion,
.fc .fc-timegrid-axis-cushion {
  @apply text-base/7 font-semibold;
}
/* Calendar: month day number */
.fc .fc-daygrid-day-number {
  @apply cursor-pointer text-base/7 font-medium;
}
.fc .fc-daygrid-month-start {
  @apply text-lg/7 font-semibold;
}
/* List text */
.fc-list-day-text,
.fc-list-day-side-text {
  @apply text-base/7 font-semibold;
}
.fc-h-event .fc-event-main-frame {
  @apply items-center;
}
.fc .fc-list-event-time,
.fc .fc-event-time {
  @apply align-middle text-sm/none font-normal;
}
.fc .fc-event-time {
  @apply mr-2;
}

.fc .fc-list-event-title {
  @apply align-middle text-sm/none font-semibold;
}

/* Event inside month view */
.fc .fc-daygrid-event {
  @apply rounded-md font-medium;
}
.fc .fc-h-event .fc-event-main {
  @apply px-1;
}
/* MultiMonth */
.fc .fc-multimonth-multicol .fc-daygrid-more-link {
  @apply border-primary bg-primary text-[10px] leading-4 text-primary-foreground;
}

/* Mulimonth popup */
.fc-theme-standard .fc-popover {
  @apply rounded-md;
}

.fc-popover-header {
  @apply px-3;
  .fc-popover-title {
    @apply text-base/10 font-bold tracking-tight;
  }
}
```

<!-- /automd -->

::
:::

## Usage

### Month View

::ShowCase

:DocsFullCalendar

#code

<!-- automd:file src="../../app/components/content/Docs/FullCalendar/DocsFullCalendar.vue" code lang="vue" -->

```vue [DocsFullCalendar.vue]
<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import dayGridPlugin from "@fullcalendar/daygrid";
  import interactionPlugin from "@fullcalendar/interaction";
  import FullCalendar from "@fullcalendar/vue3";
  import dayjs from "dayjs";
  import type { CalendarOptions } from "@fullcalendar/core";

  const calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    dateClick: (info) => {
      console.log(info.dateStr);
    },
    stickyHeaderDates: true,
    editable: true,
    headerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "title",
      right: "dayGridDay,dayGridWeek,dayGridMonth,dayGridYear",
    },
    footerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "",
      right: "dayGridDay,dayGridWeek,dayGridMonth,dayGridYear",
    },
    events: [
      {
        title: "Attend Data Protection Act Webinar",
        date: dayjs().toDate().toISOString(),
        url: "https://ui-thing.behonbaker.com/",
      },
      {
        title: "Travel to Kingston for Manager's Meeting",
        date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      },
    ],
  };
</script>

<style>
  /* Because the doc's navbar is blocking it 🙄 */
  .fc .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky > * {
    top: 55px;
  }
</style>
```

<!-- /automd -->

::

### List View

::ShowCase

:DocsFullCalendarList

#code

<!-- automd:file src="../../app/components/content/Docs/FullCalendar/DocsFullCalendarList.vue" code lang="vue" -->

```vue [DocsFullCalendarList.vue]
<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import listPlugin from "@fullcalendar/list";
  import FullCalendar from "@fullcalendar/vue3";
  import dayjs from "dayjs";
  import type { CalendarOptions } from "@fullcalendar/core";

  const calendarOptions: CalendarOptions = {
    plugins: [listPlugin],
    initialView: "listMonth",
    headerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "title",
      right: "listDay,listWeek,listMonth",
    },
    footerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "",
      right: "listWeek,listDay,listMonth",
    },
    buttonText: { listWeek: "List Week", listDay: "List Day", listMonth: "List Month" },
    events: [
      {
        title: "Attend Data Protection Act Webinar",
        date: dayjs().add(1, "day").hour(9).toDate(),
        url: "https://ui-thing.behonbaker.com/",
      },
      {
        title: "Travel to Kingston for Manager's Meeting",
        date: dayjs().add(3, "day").hour(10).toDate(),
      },
      {
        title: "Vacation in Montego Bay",
        allDay: true,
        color: "green",
        date: dayjs().add(1, "week").toDate(),
        end: dayjs().add(2, "week").toDate(),
      },
    ],
  };
</script>
```

<!-- /automd -->

::

### TimeGrid View

::ShowCase

:DocsFullCalendarTimeGrid

#code

<!-- automd:file src="../../app/components/content/Docs/FullCalendar/DocsFullCalendarTimeGrid.vue" code lang="vue" -->

```vue [DocsFullCalendarTimeGrid.vue]
<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import interactionPlugin from "@fullcalendar/interaction";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import FullCalendar from "@fullcalendar/vue3";
  import dayjs from "dayjs";
  import type { CalendarOptions } from "@fullcalendar/core";

  const calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: "timeGridWeek",
    editable: true,
    nowIndicator: true,
    dateClick(arg) {
      useSonner("Date clicked", {
        description: dayjs(arg.dateStr).format("dddd, MMMM D, YYYY h:mm A"),
      });
    },
    eventClick(arg) {
      useSonner("Event clicked", {
        description: arg.event.title,
      });
    },
    stickyHeaderDates: true,
    headerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "title",
      right: "timeGridWeek,timeGridDay",
    },
    footerToolbar: {
      left: "prevYear,prev,today,next,nextYear",
      center: "",
      right: "timeGridWeek,timeGridDay",
    },
    events: [
      {
        title: "Attend Data Protection Act Webinar",
        date: dayjs().add(1, "day").hour(9).toDate(),
        url: "https://ui-thing.behonbaker.com/",
      },
      {
        title: "Travel to Kingston for Manager's Meeting",
        date: dayjs().add(3, "day").hour(10).toDate(),
      },
      {
        title: "Vacation in Montego Bay",
        allDay: true,
        color: "green",
        date: dayjs().add(1, "week").toDate(),
        end: dayjs().add(2, "week").toDate(),
      },
    ],
  };
</script>
```

<!-- /automd -->

::

### MultiMonth View

::ShowCase

:DocsFullCalendarMultiMonth

#code

<!-- automd:file src="../../app/components/content/Docs/FullCalendar/DocsFullCalendarMultiMonth.vue" code lang="vue" -->

```vue [DocsFullCalendarMultiMonth.vue]
<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import interactionPlugin from "@fullcalendar/interaction";
  import multiMonthPlugin from "@fullcalendar/multimonth";
  import FullCalendar from "@fullcalendar/vue3";
  import dayjs from "dayjs";
  import type { CalendarOptions } from "@fullcalendar/core";

  const calendarOptions: CalendarOptions = {
    plugins: [multiMonthPlugin, interactionPlugin],
    initialView: "multiMonthYear",
    editable: true,
    dateClick(arg) {
      useSonner("Date clicked", {
        description: dayjs(arg.dateStr).format("dddd, MMMM D, YYYY h:mm A"),
      });
    },
    eventClick(arg) {
      useSonner("Event clicked", {
        description: arg.event.title,
      });
    },
    stickyHeaderDates: true,

    headerToolbar: {
      left: "title",
      center: "",
      right: "prevYear,prev,today,next,nextYear",
    },
    footerToolbar: {
      left: "title",
      center: "",
      right: "prevYear,prev,today,next,nextYear",
    },
    events: [
      {
        title: "Attend Data Protection Act Webinar",
        date: dayjs().add(1, "day").hour(9).toDate(),
        url: "https://ui-thing.behonbaker.com/",
      },
      {
        title: "Travel to Kingston for Manager's Meeting",
        date: dayjs().add(3, "day").hour(10).toDate(),
      },
      {
        title: "Vacation in Montego Bay",
        allDay: true,
        color: "green",
        date: dayjs().add(1, "week").toDate(),
        end: dayjs().add(2, "week").toDate(),
      },
    ],
  };
</script>
```

<!-- /automd -->

::
